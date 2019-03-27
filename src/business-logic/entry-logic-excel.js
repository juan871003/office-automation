import ShipmentEntry from './globals/ShipmentEntry';

const Excel = require('exceljs');

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
  return excelWriteInfo;
  // console.log(rowNrFound);
  // return rowNrFound;

  // const dateColumn = worksheet.getRow(1).
  // entries.filter(e => e.addToExcel === true).forEach(entry => {});
  // const dateColumn = worksheet.spliceRows
  // A1643
  /* const lastCell = worksheet.getCell('A1642');
  const lastCellValue = worksheet.getCell('A1642').value;
  const lastCellText = worksheet.getCell('A1642').value; */
  // workbook.xlsx.writeFile(expensesFilePath);
  // return {rowcount: rowCount, lastCellValue: lastCellValue, lastCellText: lastCellText};
}

function getRowNrIfFound(
    /** @type {import('exceljs').Worksheet} */ worksheet
    , /** @type {ShipmentEntry} */ entry
    , /** @type {Number} */ rowCount) {
  const entryDate = new Date(entry.deliveryDate).setHours(0, 0, 0, 0);
  for (let i = rowCount - 1; i--; i > 0) {
    /** @type {Date} */
    const rowDate = worksheet.getCell(`A${i}`).value.setHours(0, 0, 0, 0);
    if (rowDate < entryDate) return {row: i + 1, found: false};
    if (rowDate === entryDate) {
      /** @type {String} */
      const rowEntryNumber = worksheet.getCell(`E${i}`).value;
      if (rowEntryNumber === entry.entryNumber) return {row: i, found: true};
    }
  }
  return {row: rowCount, found: false};
}
