<template>
  <div>
    <h1 class="text-center">Excel Files</h1>
    <div id="actions" class="alert alert-primary">
      <div v-if="!isValidExpensesFile || !isValidResultsFile">
        <p v-if="!isValidExpensesFile">
          Expenses file not found, please go to settings to specify path to expenses Excel file
        </p>
        <p v-if="!isValidResulsFile">
          Results file not found, please go to settings to specify path to results Excel file
        </p>
      </div>
      <div v-else>
        <button
          v-if="entries && entries.length > 0"
          @click="fillExpenses()"
          class="btn btn-primary"
          :class="{disabled : loading}"
        >Fill Expenses Excel File</button>
        <button
          v-if="entries && entries.length > 0"
          @click="fillInsectResults()"
          class="btn btn-primary"
          :class="{disabled : loading}"
        >Fill Insect Results Excel File</button>
        <button
          v-if="entries && entries.length > 0"
          @click="saveAndCloseFiles()"
          class="btn btn-primary"
          :class="{disabled : loading}"
        >Save and Close Files</button>
      </div>
    </div>
  </div>
</template>

<script>

const fs = require('fs');
const path = require('path');

export default {
  data: function() {
    return {
      loading: false,
    };
  },
  computed: {
    entries: function() {
      return [...this.$store.state.AppStore.shipmentEntries]
          .sort((e1, e2) =>
            e1.entryNumber > e2.entryNumber ?
              1 : e1.entryNumber < e2.entryNumber ?
                -1 : 0);
    },
    isValidExpensesFile: function() {
      const expensesFilePath = this.$store.state.AppStore.expensesExcelFile;
      return expensesFilePath &&
        expensesFilePath.length > 0 &&
        fs.existsSync(expensesFilePath) &&
        path.extname(expensesFilePath) === '.xlsx';
    },
    isValidResultsFile: function() {
      const resultsFilePath = this.$store.state.AppStore.insectResultsExcelFile;
      return resultsFilePath &&
        resultsFilePath.length > 0 &&
        fs.existsSync(resultsFilePath) &&
        path.extname(resultsFilePath) === '.xlsx';
    },
  },
  methods: {
    fillExpenses() {

    },
    fillInsectResults() {

    },
    saveAndCloseFiles() {

    },
  },
};

</script>

<style scoped>
</style>
