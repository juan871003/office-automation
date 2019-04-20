import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';
import * as entryLogicExcel from './entry-logic-excel';
import * as entryLogicScraper from './entry-logic-scraper';

const fs = require('fs');
const cheerio = require('cheerio');

export async function processFiles(entriesFolder, store) {
  try {
    const filenames = await new Promise((resolve, reject) => {
      fs.readdir(entriesFolder, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    const newEntries = [];
    for (let i=0; i<filenames.length; i++) {
      const se = await processFilename(filenames[i], entriesFolder);
      if (se) {
        newEntries.push(se);
      }
    }
    store.dispatch('ADD_ENTRIES', newEntries);
    return `${newEntries.length} entries added`;
  } catch (error) {
    return error;
  }
}

async function processFilename(filename, entriesFolder) {
  if (filename.indexOf('.htm') === -1) return null;
  const content = await new Promise((resolve, reject) => {
    fs.readFile(`${entriesFolder}/${filename}`, 'utf-8', (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
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
  const arrivalDateAsDate = new Date(
      c$(`td:contains('Arrival Date')`)
          .parent().children('td:nth-child(2)').text());
  se.arrivalDate = arrivalDateAsDate.toString();
  se.supplier = guessSupplier(se.awb, se.country);
  se.deliveryDate = getDeliveryDate(se.arrivalDate, se.supplier);
  return se;
}

export function deleteAllEntries(store) {
  const screenshotsToDelete =
    store.getters.sortedEntriesCopy
        .map(entry => entry.insectResultsImg)
        .filter(img => img && img.length > 0);
  screenshotsToDelete.forEach(scsFile => {
    if (fs.existsSync(scsFile)) {
      fs.unlinkSync(scsFile);
    }
  });
  store.dispatch('DELETE_ALL_ENTRIES');
}

export async function loadEntriesDetails(/** @type {ShipmentEntry[]} */ entries, store) {
  return await entryLogicScraper.loadEntriesDetails(entries, store);
}

export async function fillExpensesFile(entries, expensesFilePath) {
  return await entryLogicExcel.fillExpensesFile(entries, expensesFilePath);
}

export async function fillResultsFile(entries, resultsFilePath) {
  return await entryLogicExcel.fillResultsFile(entries, resultsFilePath);
}

function getCountry(/** @type {String} */text) {
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
  const arrivalDay = new Date(arrivalDate).getDay();
  const deliveryDay = typeof enums.EntryDeliveryDay[supplier] === 'number'
    ? enums.EntryDeliveryDay[supplier]
    : arrivalDay;
  const daysToAdd = (deliveryDay - arrivalDay) >= 0
    ? (deliveryDay - arrivalDay)
    : (deliveryDay - arrivalDay) + 7;
  const result = new Date(arrivalDate);
  result.setDate(result.getDate() + daysToAdd);
  return result.toString();
}
