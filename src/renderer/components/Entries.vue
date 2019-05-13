<template>
  <div>
    <h1 class="text-center">Entries</h1>
    <div id="actions" class="alert alert-primary">
      <p
        v-if="!isValidEntriesFolder()">
          Please go to Settings and choose a valid Shipment Entries folder
      </p>
      <button 
        v-else 
        @click="!loading && addEntries()"
        class="btn btn-primary"
        :class="{disabled: loading}">
          Add Entries
      </button>
      <button 
        v-if="entries && entries.length > 0"
        @click="!loading && resetEntries()"
        class="btn btn-primary"
        :class="{disabled: loading}">
          Reset Saved Entries
      </button>
      <button 
        v-if="entries && entries.length > 0"
        @click="!loading && loadEntriesDetails(entries)"
        class="btn btn-primary"
        :class="{disabled: loading}">
          Load Entries Details
      </button>
      <button 
        v-if="entries && entries.length > 0"
        @click="!loading && openEntriesFolder()"
        class="btn btn-primary"
        :class="{disabled: loading}">
          Open Entries Folder
      </button>
    </div>
    <div id="content">
      <p v-if="!entries || (entries && entries.length === 0)">No entries loaded</p>
      <div v-else>
        <result-msg v-bind:result="result"
            v-on:reset-result="resetResult"></result-msg>
        <div class="row justify-content-around">
          <div 
            v-for="entry in entries" 
            :key="entry.entryNumber" 
            class="card bg-light col-lg-5 entry-card">

            <div class="card-header" :class="getEntryHeaderClass(entry)">
              <button type="button" class="pull-right clickable close" aria-label="Close" @click="removeEntry(entry)">
                <span aria-hidden="true">&times;</span>
              </button>
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
                      v-on:change="modifyEntry(entry, 'country', $event.target.value)"
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
                      v-on:change="modifyEntry(entry, 'supplier', $event.target.value)"
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
                      @selected="modifyEntry(entry, 'arrivalDate', $event)"
                      >
                    </datepicker>
                  </div>
                  <div class="entry-property col-sm-4">Delivery Date:</div>
                  <div class="entry-property col-sm-8">
                    <datepicker 
                      :value="new Date(entry.deliveryDate)"
                      :bootstrap-styling="true"
                      :calendar-button="true"
                      @selected="modifyEntry(entry, 'deliveryDate', $event)"
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
                  <div class="entry-property col-sm-4">DAFF Charges:</div>
                  <div class="entry-property col-sm-8">
                    <input 
                      type="text"
                      readonly
                      class="form-control"
                      :value="'$' + entry.daffCharges">
                  </div>
                  <div class="entry-property col-sm-4">Results:</div>
                  <div class="entry-property col-sm-8">
                    <input  
                      type="text"
                      readonly
                      class="form-control"
                      :value="getResultsMsg(entry)">
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
  
  import ResultMsg from './shared/ResultMsg';
  import * as entryLogic from '../../business-logic/entry-logic.js';
  import {enums} from '../../business-logic/globals/enums';
  import Datepicker from 'vuejs-datepicker';
  import ShipmentEntry from '../../business-logic/globals/ShipmentEntry';
  const fs = require('fs');
  const {shell} = require('electron');

  export default {
    components: {
      Datepicker,
      ResultMsg,
    },
    data: function() {
      return {
        supplierCountries: Object.values(enums.SupplierCountries),
        supplierCodes: Object.values(enums.supplierCodes),
        loading: false,
        result: null,
      };
    },
    computed: {
      entriesFolder: function() {
        return this.$store.state.AppStore.entriesFolder;
      },
      entries: function() {
        return this.$store.getters.sortedEntriesCopy;
      },
    },
    methods: {
      isValidEntriesFolder() {
        return this.entriesFolder &&
          this.entriesFolder.length > 0 &&
          fs.existsSync(this.entriesFolder);
      },
      addEntries() {
        this.resetResult();
        this.loading = true;
        this.$emit('set-loading', true);
        entryLogic.processFiles(this.entriesFolder, this.$store)
            .then((result) => {
              this.result = result;
              this.loading = false;
              this.$emit('set-loading', false);
            });
      },
      resetEntries() {
        this.resetResult();
        entryLogic.deleteAllEntries(this.$store);
      },
      modifyEntry(entry, entryProp, newValue) {
        this.$store.dispatch('MODIFY_ENTRY', {entry: entry, property: entryProp, newValue: newValue});
      },
      getEntryHeaderClass(entry) {
        const statusClass = (status) => {
          switch (status) {
            case enums.EntryStatus.Unknown: return 'text-white bg-secondary';
            case enums.EntryStatus.Active: return 'text-white bg-warning';
            case enums.EntryStatus.Finalised: return 'text-white bg-success test';
            default: return 'bg-light';
          }
        };
        const insectResultsClass = (entry) => {
          if (entry.isActionableInsects === true
              || entry.isActionableDisease === true) {
            return ' header-actionable-insects';
          }
          if (entry.isInsects || entry.isDisease) {
            return ' header-non-actionable-insects';
          }
          return ' header-no-insects';
        };
        return statusClass(entry.status) + insectResultsClass(entry);
      },
      loadEntriesDetails(entries) {
        this.resetResult();
        this.loading = true;
        this.$emit('set-loading', true);
        entryLogic.loadEntriesDetails(entries, this.$store)
            .then((result) => {
              this.result = result;
              this.loading = false;
              this.$emit('set-loading', false);
            });
      },
      getResultsMsg(entry) {
        return ShipmentEntry.getResultsMsg(entry);
      },
      resetResult() {
        this.result = null;
      },
      removeEntry(entry) {
        this.resetResult();
        this.$store.dispatch('REMOVE_ENTRY', entry.entryNumber);
      },
      openEntriesFolder() {
        this.resetResult();
        shell.openExternal(this.entriesFolder);
      },
    },
    created() {

    },
  };
</script>

<style scoped>
  .entry-card {
    margin: 10px;
    padding: 0px;
  }
  #actions button {
    margin: 10px; 
  }
  .entry-property {
    margin-top: 5px;
    margin-bottom: 5px; 
  }
  .header-actionable-insects {
    border: 2px solid #dc3545;
  }
  .header-non-actionable-insects {
    border: 2px solid #ffc107;
  }
  .header-no-insects {
    border: 2px solid #17a2b8;
  }
</style>
