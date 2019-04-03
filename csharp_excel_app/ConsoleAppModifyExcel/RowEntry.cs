using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppModifyExcel {

  public class RowDetail {
    [JsonProperty( "column" )]
    public string Column { get; set; }

    [JsonProperty( "value" )]
    public string Value { get; set; }

    [JsonProperty( "type" )]
    public string Type { get; set; }
  }

  public class RowEntry {
    [JsonProperty( "sheetName" )]
    public string SheetName { get; set; }

    [JsonProperty( "rowNr" )]
    public int RowNr { get; set; }

    [JsonProperty( "needsSplitting" )]
    public bool NeedsSplitting { get; set; }

    [JsonProperty( "rowDetails" )]
    public List<RowDetail> RowDetails { get; set; }
  }
}
