<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import store from './store';
  // import { remote } from 'electron'
  
  // const path = require('path')
  // const fs = require('fs')

  /* const getStoredState = function () {
    const filePath = path.join(remote.app.getPath('userData'), 'store.json')
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } else {
      return {
        userDataFile: filePath,
        shipmentEntries: [],
        entriesFolder: null
      }
    }
  } */

  export default {
    name: 'afi-automation',
    methods: {},
    created() {
      // this.$store.dispatch('SET_INITIAL_STATE', getStoredState())
      // this.$store.dispatch('SET_ENTRIES_FOLDER', 'ftes')
      // console.log(`current store is ${JSON.stringify(this.$store.state, null, 2)}`)
      // const filePath = path.join(remote.app.getPath('userData'), 'store.json')
      // fs.writeFileSync(filePath, JSON.stringify(this.$store.state, null, 2))
    },
    store,
  };
</script>

<style scoped>
  #app {
    margin-top: 10px;
  }
</style>
