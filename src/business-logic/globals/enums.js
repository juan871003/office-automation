export const enums = {
  supplierCodes: Object.freeze({
    Unknown: 'Unknown',
    FL: 'Finlays',
    RF: 'Rolf',
    WT: 'World Tropicals',
    HW: 'Hock Wee',
    TOF: 'Thailand Orchids',
    DH: 'Daido Hana',
    ANZ: 'Anzen',
  }),
  getSuppNameToCode(suppName) {
    return Object.keys(this.supplierCodes).find(key => this.supplierCodes[key] === suppName);
  },
  SupplierCountries: Object.freeze({
    Unknown: 'Unknown',
    Malaysia: 'Malaysia',
    Singapore: 'Singapore',
    Thailand: 'Thailand',
    South_Africa: 'South Africa',
    Mauritius: 'Mauritius',
    China: 'China',
  }),
  DaysOfWeek: Object.freeze({
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }),
  get IntToDayOfWeek() {
    return Object.freeze([
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ]);
  },
  EntryStatus: Object.freeze({
    Unknown: 'Unknown',
    Active: 'Active',
    Finalised: 'Finalised',
  }),
  InsectsMsg: Object.freeze({
    Unknown: 'Unknown',
    ActionableInsects: 'Actionable Insects',
    NonActionableInsects: 'Non-actionable Insects',
    Clean: 'Clean',
  }),
  get EntryDeliveryDay() {
    return Object.freeze({
      [this.supplierCodes.FL]: this.DaysOfWeek.Tuesday,
      [this.supplierCodes.RF]: this.DaysOfWeek.Tuesday,
      [this.supplierCodes.WT]: this.DaysOfWeek.Thursday,
      [this.supplierCodes.HW]: this.DaysOfWeek.Thursday,
      [this.supplierCodes.TOF]: this.DaysOfWeek.Thursday,
      [this.supplierCodes.DH]: this.DaysOfWeek.Thursday,
      [this.supplierCodes.ANZ]: this.DaysOfWeek.Monday,
    });
  },
  get EmailTo() {
    return Object.freeze({
      [enums.supplierCodes.FL]: 'juan+electron_FL@procusys.com', // 'rudolph@morgancargo.com, emilius@morgancargo.com, Mampe.Ditshego@flamingo.net',
      [enums.supplierCodes.RF]: 'juan+electron_RF@procusys.com', // 'hoffman@rolfflowers.co.za, sales@rolfflowers.co.za, desiree@rolfflowers.co.za',
      [enums.supplierCodes.WT]: 'juan+electron_WT@procusys.com', // 'gmartin@worldtropicals.mu, SNarayanan@worldtropicals.mu',
      [enums.supplierCodes.HW]: 'juan+electron_HW@procusys.com', // 'staff@hockwee.com, cheewee@hockwee.com, meiling@hockwee.com',
      [enums.supplierCodes.TOF]: 'juan+electron_TOF@procusys.com', // 'sale@thaiorchidvision.com',
      [enums.supplierCodes.DH]: 'juan+electron_DH@procusys.com', // 'daidohana@ymail.com, dhoperation@yahoo.com, katrine_yam@yahoo.com, dhexport@yahoo.com',
      [enums.supplierCodes.ANZ]: 'juan+electron_ANZ@procusys.com', // '',
    });
  },
};
