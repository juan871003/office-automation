import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';

const Excel = require('exceljs');
const fs = require('fs');
const exec = require('child_process').execFile;
// const XLSX = require('xlsx');
// const xl = require('excel4node');

export async function fillExpensesFile(/** @type {ShipmentEntry[]} */entries, /** @type {String} */expensesFilePath) {
  const excelWriteInfo = [];
  const emptyWorkbook = new Excel.Workbook();
  const workbook = await emptyWorkbook.xlsx.readFile(expensesFilePath);
  // const worksheetName = 'Sheet1';
  const worksheetName = 'Data';
  if (workbook === undefined) return new Error('workbook is undefined');
  const worksheet = workbook.getWorksheet(worksheetName);
  if (worksheet === undefined) return new Error(`worksheet ${worksheetName} is undefined`);
  const rowCount = worksheet.rowCount;
  entries.filter(e => e.addToExcel === true).forEach(entry => {
    const rowFound = getRowNrIfFound(worksheet, entry, rowCount);
    excelWriteInfo.push(buildEntryRow(entry, rowFound.row, !rowFound.found, 'expenses'));
  });

  if (excelWriteInfo.length > 0) {
    return await _fillExpensesFile(excelWriteInfo, expensesFilePath);
  } else {
    return 'No entries to add to the Expenses file';
  }
}

async function _fillExpensesFile(excelWriteInfo, expensesFilePath) {
  const jsonFile = './csharp_excel_app/ConsoleAppModifyExcel/bin/Debug/excelWriteInfo.json';
  const exeFile = './csharp_excel_app/ConsoleAppModifyExcel/bin/Debug/ConsoleAppModifyExcel.exe';
  fs.writeFileSync(jsonFile, JSON.stringify(excelWriteInfo, null, 2));
  const result = new Promise((resolve, reject) => {
    exec(exeFile, [jsonFile, expensesFilePath], (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
  return result;
}

function getRowNrIfFound(
    /** @type {import('exceljs').Worksheet} */ worksheet
    , /** @type {ShipmentEntry} */ entry
    , /** @type {Number} */ rowCount) {
  const entryDate = new Date(entry.deliveryDate).setHours(0, 0, 0, 0);
  for (let i = rowCount - 1; i--; i > 0) {
    if (isDate(worksheet.getCell(`A${i}`).value)) {
      /** @type {Date} */
      const rowDate = worksheet.getCell(`A${i}`).value.setHours(0, 0, 0, 0);
      if (rowDate < entryDate) return {row: i + 1, found: false};
      if (rowDate === entryDate) {
        /** @type {String} */
        const rowEntryNumber = worksheet.getCell(`E${i}`).value;
        if (rowEntryNumber === entry.entryNumber) return {row: i, found: true};
      }
    }
  }
  return {row: rowCount, found: false};
}

function isDate(value) {
  return (value !== null
    && value !== undefined
    && value !== ''
    && Date.parse(value) !== NaN);
}

function buildEntryRow(/** @type {ShipmentEntry} */entry, rowNr, needsSplitting, fileType) {
  if (fileType === 'expenses') {
    return {
      sheetName: 'Data',
      rowNr: rowNr,
      needsSplitting: needsSplitting,
      rowDetails: [
        {column: 'A', value: new Date(entry.deliveryDate).toLocaleDateString(), type: 'date'},
        {column: 'B', value: enums.IntToDayOfWeek[new Date(entry.deliveryDate).getDay()], type: 'string'},
        {column: 'C', value: entry.awb, type: 'string'},
        {column: 'D', value: enums.getSuppNameToCode(entry.supplier), type: 'string'},
        {column: 'E', value: entry.entryNumber, type: 'string'},
        {column: 'I', value: ShipmentEntry.getInsectMsg(entry), type: 'string'},
        {column: 'J', value: entry.comments, type: 'string'},
      ],
    };
  }
}
