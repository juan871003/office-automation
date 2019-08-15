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
      string fileType = args.Length > 2 ?
        args[2] :
        "expenses";
      using( StreamReader sr = new StreamReader( jsonFile ) ) {
        string json = sr.ReadToEnd();
        IEnumerable<ShipmentEntry> entries = JsonConvert.DeserializeObject<IEnumerable<ShipmentEntry>>( json );
        Excel.Application xlApp = null;
        Excel.Workbook xlbook = null;
        Excel.Worksheet xlSheet;
        try {
          xlApp = new Excel.Application() { Visible = false };
          xlbook = xlApp.Workbooks.Open( excelFile );
          int addedEntries = 0;
          foreach( ShipmentEntry entry in
            entries
            .OrderBy( en => en.Supplier ) ) {
            string sheetName =
              fileType == "expenses" ? "Data" :
              fileType == "daffResults" ? TranslateSupplier( entry.Supplier ) :
              "";
            xlSheet = xlbook.Sheets[sheetName];
            int entryRow = PrepareRowForEntry( xlSheet, entry );
            if( entryRow <= 0 ) {
              Console.WriteLine( $"entry {entry.EntryNumber} could not be added to {fileType} file" );
            }
            else {
              switch( fileType ) {
                case "expenses":
                  FillExpensesFile( xlSheet, entry, entryRow );
                  addedEntries++;
                  break;
                case "daffResults":
                  FillDaffResultsFile( xlSheet, entry, entryRow );
                  addedEntries++;
                  break;
              }
            }
          }
          Console.WriteLine($"{addedEntries} Entries Added to {Path.GetFileName(excelFile)}");
        }
        finally {
          if( xlbook != null ) {
            xlbook.Save();
            xlbook.Close();
          }
          if( xlApp != null ) {
            xlApp.Quit();
          }
        }
      }
    }

    private static void FillDaffResultsFile( Excel.Worksheet xlSheet, ShipmentEntry entry, int entryRow ) {
      DateTime deliveryDate = JSDateStringToShortDate(entry.DeliveryDate);
      xlSheet.Cells[entryRow, 1].Value = deliveryDate;
      xlSheet.Cells[entryRow, 2].Value = deliveryDate.DayOfWeek.ToString();
      xlSheet.Cells[entryRow, 3].Value = entry.Awb;
      xlSheet.Cells[entryRow, 4].Value = TranslateSupplier( entry.Supplier );
      xlSheet.Cells[entryRow, 5].Value = entry.EntryNumber;
      if( entry.Status == "Finalised" ) {
        string resultType = "";
        if( entry.IsInsects == true ) {
          resultType = "Insects";
          if( entry.IsDisease == true ) {
            resultType += " and Disease";
          }
        }
        else if( entry.IsInsects == false) {
          if( entry.IsDisease == true ) {
            resultType = "Disease";
          } else {
            resultType = "No Insects";
          }
        }
        if( resultType.Length > 0) {
          xlSheet.Cells[entryRow, 6].Value = resultType;
        }

        if( entry.IsActionableInsects == true || entry.IsActionableDisease == true ) {
          xlSheet.Cells[entryRow, 7].Value = "Actionable";
        }
        else if( entry.IsInsects == true || entry.IsDisease == true) {
          if( entry.IsActionableInsects == false && entry.IsActionableInsects == false ) {
            xlSheet.Cells[entryRow, 7].Value = "Not Actionable";
          }
        }
      }
      if( !string.IsNullOrWhiteSpace( entry.Comments ) ) {
        xlSheet.Cells[entryRow, 10].Value = entry.Comments;
      }
    }

    private static void FillExpensesFile( Excel.Worksheet xlSheet, ShipmentEntry entry, int entryRow ) {
      DateTime deliveryDate = JSDateStringToShortDate(entry.DeliveryDate);
      xlSheet.Cells[entryRow, 1].Value = deliveryDate;
      xlSheet.Cells[entryRow, 2].Value = deliveryDate.DayOfWeek.ToString();
      xlSheet.Cells[entryRow, 3].Value = entry.Awb;
      xlSheet.Cells[entryRow, 4].Value = TranslateSupplier( entry.Supplier );
      xlSheet.Cells[entryRow, 5].Value = entry.EntryNumber;
      if( entry.DaffCharges > 0 ) {
        xlSheet.Cells[entryRow, 6] = entry.DaffCharges;
      }
      if( entry.Status == "Finalised" ) {
        string result = "";
        if( entry.IsInsects == true ) {
          result += "Insects";
          if( entry.IsDisease == true ) {
            result += " and ";
          }
        }
        if( entry.IsDisease == true ) {
          result += "Disease";
        }
        if( result.Length == 0) {
          result = "Clean";
        }
        xlSheet.Cells[entryRow, 9] = result;
      }

      if( !string.IsNullOrWhiteSpace( entry.Comments ) )
        xlSheet.Cells[entryRow, 10] = entry.Comments;
    }

    private static DateTime JSDateStringToShortDate(string jsDateStr) {
      //jsDateStr is something like: "Mon Mar 25 2019 00:00:00 GMT+1100 (AUS Eastern Daylight Time)"
      // we are just interested in the date, e.g. 25/03/2019
      return DateTime.Parse(String.Join(" ", jsDateStr.Split(' ').Take(4)));
    }

    private static int PrepareRowForEntry( Excel.Worksheet xlSheet, ShipmentEntry entry ) {
      int dateColumn = 1,
          entryNrColumn = 5,
          lastColumn = 10;
      if( xlSheet.Cells[2, dateColumn].Value == null ) { return 2; } //table is empty, it may have titles, but no data
      Excel.Range range = xlSheet.UsedRange[1, Type.Missing];
      int lastRow = range.EntireColumn.End[Excel.XlDirection.xlDown].Row;
      DateTime xlDate = new DateTime();
      for( int i = lastRow; i >= 1; i-- ) {
        DateTime.TryParse( xlSheet.Cells[i, dateColumn].Value.ToString(), out xlDate );
        if( xlDate != DateTime.MinValue ) {
          //found = we found the row where this entry should go. either because the row above has an earlier date (data is sorted by date ascending) or because the row has the same date and entry-number that our entry
          //needSpace = we found the row were this entry should be, and the row is occupied by another entry
          DateTime deliveryDate = JSDateStringToShortDate(entry.DeliveryDate);
          bool isSameDate = ( xlDate == deliveryDate ), 
            isSameEntry = ( xlSheet.Cells[i, entryNrColumn].Value != null 
              && xlSheet.Cells[i, entryNrColumn].Value.ToString().Trim( ' ' ).ToUpper() == entry.EntryNumber.Trim( ' ' ).ToUpper() ),
            found = ( deliveryDate > xlDate ) || ( isSameDate && isSameEntry ),
            needSpace = ( i < lastRow && !isSameEntry );
          if( found ) {
            if( needSpace ) MakeSpace( xlSheet, i + 1, lastRow, 1, lastColumn );
            if( !isSameEntry ) return i + 1;
            return i;
          }
        }
      }
      return 0;
    }

    private static void MakeSpace( Excel.Worksheet xlSheet, int entryRow, int lastRow, int fromColumn, int toColumn ) {
      Excel.Range rangeToMove = xlSheet.Range[xlSheet.Cells[entryRow, fromColumn], xlSheet.Cells[lastRow, toColumn]];
      Excel.Range rangeToPaste = xlSheet.Range[xlSheet.Cells[entryRow + 1, fromColumn], xlSheet.Cells[lastRow + 1, toColumn]];
      Excel.Range rangeToClear = xlSheet.Range[xlSheet.Cells[entryRow, fromColumn], xlSheet.Cells[entryRow, toColumn]];
      rangeToMove.Copy( Type.Missing );
      rangeToPaste.PasteSpecial( Excel.XlPasteType.xlPasteAll, Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, Type.Missing, Type.Missing );
      rangeToClear.ClearContents();
    }

    private static string TranslateSupplier( string supplier ) {
      switch( supplier ) {
        case "Finlays": return "FL";
        case "Rolf": return "RF";
        case "World Tropicals": return "WT";
        case "Hock Wee": return "HW";
        case "Thailand Orchids": return "TOF";
        case "Daido Hana": return "DH";
        case "Anze": return "ANZ";
        case "Yunnan Amy": return "AY";
        default: return "Unknown";
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
