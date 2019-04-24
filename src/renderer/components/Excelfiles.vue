<template>
  <div>
    <h1 class="text-center">Excel Files</h1>
    <div id="actions" class="alert alert-primary">
      <div v-if="!isValidExpensesFile || !isValidResultsFile">
        <p
          v-if="!isValidExpensesFile"
        >Expenses file not found, please go to settings to specify path to expenses Excel file</p>
        <p
          v-if="!isValidResultsFile"
        >Results file not found, please go to settings to specify path to results Excel file</p>
      </div>
      <div v-else>
        <button
          v-if="entries && entries.length > 0"
          @click="!loading && fillExpenses()"
          class="btn btn-primary"
          :class="{disabled: loading}"
        >Fill Expenses Excel File</button>
        <button
          v-if="entries && entries.length > 0"
          @click="!loading && fillInsectResults()"
          class="btn btn-primary"
          :class="{disabled: loading}"
        >Fill Insect Results Excel File</button>
        <button 
          v-if="entries && entries.length > 0"
          @click="!loading && openExcelFolder()"
          class="btn btn-primary"
          :class="{disabled: loading}">
            Open Results Folder
        </button>
      </div>
    </div>
    <div id="content">
      <p v-if="!entries || (entries && entries.length) === 0">No entries loaded</p>
      <div v-else class="row">
        <div 
          v-for="entry in entries" 
          :key="entry.entryNumber" 
          class=" col-lg-12">
          <div class="input-group">
            <div class="input-group-prepend">
              <div class="input-group-text">
                <input 
                  type="checkbox" 
                  :id="'checkbox-' + entry.entryNumber"
                  :class="{disabled: loading}"
                  :checked="entry.addToExcel"
                  @change="!loading && toogleAddToExcel(entry)">
              </div>
            </div>
            <label :for="'checkbox-' + entry.entryNumber" class="label-checkbox col-form-label col-form-label-lg form-control form-control-lg">
              <div class="row">
                <div class="col">{{getFormattedDate(entry.deliveryDate)}}</div>
                <div class="col">{{entry.awb}}</div>
                <div class="col">{{entry.entryNumber}}</div>
                <div class="col">{{entry.supplier}}</div>
                <div class="col">{{entry.status}}</div>
                <div class="col">{{getInsectMsg(entry)}}</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <result-msg v-bind:result="result"
          v-on:reset-result="resetResult"></result-msg>
    </div>
  </div>
</template>

<script>

import ResultMsg from './shared/ResultMsg';
import * as entryLogic from '../../business-logic/entry-logic.js';
import ShipmentEntry from '../../business-logic/globals/ShipmentEntry';

const fs = require('fs');
const path = require('path');
const {shell} = require('electron');

export default {
  components: {ResultMsg},
  data: function() {
    return {
      loading: false,
      result: null,
    };
  },
  computed: {
    entries: function() {
      return this.$store.getters.sortedEntriesCopy;
    },
    isValidExpensesFile: function() {
      const expensesFilePath = this.$store.state.AppStore.expensesExcelFile;
      return (
        expensesFilePath &&
        expensesFilePath.length > 0 &&
        fs.existsSync(expensesFilePath) &&
        path.extname(expensesFilePath) === '.xlsx'
      );
    },
    isValidResultsFile: function() {
      const resultsFilePath = this.$store.state.AppStore.insectResultsExcelFile;
      return (
        resultsFilePath &&
        resultsFilePath.length > 0 &&
        fs.existsSync(resultsFilePath) &&
        path.extname(resultsFilePath) === '.xlsx'
      );
    },
  },
  methods: {
    fillExpenses() {
      const expensesFilePath = this.$store.state.AppStore.expensesExcelFile;
      this.loading = true;
      this.$emit('set-loading', true);
      entryLogic.fillExpensesFile(this.entries, expensesFilePath)
          .then((data) => {
            this.result = data;
            this.loading = false;
            this.$emit('set-loading', false);
          });
    },
    fillInsectResults() {
      const resultsFilePath = this.$store.state.AppStore.insectResultsExcelFile;
      this.loading = true;
      this.$emit('set-loading', true);
      entryLogic.fillResultsFile(this.entries, resultsFilePath)
          .then((data) => {
            this.result = data;
            this.loading = false;
            this.$emit('set-loading', false);
          });
    },
    getInsectMsg(entry) {
      return ShipmentEntry.getInsectMsg(entry);
    },
    toogleAddToExcel(entry) {
      this.$store.dispatch('MODIFY_ENTRY', {entry: entry, property: 'addToExcel', newValue: !entry.addToExcel});
    },
    resetResult() {
      this.result = null;
    },
    getFormattedDate(datestr) {
      return new Date(datestr).toLocaleDateString('en-AU');
    },
    openExcelFolder() {
      const resultsFilePath = this.$store.state.AppStore.insectResultsExcelFile;
      const resultsFolderPath = resultsFilePath.substring(0, resultsFilePath.lastIndexOf('\\'));
      shell.openExternal(resultsFolderPath);
    },
  },
};

</script>

<style scoped>

.label-checkbox {
  overflow: auto;
}

#actions button {
  margin: 10px; 
}

</style>
