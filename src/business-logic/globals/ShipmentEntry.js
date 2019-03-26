import {enums} from './enums';

/**
 * class encapsulating all properties and methods that a Shipment Entry has.
 */
export default class ShipmentEntry {
  constructor() {
    /** @type {String} */
    this.fromDocument = '';
    this.status = enums.EntryStatus.Unknown;
    this.entryNumber = '';
    this.country = enums.SupplierCountries.Unknown;
    this.awb = '';
    /** @type {Date} */
    this.arrivalDate = null;
    /** @type {Date} */
    this.deliveryDate = null;
    this.supplier = enums.supplierCodes.Unknown;
    /** @type {Boolean} */
    this.isInsects = null;
    /** @type {Boolean} */
    this.isActionable = null;
    this.comments = '';
    this.addToExcel = true;
  }
}
