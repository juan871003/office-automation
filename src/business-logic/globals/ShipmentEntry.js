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
  get insectsMsg() { // not working, I'm not sure why
    if (this.isActionable === true) {
      return 'Actionable Insects';
    } else if (this.isActionable === false && this.isInsects === true) {
      return 'Non-actionable Insects';
    } else if (this.isInsects === false) {
      return 'Clean';
    } else {
      return 'Unknown';
    }
  }

  static getInsectMsg(entry) {
    if (entry.isActionable === true) {
      return 'Actionable Insects';
    } else if (entry.isActionable === false && entry.isInsects === true) {
      return 'Non-actionable Insects';
    } else if (entry.isInsects === false) {
      return 'Clean';
    } else {
      return 'Unknown';
    }
  }
}
