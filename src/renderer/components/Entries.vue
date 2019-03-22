<template>
  <div>
    <h1 class="text-center">Entries</h1>
    <div id="actions" class="alert alert-primary">
      <p
        v-if="!isValidEntriesFolder()">
          Please go to Settings and choose a valid Shipment Entries folder
      </p>
      <button 
        v-else @click="addEntries()"
        class="btn btn-primary"
        :class="{disabled : loading}">
          Add Entries
      </button>
      <button 
        v-if="entries && entries.length > 0"
        @click="resetEntries()"
        class="btn btn-primary"
        :class="{disabled : loading}">
          Reset Saved Entries
      </button>
      <button 
        v-if="entries && entries.length > 0"
        @click="loadEntriesDetails(entries)"
        class="btn btn-primary"
        :class="{disabled : loading}">
          Load Entries Details
      </button>
    </div>
    <div id="content">
      <p v-if="!entries || (entries && entries.length) === 0">No entries loaded</p>
      <div v-else>
        <div class="row justify-content-around">
          <div v-for="entry in entries" :key="entry.entryNumber" class="card bg-light col-lg-5 entry-card">
            <div class="card-header" :class="getEntryHeaderClass(entry.status)">
              <h5 class="font-weight-bold text-center">
                {{entry.entryNumber}}
              </h5>
            </div>
            <div class="card-body">
              <div class="card-text">
                <div class="row">
                  <div class="entry-property col-sm-4">Country:</div>
                  <div class="entry-property col-sm-8">
                    <select  
                      v-on:change="changeEntryCountry(entry, $event.target.value)"
                      class="form-control">
                        <option 
                          v-for="country in supplierCountries"
                          :key="country"
                          v-bind:value="country"
                          v-bind:selected="entry.country === country">
                            {{country}}
                        </option>
                    </select>
                  </div>
                  <div class="entry-property col-sm-4">AWB:</div>
                  <div class="entry-property col-sm-8">
                    <input 
                      type="text"
                      readonly
                      class="form-control"
                      :value="entry.awb">
                  </div>
                  <div class="entry-property col-sm-4">Supplier:</div>
                  <div class="entry-property col-sm-8">
                    <select 
                      v-on:change="changeEntrySupplier(entry, $event.target.value)"
                      class="form-control">
                        <option
                          v-for="supplier in supplierCodes"
                          :key="supplier"
                          v-bind:value="supplier"
                          v-bind:selected="entry.supplier === supplier">
                            {{supplier}}
                        </option>
                    </select>
                  </div>
                  <div class="entry-property col-sm-4">Arrival Date:</div>
                  <div class="entry-property col-sm-8">
                    <datepicker 
                      :value="new Date(entry.arrivalDate)"
                      :bootstrap-styling="true"
                      :calendar-button="true"
                      >
                    </datepicker>
                  </div>
                  <div class="entry-property col-sm-4">Delivery Date:</div>
                  <div class="entry-property col-sm-8">
                    <datepicker 
                      :value="new Date(entry.deliveryDate)"
                      :bootstrap-styling="true"
                      :calendar-button="true"
                      >
                    </datepicker>
                  </div>
                  <div class="entry-property col-sm-4">Status:</div>
                  <div class="entry-property col-sm-8">
                    <input 
                      type="text"
                      readonly
                      class="form-control"
                      :value="entry.status">
                  </div>
                  <div class="entry-property col-sm-4">Insect Result:</div>
                  <div class="entry-property col-sm-8">
                    <input  
                      type="text"
                      readonly
                      class="form-control"
                      :value="getInsectsResult(entry)">
                  </div>
                  <div class="entry-property col-sm-4">Comments:</div>
                  <div class="entry-property col-sm-8">
                    <textarea  
                      readonly
                      rows="5"
                      class="form-control"
                      :value="entry.comments">
                    </textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // import ShipmentEntry from '../../business-logic/globals/ShipmentEntry'
  
  import * as entryLogic from '../../business-logic/entry-logic.js';
  import {enums} from '../../business-logic/globals/enums';
  import Datepicker from 'vuejs-datepicker';
  const fs = require('fs');

  export default {
    data: function() {
      return {
        supplierCountries: Object.values(enums.SupplierCountries),
        supplierCodes: Object.values(enums.supplierCodes),
        loading: false,
      };
    },
    computed: {
      entriesFolder: function() {
        return this.$store.state.AppStore.entriesFolder;
      },
      entries: function() {
        return [...this.$store.state.AppStore.shipmentEntries]
            .sort((e1, e2) =>
              e1.entryNumber > e2.entryNumber ?
                1 : e1.entryNumber < e2.entryNumber ?
                  -1 : 0);
      },
    },
    methods: {
      isValidEntriesFolder() {
        return this.entriesFolder &&
          this.entriesFolder.length > 0 &&
          fs.existsSync(this.entriesFolder);
      },
      addEntries() {
        fs.readdir(this.entriesFolder, (err, filenames) => {
          if (err) {
            console.log('error reading dir');
          } else {
            filenames.forEach((filename) => {
              if (filename.indexOf('.htm') > -1) {
                fs.readFile(`${this.entriesFolder}/${filename}`,
                    'utf-8',
                    (err, content) => {
                      if (err) {
                        console.log(`error reading file ${filename}`);
                      } else {
                        const se = entryLogic.initialiseEntryFromDocument(content);
                        if (this.entries.find(
                            entry =>
                              entry.entryNumber === se.entryNumber) !== undefined) {
                          this.$store.dispatch('REPLACE_ENTRY', se);
                        } else {
                          this.$store.dispatch('ADD_ENTRY', se);
                        }
                      }
                    }
                );
              }
            });
          }
        });
      },
      resetEntries() {
        this.$store.dispatch('DELETE_ALL_ENTRIES');
      },
      getInsectsResult(entry) {
        if (entry.isActionable === true) {
          return 'Actionable Insects';
        } else if (entry.isActionable === false && entry.isInsects === true) {
          return 'Non-actionable Insects';
        } else if (entry.isInsects === false) {
          return 'Clean';
        } else {
          return 'Unknown';
        }
      },
      changeEntryCountry(entry, country) {
        this.$store.dispatch('MODIFY_ENTRY', {entry: entry, property: 'country', newValue: country});
      },
      changeEntrySupplier(entry, supplier) {
        this.$store.dispatch('MODIFY_ENTRY', {entry: entry, property: 'supplier', newValue: supplier});
      },
      getEntryHeaderClass(status) {
        switch (status) {
          case enums.EntryStatus.Unknown: return 'text-white bg-secondary';
          case enums.EntryStatus.Active: return 'text-white bg-warning';
          case enums.EntryStatus.Finalised: return 'text-white bg-success';
          default: return 'bg-light';
        }
      },
      loadEntriesDetails(entries) {
        this.loading = true;
        entryLogic.loadEntriesDetails(entries, this.$store).then(() => this.loading = false);
      },
    },
    created() {

    },
    components: {
      Datepicker,
    },
  };
</script>

<style scoped>
  .entry-card {
    margin: 10px;
    padding: 0px;
  }
  #actions > button {
    margin-left: 10px; 
    margin-right: 10px;
  }
  .entry-property {
    margin-top: 5px;
    margin-bottom: 5px; 
  }
</style>
