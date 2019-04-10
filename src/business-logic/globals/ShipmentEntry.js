import {enums} from './enums';

/**
 * class encapsulating all properties and methods that a Shipment Entry has.
 * IMPORTANT: we use object destructuring, so objects of this class are often shallow-copied.
 */
export default class ShipmentEntry {
  constructor() {
    /** @type {String} */
    this.fromDocument = '';
    this.status = enums.EntryStatus.Unknown;
    this.entryNumber = '';
    this.country = enums.SupplierCountries.Unknown;
    this.awb = '';
    this.arrivalDate = '';
    this.deliveryDate = '';
    this.supplier = enums.supplierCodes.Unknown;
    this.daffCharges = 0.0;
    /** @type {Boolean} */
    this.isInsects = null;
    /** @type {Boolean} */
    this.isActionable = null;
    this.comments = '';
    this.addToExcel = true;
  }
  get insectsMsg() { // not working, we use object destructuring. {...entry}
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
      return enums.InsectsMsg.ActionableInsects;
    } else if (entry.isActionable === false && entry.isInsects === true) {
      return enums.InsectsMsg.NonActionableInsects;
    } else if (entry.isInsects === false) {
      return enums.InsectsMsg.Clean;
    } else {
      return enums.InsectsMsg.Unknown;
    }
  }
}
