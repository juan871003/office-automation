<template>
  <div>
    <h1 class="text-center">Settings</h1>
    <div class="list-group">
      <div class="list-group-item border-secondary">
        <h5 class="text-center">Folder that contains the Entry Numbers in HTM format</h5>
        <p>Current path is {{ entriesFolder || 'not set' }}</p>
        <input  type="file" 
                class="form-control-file col-sm-9"               
                id="input-entry-number-folder"
                webkitdirectory 
                @change="setInputEntryNumberFolder($event)">
      </div>
      <div class="list-group-item border-secondary">
        <h5 class="text-center">Excel Expenses File</h5>
        <p>Current Excel Expenses file is {{ expensesFilePath || 'not set' }}</p>
        <input  type="file" 
                class="form-control-file col-sm-9"               
                id="input-expenses-file"
                accept=".xlsx" 
                @change="setExpensesFilePath($event)">
      </div>
      <div class="list-group-item border-secondary">
        <h5 class="text-center">Excel Insect Results File</h5>
        <p>Current Excel Insect Results file is {{ resultsFilePath || 'not set' }}</p>
        <input  type="file" 
                class="form-control-file col-sm-9"               
                id="input-expenses-file"
                accept=".xlsx" 
                @change="setInsectResultsFilePath($event)">
      </div>
    </div>
  </div>
</template>

<script>
  // import { remote } from 'electron'

  const fs = require('fs');
  const path = require('path');

  export default {
    data() {
      return {
        entriesFolder: this.$store.state.AppStore.entriesFolder,
        expensesFilePath: this.$store.state.AppStore.expensesExcelFile,
        resultsFilePath: this.$store.state.AppStore.insectResultsExcelFile,
      };
    },
    methods: {
      setInputEntryNumberFolder: function(event) {
        const pathStr = event.target.files[0] ? event.target.files[0].path : null;
        const thePath = getPathIfExists(pathStr);
        if (thePath) {
          this.entriesFolder = thePath;
          this.$store.dispatch('SET_ENTRIES_FOLDER', thePath);
        }
      },
      setExpensesFilePath: function(event) {
        const pathStr = event.target.files[0] ? event.target.files[0].path : null;
        const thePath = getPathIfExists(pathStr, '.xlsx');
        if (thePath) {
          this.expensesFilePath = thePath;
          this.$store.dispatch('SET_EXPENSES_FILEPATH', thePath);
        }
      },
      setInsectResultsFilePath: function(event) {
        const pathStr = event.target.files[0] ? event.target.files[0].path : null;
        const thePath = getPathIfExists(pathStr, '.xlsx');
        if (thePath) {
          this.resultsFilePath = thePath;
          this.$store.dispatch('SET_INSECTRESULTS_FILEPATH', thePath);
        }
      },
    },
  };

  function getPathIfExists(thePath, extension) {
    const isValidPath = thePath && fs.existsSync(thePath);
    const isValidExt = isValidPath &&
      (!extension || (extension && path.extname(thePath) === extension));
    return (isValidPath && isValidExt) ? thePath : null;
  }

</script>

<style scoped>
</style>
