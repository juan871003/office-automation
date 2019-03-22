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
                @change="getInputEntryNumberFolder($event)">
      </div>
    </div>
  </div>
</template>

<script>
  // import { remote } from 'electron'

  const fs = require('fs');
  // const path = require('path')

  export default {
    data() {
      return {
        entriesFolder: this.$store.state.AppStore.entriesFolder,
      };
    },
    methods: {
      getInputEntryNumberFolder: function(event) {
        if (event.target.files[0]) {
          this.entriesFolder = event.target.files[0].path;
          if (fs.existsSync(this.entriesFolder)) {
            console.log(this.entriesFolder);
            this.$store.dispatch('SET_ENTRIES_FOLDER', this.entriesFolder);
          /*  const filePath = path.join(remote.app.getPath('userData'), 'store.json')
            fs.writeFileSync(filePath, JSON.stringify(this.$store.state, null, 2)) */
          }
        }
      },
    },
  };
</script>

<style scoped>
</style>
