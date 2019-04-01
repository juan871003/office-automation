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
      string file = args.Length > 0 ?
        args[0] :
        "excelWriteInfo.json";
      using (StreamReader sr = new StreamReader( file ) ) {
        string json = sr.ReadToEnd();
        List<RowEntry> rowEntries = JsonConvert.DeserializeObject<List<RowEntry>>(json);
      }

      Excel.Workbook xlbook = null;
      Excel.Application xlApp = null;

      Console.WriteLine( "Done!" );
    }
  }
}
