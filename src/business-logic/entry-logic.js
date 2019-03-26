/* eslint-disable max-len */
import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';
import {brokerCredentials} from './credentials';

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Excel = require('exceljs');

export function initialiseEntryFromDocument(content) {
  const c$ = cheerio.load(content);
  const se = new ShipmentEntry();
  const titleStartsWith = 'AIMS Direction for entry ';
  const title = c$('title').text();
  se.entryNumber = title.substring(titleStartsWith.length, title.length);
  const countryStr = c$(`td:contains('Country')`)
      .parent().siblings().last().children().last().text();
  se.country = getCountry(countryStr);
  const awbs = c$(`td:contains('MAWB:')`).text().substring();
  se.awb = awbs.substring(
      awbs.indexOf('MAWB:') + 'MAWB:'.length, awbs.indexOf(',')
  );
  se.arrivalDate = new Date(
      c$(`td:contains('Arrival Date')`)
          .parent().children('td:nth-child(2)').text()
  );
  se.supplier = guessSupplier(se.awb, se.country);
  se.deliveryDate = getDeliveryDate(se.arrivalDate, se.supplier);
  return se;
}

export async function loadEntriesDetails(/** @type {ShipmentEntry[]} */ entries, store) {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await gotoMainPage(page);
  for (let i = 0; i < entries.length; i++) {
    const newPage = await getEntryPage(page, entries[i]);
    const status = await getEntryStatus(newPage);
    store.dispatch('MODIFY_ENTRY', {entry: entries[i], property: 'status', newValue: status});
    if (status === enums.EntryStatus.Finalised) {
      const entryResults = await getEntryResults(newPage);
      store.dispatch('MODIFY_ENTRY', {entry: entries[i], property: 'isInsects', newValue: entryResults.isInsects});
      store.dispatch('MODIFY_ENTRY', {entry: entries[i], property: 'comments', newValue: entryResults.comments});
      store.dispatch('MODIFY_ENTRY', {entry: entries[i], property: 'isActionable', newValue: entryResults.isActionable});
    }
    await newPage.close();
  }
  await page.waitFor(1000);
  await browser.close();
}

export async function fillExpensesFile(entries, expensesFilePath) {
  const emptyWorkbook = new Excel.Workbook();
  const workbook = await emptyWorkbook.xlsx.readFile(expensesFilePath);
  const worksheet = workbook.getWorksheet('Data');
  return worksheet.rowCount;
}

function getCountry(text) {
  switch (text.trim().toLowerCase()) {
    case 'malaysia': return enums.SupplierCountries.Malaysia;
    case 'singapore': return enums.SupplierCountries.Singapore;
    case 'thailand': return enums.SupplierCountries.Thailand;
    case 'south africa': return enums.SupplierCountries.South_Africa;
    case 'mauritius': return enums.SupplierCountries.Mauritius;
    case 'china': return enums.SupplierCountries.China;
    default: return enums.SupplierCountries.Unknown;
  }
}

function guessSupplier(awb, country) {
  if (awb.substring(0, 2).indexOf('081')
      && country === enums.SupplierCountries.South_Africa) {
    return enums.supplierCodes.RF;
  }
  if (awb.substring(0, 2).indexOf('239')
      && country === enums.SupplierCountries.Mauritius) {
    return enums.supplierCodes.WT;
  }
  if (awb.substring(0, 2).indexOf('618')
      && country === enums.SupplierCountries.Singapore) {
    return enums.supplierCodes.HW;
  }
  if (awb.substring(0, 2).indexOf('081')
      && country === enums.SupplierCountries.Thailand) {
    return enums.supplierCodes.TOF;
  }
  if (awb.substring(0, 2).indexOf('843')
      && country === enums.SupplierCountries.Malaysia) {
    return enums.supplierCodes.DH;
  }
  return enums.supplierCodes.Unknown;
}

function getDeliveryDate(arrivalDate, supplier) {
  const arrivalDay = arrivalDate.getDay();
  const deliveryDay = typeof enums.EntryDeliveryDay[supplier] === 'number'
    ? enums.EntryDeliveryDay[supplier]
    : arrivalDay;
  const daysToAdd = (deliveryDay - arrivalDay) >= 0
    ? (deliveryDay - arrivalDay)
    : (deliveryDay - arrivalDay) + 7;
  const result = new Date(arrivalDate);
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

async function gotoMainPage(page) {
  await page.goto('https://apps.daff.gov.au/BrokerReports/ASP/Login.asp');
  await page.click('#username');
  await page.keyboard.type(brokerCredentials.username);
  await page.click('#password');
  await page.keyboard.type(brokerCredentials.password);
  await page.click('input[name="btnSubmit"]');
  await page.goto('https://apps.daff.gov.au/BrokerReports/asp/SingleEntry.asp');
}

async function getEntryPage(page, entry) {
  await page.waitForSelector('#txtEntry');
  await page.click('#txtEntry', {clickCount: 3});
  await page.keyboard.type(entry.entryNumber);
  const newPagePromise = new Promise(x => page.browser().once('targetcreated', target => x(target.page())));
  await page.click('input[name="btnSubmit"]');
  return await newPagePromise;
}

async function getEntryStatus(newPage) {
  const statusXpath = '//td/b[text()="Status:"]/../following-sibling::td[1]';
  await newPage.waitForXPath(statusXpath);
  const statusHandle = await newPage.$x(statusXpath);
  const status = await newPage.evaluate(statusEl => statusEl.textContent, statusHandle[0]);
  await statusHandle[0].dispose();
  return status;
}

async function getEntryResults(newPage) {
  await newPage.waitForXPath('//i[text()="Total Services:"]');
  const pendingInsectsElHandle = await newPage.$x('//a[text()="Pending Insect ID"]');
  const fumigationElHandle = await newPage.$x('//a[text()="CH3Br 32gM3 2 hrs 21C or above"]');
  const results = {
    isInsects: false,
    isActionable: false,
    comments: '',
  };
  if (pendingInsectsElHandle.length === 1) {
    results.isInsects = true;
    results.comments = await getInsectsContent(newPage, pendingInsectsElHandle);
    await pendingInsectsElHandle[0].dispose();
    if (fumigationElHandle.length === 1 && isOfBioConcern(results.comments)) {
      results.isActionable = true;
    }
  }
  return results;
}

function isOfBioConcern(/** @type {String} */ str) {
  const bioCon = (str.match(/of biosecurity concern/gi) || []).length;
  const notOfBioCon = (str.match(/not of biosecurity concern/gi) || []).length;
  return bioCon > notOfBioCon;
}

async function getInsectsContent(newPage, pendingInsectsElHandle) {
  const commentsXpath = '//td/b[text()="Standard Comments:"]/../following-sibling::td[1]';
  const newNewPagePromise = new Promise(x => newPage.browser().once('targetcreated', target => x(target.page())));
  const pendingInsectsLinkEl = await pendingInsectsElHandle[0];
  await pendingInsectsLinkEl.click();
  const newnewPage = await newNewPagePromise;
  await newnewPage.waitForXPath(commentsXpath);
  const commentsHandle = await newnewPage.$x(commentsXpath);
  const comments = await newnewPage.evaluate(commentsEl => commentsEl.textContent, commentsHandle[0]);
  await commentsHandle[0].dispose();
  return comments;
}
