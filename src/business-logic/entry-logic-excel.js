// import ShipmentEntry from './globals/ShipmentEntry';

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
    excelWriteInfo.push({
      entry: entry,
      rowNr: rowFound.row,
      needsSplitting: !rowFound.found,
    });
  });

  if (excelWriteInfo.length > 0) {
    _fillExpensesFile(excelWriteInfo);
  } else {
    return 'No entries to add to the Expenses file';
  }
}

function _fillExpensesFile(excelWriteInfo) {
  const jsonFile = './csharp_excel_app/ConsoleAppModifyExcel/bin/Debug/excelWriteInfo.json';
  fs.writeFile(
      jsonFile
      , JSON.stringify(excelWriteInfo, null, 2)
      , (err) => {
        if (err) {
          console.log('error writing json file', err);
        } else {
          exec('./csharp_excel_app/ConsoleAppModifyExcel/bin/Debug/ConsoleAppModifyExcel.exe'
              , [jsonFile]
              , (err, data, stdErr) => executeModifyExcel(err, data)
          );
        }
      });

  function executeModifyExcel(err, data) {
    console.log(`error is ${err}`);
    console.log(`data is ${data} ,finish`);
  }
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
