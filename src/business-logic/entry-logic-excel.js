import ShipmentEntry from './globals/ShipmentEntry';
// import { enums } from './globals/enums';

const fs = require('fs');
const exec = require('child_process').execFile;

export async function fillExpensesFile(
    /** @type {ShipmentEntry[]} */entries,
    /** @type {String} */expensesFilePath) {
  return await fillFile(entries, expensesFilePath, 'expenses');
}

export async function fillResultsFile(
    /** @type {ShipmentEntry[]} */entries,
    /** @type {String} */resultsFilePath) {
  return await fillFile(entries, resultsFilePath, 'daffResults');
}

async function fillFile(
    /** @type {ShipmentEntry[]} */entries,
    /** @type {String} */filePath,
    /** @type {String} */fileType) {
  if (!fs.existsSync(filePath)) {
    return `file doesn't exist ${filePath}`;
  }
  return await writeExcel(
      entries.filter(e => e.addToExcel === true),
      filePath,
      fileType);
}

async function writeExcel(
    /** @type {ShipmentEntry[]} */entries,
    /** @type {String} */filePath,
    /** @type {String} */fileType) {
  const jsonFile = './csharp_excel_app/ConsoleAppModifyExcel/bin/Debug/excelWriteInfo.json';
  const exeFile = './csharp_excel_app/ConsoleAppModifyExcel/bin/Debug/ConsoleAppModifyExcel.exe';
  fs.writeFileSync(jsonFile, JSON.stringify(entries, null, 2));
  return new Promise((resolve, reject) => {
    exec(exeFile, [jsonFile, filePath, fileType], (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}
