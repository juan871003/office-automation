using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppModifyExcel {

  public class ShipmentEntry {
    [JsonProperty( "fromDocument" )]
    public string FromDocument { get; set; }

    [JsonProperty( "status" )]
    public string Status { get; set; }

    [JsonProperty( "entryNumber" )]
    public string EntryNumber { get; set; }

    [JsonProperty( "country" )]
    public string Country { get; set; }

    [JsonProperty( "awb" )]
    public string Awb { get; set; }

    [JsonProperty( "arrivalDate" )]
    public string ArrivalDate { get; set; }

    [JsonProperty( "deliveryDate" )]
    public string DeliveryDate { get; set; }

    [JsonProperty( "supplier" )]
    public string Supplier { get; set; }

    [JsonProperty( "daffCharges" )]
    public float DaffCharges { get; set; }

    [JsonProperty( "isInsects" )]
    public bool? IsInsects { get; set; }

    [JsonProperty( "isActionable" )]
    public bool? IsActionable { get; set; }

    [JsonProperty( "comments" )]
    public string Comments { get; set; }

    [JsonProperty( "addToExcel" )]
    public bool? AddToExcel { get; set; }
  }
}
