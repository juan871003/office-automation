import {enums} from './enums';

/**
 * class encapsulating all properties and methods that a Shipment Entry has.
 */
export default class ShipmentEntry {
  constructor() {
    this.fromDocument = '';
    this.status = enums.EntryStatus.Unknown;
    this.entryNumber = '';
    this.country = enums.SupplierCountries.Unknown;
    this.awb = '';
    this.arrivalDate = null; // Date
    this.deliveryDate = null; // Date
    this.supplier = enums.supplierCodes.Unknown;
    this.isInsects = null; // bool
    this.isActionable = null; // bool
    this.comments = '';
  }
}
