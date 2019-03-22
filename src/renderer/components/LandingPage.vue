<template>
  <div class="container-fluid main-container">
    <div class="row">
      <div class="col-sm-3 menu">
        <ul class="list-group">
          <li class="list-group-item  list-group-item-primary" :class="activeTab === 'home' ? 'active' : ''"         @click="showContent('home')"        >Home       </li>
          <li class="list-group-item  list-group-item-primary" :class="activeTab === 'entries' ? 'active' : ''"      @click="showContent('entries')"     >Entries    </li>
          <li class="list-group-item  list-group-item-primary" :class="activeTab === 'excel_files' ? 'active' : ''"  @click="showContent('excel_files')" >Excel Files</li>
          <li class="list-group-item  list-group-item-primary" :class="activeTab === 'emailing' ? 'active' : ''"     @click="showContent('emailing')"    >Emailing   </li>
          <li class="list-group-item  list-group-item-primary" :class="activeTab === 'settings' ? 'active' : ''"     @click="showContent('settings')"    >Settings   </li>
        </ul>
      </div>
      <div class="col-sm-9 main-content">
        <entries    v-if="     activeTab === 'entries'">    </entries>
        <excelfiles v-else-if="activeTab === 'excel_files'"></excelfiles>
        <emailing   v-else-if="activeTab === 'emailing'">   </emailing>
        <settings   v-else-if="activeTab === 'settings'">   </settings>
        <home       v-else>                                 </home>
      </div>
    </div>
  </div>
</template>

<script>
import Home from './LandingPage/Home';
import Entries from './Entries';
import Excelfiles from './Excelfiles';
import Emailing from './Emailing';
import Settings from './Settings';
import 'bootstrap';

export default {
  name: 'landing-page',
  components: {Home, Entries, Excelfiles, Emailing, Settings},
  data: function() {
    return {
      activeTab: 'home',
    };
  },
  methods: {
    showContent(tab) {
      this.activeTab = tab;
    },
  },
  computed: {},
};
</script>
<style scoped>
    .main-content {
      background-color: #F5F5F5;
      border-radius: 5px;
    }
    .main-container {
      padding: 40px;
    }
</style>
