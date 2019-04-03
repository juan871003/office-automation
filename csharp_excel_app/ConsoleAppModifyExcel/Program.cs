using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Excel = Microsoft.Office.Interop.Excel;

namespace ConsoleAppModifyExcel {
  class Program {
    static void Main( string[] args ) {
      string jsonFile = args.Length > 0 ?
        args[0] :
        "excelWriteInfo.json";
      string excelFile = args.Length > 1 ?
        args[1] :
        "C:/Users/juan8/Desktop/TestExpenses.xlsx";
      using( StreamReader sr = new StreamReader( jsonFile ) ) {
        string json = sr.ReadToEnd();
        IEnumerable<RowEntry> rowEntries = JsonConvert.DeserializeObject<IEnumerable<RowEntry>>(json);
        Excel.Application xlApp = new Excel.Application() { Visible = false };
        Excel.Workbook xlbook = xlApp.Workbooks.Open( excelFile );
        Excel.Worksheet xlSheet = xlbook.Sheets[1];
        rowEntries
          .OrderBy(r => r.SheetName)
          .OrderByDescending(r => r.RowNr)
          .ToList()
          .ForEach( rowEntry => {
            if( xlSheet.Name != rowEntry.SheetName ) {
              xlSheet = xlbook.Worksheets[rowEntry.SheetName];
            }
            if( rowEntry.NeedsSplitting ) {
              MakeSpace( xlSheet, rowEntry.RowNr );
            }
            rowEntry.RowDetails.ForEach( rowDetail => {
              string cellAddress = $"{rowDetail.Column}{rowEntry.RowNr}";
              dynamic value = rowDetail.Value;
              switch( rowDetail.Type ) {
                case "date":
                  value = DateTime.Parse( rowDetail.Value ); break;
                case "money":
                  value = float.Parse( rowDetail.Value ); break;
              }
              xlSheet.Range[cellAddress].Value = value;
            } );
          } );
        xlbook.Save();
        xlbook.Close();
        xlApp.Quit();
        Console.WriteLine( $"{rowEntries.Count()} Entries Added to ${excelFile}" );
      }


    }
    public static void MakeSpace( Excel.Worksheet xlSheet, int rowNr ) {
      Excel.Range last = xlSheet.Cells.SpecialCells(Excel.XlCellType.xlCellTypeLastCell, Type.Missing);
      int lastRow = last.Row;
      int lastColumn = last.Column;
      Excel.Range rangeToMove = xlSheet.Range[xlSheet.Cells[rowNr, 1], xlSheet.Cells[lastRow, lastColumn]];
      Excel.Range rangeToPaste = xlSheet.Range[xlSheet.Cells[rowNr + 1, 1], xlSheet.Cells[lastRow + 1, lastColumn]];
      Excel.Range rangeToClear = xlSheet.Range[xlSheet.Cells[rowNr, 1], xlSheet.Cells[rowNr, lastColumn]];
      rangeToMove.Copy( Type.Missing );
      rangeToPaste.PasteSpecial( Excel.XlPasteType.xlPasteAll, Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, Type.Missing, Type.Missing );
      rangeToClear.ClearContents();
    }
  }
}
