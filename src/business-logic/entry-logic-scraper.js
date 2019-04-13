import {brokerCredentials} from './credentials';
import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';

const puppeteer = require('puppeteer');
const path = require('path');

export async function loadEntriesDetails(/** @type {ShipmentEntry[]} */ entries, store) {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await gotoMainPage(page);
  for (let i = 0; i < entries.length; i++) {
    const newPage = await getEntryPage(page, entries[i]);
    /** @type {ShipmentEntry} */
    const entryCpy = {...entries[i]};
    entryCpy.status = await getEntryStatus(newPage);
    entryCpy.daffCharges = await getEntryTotal(newPage);
    if (entryCpy.status === enums.EntryStatus.Finalised) {
      const entryResults = await getEntryResults(newPage, entries[i].entryNumber);
      entryCpy.isInsects = entryResults.isInsects;
      entryCpy.comments = entryResults.comments;
      entryCpy.isActionable = entryResults.isActionable;
      entryCpy.insectResultsImg = entryResults.insectResultsImg;
    }
    store.dispatch('REPLACE_ENTRY', entryCpy);
    await newPage.close();
  }
  await page.waitFor(1000);
  await browser.close();
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

async function getEntryTotal(newPage) {
  const totalXpath = '//tr/td/i[text()="Total Services:"]/../following-sibling::td[1]';
  await newPage.waitForXPath(totalXpath);
  const totalHandle = await newPage.$x(totalXpath);
  const totalStr = await newPage.evaluate(totalEl => totalEl.textContent, totalHandle[0]);
  await totalHandle[0].dispose();
  return Number(totalStr.replace(/[^0-9.-]+/g, ''));
}

async function getEntryResults(newPage, entryNumber) {
  await newPage.waitForXPath('//i[text()="Total Services:"]');
  const pendingInsectsElHandle = await newPage.$x('//a[text()="Pending Insect ID"]');
  const fumigationElHandle = await newPage.$x('//a[text()="CH3Br 32gM3 2 hrs 21C or above"]');
  const results = {
    isInsects: null,
    isActionable: null,
    comments: '',
    insectResultsImg: '',
  };
  const status = await getEntryStatus(newPage);
  if (status !== enums.EntryStatus.Finalised) {
    return results;
  }
  results.isInsects = (pendingInsectsElHandle.length === 1);
  if (pendingInsectsElHandle.length === 1) {
    const insectsContent = await getInsectsContent(newPage, pendingInsectsElHandle, entryNumber);
    results.comments = insectsContent.comments;
    results.insectResultsImg = insectsContent.insectResultsImg;
    await pendingInsectsElHandle[0].dispose();
  }
  if (fumigationElHandle.length === 1) {
    results.isActionable = isOfBioConcern(results.comments);
    await fumigationElHandle[0].dispose();
  } else {
    results.isActionable = false;
  }
  return results;
}

function isOfBioConcern(/** @type {String} */ str) {
  const bioCon = (str.match(/of biosecurity concern/gi) || []).length;
  const notOfBioCon = (str.match(/not of biosecurity concern/gi) || []).length;
  return bioCon > notOfBioCon;
}

async function getInsectsContent(newPage, pendingInsectsElHandle, entryNumber) {
  const sCommentsXpath = '//td/b[text()="Standard Comments:"]/../following-sibling::td[1]';
  const dCommentsXpath = '//td/b[text()="Direction Comments:"]/../following-sibling::td[1]';
  const newNewPagePromise = new Promise(x => newPage.browser().once('targetcreated', target => x(target.page())));
  const pendingInsectsLinkEl = await pendingInsectsElHandle[0];
  await pendingInsectsLinkEl.click();
  const newnewPage = await newNewPagePromise;
  await newnewPage.waitForXPath(sCommentsXpath);
  const sCommentsHandle = await newnewPage.$x(sCommentsXpath);
  const dCommentsHandle = await newnewPage.$x(dCommentsXpath);
  let comments = await newnewPage.evaluate(commentsEl => commentsEl.textContent, sCommentsHandle[0]);
  comments += '\n' + await newnewPage.evaluate(commentsEl => commentsEl.textContent, dCommentsHandle[0]);
  const imgPath = `./src/business-logic/screenshots/insect-resuts-${entryNumber}.png`;
  newnewPage.screenshot({path: imgPath});
  await sCommentsHandle[0].dispose();
  await dCommentsHandle[0].dispose();
  return {comments: comments, insectResultsImg: path.resolve(imgPath)};
}
