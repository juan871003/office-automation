import {brokerCredentials} from './credentials';
import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';

const puppeteer = require('puppeteer');
const path = require('path');

export async function loadEntriesDetails(/** @type {ShipmentEntry[]} */ entries, store) {
  try {
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
        entryCpy.isActionableInsects = entryResults.isActionableInsects;
        entryCpy.isDisease = entryResults.isDisease;
        entryCpy.isActionableDisease = entryResults.isActionableDisease;
        entryCpy.comments = entryResults.comments;
        entryCpy.resultsImgs = entryResults.resultsImgs;
      }
      store.dispatch('REPLACE_ENTRY', entryCpy);
      await newPage.close();
    }
    await page.waitFor(1000);
    await browser.close();
    return `${entries.length} Entry Details Loaded`;
  } catch (err) {
    return (err && err.message) ? err.message : err;
  }
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
  // wait for target created for 30 seconds, not forever.
  const newPagePromise =
    Promise.race([
      new Promise(x => page.browser().once('targetcreated', target => x(target.page()))),
      waitUntil(30),
    ]);
  await page.click('input[name="btnSubmit"]');
  return await newPagePromise;
}

async function getEntryStatus(newPage) {
  const statusXpath = '//td/b[text()="Status:"]/../following-sibling::td[1]';
  await newPage.waitForXPath(statusXpath);
  const statusHandle = await newPage.$x(statusXpath);
  const status = await newPage.evaluate(statusEl => statusEl.textContent, statusHandle[0]);
  await disposeHandle(statusHandle);
  return status;
}

async function getEntryTotal(newPage) {
  const totalXpath = '//tr/td/i[text()="Total Services:"]/../following-sibling::td[1]';
  await newPage.waitForXPath(totalXpath);
  const totalHandle = await newPage.$x(totalXpath);
  const totalStr = await newPage.evaluate(totalEl => totalEl.textContent, totalHandle[0]);
  await disposeHandle(totalHandle);
  return Number(totalStr.replace(/[^0-9.-]+/g, ''));
}

async function getEntryResults(newPage, entryNumber) {
  await newPage.waitForXPath('//i[text()="Total Services:"]');
  const pendingInsectsElHandle = await newPage.$x('//a[text()="Pending Insect ID"]');
  const pendingDiseaseElHandle = await newPage.$x('//a[text()="Pending Test Results"]');
  const fumigationElHandle = await newPage.$x('//a[text()="CH3Br 32gM3 2 hrs 21C or above"]');
  const results = {
    isInsects: null,
    isDisease: null,
    isActionableInsects: null,
    isActionableDisease: null,
    comments: '',
    resultsImgs: [],
  };
  const status = await getEntryStatus(newPage);
  if (status !== enums.EntryStatus.Finalised) {
    return results;
  }
  results.isInsects = (pendingInsectsElHandle.length >= 1);
  results.isActionableInsects = false;
  if (pendingInsectsElHandle.length >= 1) {
    const insectsContent = await getCommentsContent(newPage, pendingInsectsElHandle, entryNumber, 'insects');
    results.comments += insectsContent.comments + '\n';
    results.isActionableInsects = isOfBioConcern(insectsContent.comments);
    results.resultsImgs.push(insectsContent.resultsImg);
  }
  results.isDisease = (pendingDiseaseElHandle.length >= 1);
  results.isActionableDisease = false;
  if (pendingDiseaseElHandle.length >= 1) {
    const diseaseContent = await getCommentsContent(newPage, pendingDiseaseElHandle, entryNumber, 'disease');
    results.comments += diseaseContent.comments + '\n';
    results.isActionableDisease = isOfBioConcern(diseaseContent.comments);
    results.resultsImgs.push(diseaseContent.resultsImg);
  }
  await disposeHandle(pendingInsectsElHandle);
  await disposeHandle(pendingDiseaseElHandle);
  await disposeHandle(fumigationElHandle);
  return results;
}

function isOfBioConcern(/** @type {String} */ str) {
  const bioCon = (str.match(/of biosecurity concern/gi) || []).length;
  const notOfBioCon = (str.match(/not of biosecurity concern/gi) || []).length;
  return bioCon > notOfBioCon;
}

async function getCommentsContent(newPage, elHandle, entryNumber, type) {
  const sCommentsXpath = '//td/b[text()="Standard Comments:"]/../following-sibling::td[1]';
  const dCommentsXpath = '//td/b[text()="Direction Comments:"]/../following-sibling::td[1]';
  const targetCreatedPromise = new Promise(x =>
    newPage.browser().once('targetcreated', target => x(target.page())));
  // wait for targetcreated for 30 seconds, not forever.
  const thirdPagePromise =
    Promise.race([targetCreatedPromise, waitUntil(30)]);
  const linkEl = await elHandle[0];
  await linkEl.click();
  const thirdPage = await thirdPagePromise;
  await thirdPage.waitForXPath(sCommentsXpath);
  const sCommentsHandle = await thirdPage.$x(sCommentsXpath);
  const dCommentsHandle = await thirdPage.$x(dCommentsXpath);
  let comments = await thirdPage.evaluate(commentsEl => commentsEl.textContent, sCommentsHandle[0]);
  comments += '\n' + await thirdPage.evaluate(commentsEl => commentsEl.textContent, dCommentsHandle[0]);
  const imgPath = `./src/business-logic/screenshots/${type}-resuts-${entryNumber}.png`;
  await thirdPage.screenshot({path: imgPath});
  await disposeHandle(sCommentsHandle);
  await disposeHandle(dCommentsHandle);
  await thirdPage.close();
  return {comments: comments, resultsImg: path.resolve(imgPath)};
}

async function waitUntil(seconds) {
  return new Promise((resolve, reject) => {
    const wait = setTimeout(() => {
      clearTimeout(wait);
      reject(new Error(`timeout reached, waiting for ${seconds} seconds`));
    }, seconds * 1000);
  });
}

async function disposeHandle(handle) {
  if (handle) {
    for (let i = 0; i < handle.length; i++) {
      await handle[i].dispose();
    }
  }
}
