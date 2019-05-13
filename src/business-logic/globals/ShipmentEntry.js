import {enums} from './enums';

/**
 * class encapsulating all properties and methods that a Shipment Entry has.
 * IMPORTANT: we use object destructuring, so objects of this class are often shallow-copied.
 */
export default class ShipmentEntry {
  constructor() {
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
    this.isActionableInsects = null;
    /** @type {Boolean} */
    this.isDisease = null;
    /** @type {Boolean} */
    this.isActionableDisease = null;
    this.comments = '';
    this.addToExcel = true;
    this.resultsImgs = [];
  }

  static getResultsMsg(entry) {
    const isAnyNull = (entry.isInsects === null
      || entry.isActionableInsects === null
      || entry.isDisease === null
      || entry.isActionableDisease === null);
    const isAllFalse = (entry.isInsects === false
      && entry.isActionableInsects === false
      && entry.isDisease === false
      && entry.isActionableDisease === false);
    const isMultiple = (entry.isInsects && entry.isDisease);
    if (isAnyNull) {
      return enums.ResultsMsg.Unknown;
    } else if (isAllFalse) {
      return enums.ResultsMsg.Clean;
    } else {
      let msg = '';
      if (entry.isInsects) {
        msg = entry.isActionableInsects ?
          enums.ResultsMsg.Actionable :
          enums.ResultsMsg.NonActionable;
        msg += ` ${enums.ResultsMsg.Insects}`;
      }
      if (isMultiple) {
        msg += ' and ';
      }
      if (entry.isDisease) {
        msg += entry.isActionableDisease ?
            enums.ResultsMsg.Actionable :
            enums.ResultsMsg.NonActionable;
        msg += ` ${enums.ResultsMsg.Disease}`;
      }
      return msg;
    }
  }

  static getFormatedDate(entryDate) {
    return new Date(entryDate).toDateString();
  }
}
