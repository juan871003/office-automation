using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppModifyExcel {
  public class Entry {
    [JsonProperty( "addToExcel" )]
    public bool AddToExcel { get; set; }

    [JsonProperty( "arrivalDate" )]
    public DateTime ArrivalDate { get; set; }

    [JsonProperty( "awb" )]
    public string Awb { get; set; }

    [JsonProperty( "comments" )]
    public string Comments { get; set; }

    [JsonProperty( "country" )]
    public string Country { get; set; }

    [JsonProperty( "deliveryDate" )]
    public DateTime DeliveryDate { get; set; }

    [JsonProperty( "entryNumber" )]
    public string EntryNumber { get; set; }

    [JsonProperty( "fromDocument" )]
    public string FromDocument { get; set; }

    [JsonProperty( "isActionable" )]
    public bool IsActionable { get; set; }

    [JsonProperty( "isInsects" )]
    public bool IsInsects { get; set; }

    [JsonProperty( "status" )]
    public string Status { get; set; }

    [JsonProperty( "supplier" )]
    public string Supplier { get; set; }
  }

  public class RowEntry {
    [JsonProperty( "entry" )]
    public Entry Entry { get; set; }

    [JsonProperty( "rowNr" )]
    public int RowNr { get; set; }

    [JsonProperty( "needsSplitting" )]
    public bool NeedsSplitting { get; set; }
  }
}
