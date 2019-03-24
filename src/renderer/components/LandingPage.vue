<template>
  <div class="container-fluid main-container">
    <div class="row">
      <div class="col-sm-3 menu">
        <ul class="list-group">
          <li class="list-group-item  list-group-item-primary" :class="{active: isActiveTab('home'), 'disabled': loading}"         @click="showContent('home')"        >Home       </li>
          <li class="list-group-item  list-group-item-primary" :class="{active: isActiveTab('entries'), 'disabled': loading}"      @click="showContent('entries')"     >Entries    </li>
          <li class="list-group-item  list-group-item-primary" :class="{active: isActiveTab('excel_files'), 'disabled': loading}"  @click="showContent('excel_files')" >Excel Files</li>
          <li class="list-group-item  list-group-item-primary" :class="{active: isActiveTab('emailing'), 'disabled': loading}"     @click="showContent('emailing')"    >Emailing   </li>
          <li class="list-group-item  list-group-item-primary" :class="{active: isActiveTab('settings'), 'disabled': loading}"     @click="showContent('settings')"    >Settings   </li>
        </ul>
      </div>
      <div class="col-sm-9 main-content">
        <entries    v-if="     activeTab === 'entries'"     v-on:set-loading="setLoading"></entries>
        <excelfiles v-else-if="activeTab === 'excel_files'" v-on:set-loading="setLoading"></excelfiles>
        <emailing   v-else-if="activeTab === 'emailing'"    v-on:set-loading="setLoading"></emailing>
        <settings   v-else-if="activeTab === 'settings'"    v-on:set-loading="setLoading"></settings>
        <home       v-else                                  v-on:set-loading="setLoading"></home>
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
      loading: false,
    };
  },
  methods: {
    showContent(tab) {
      this.activeTab = tab;
    },
    isActiveTab(tab) {
      return this.activeTab === tab;
    },
    setLoading(isLoading) {
      this.loading = isLoading;
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
