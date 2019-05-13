<template>
  <div>
    <h1 class="text-center">Emailing</h1>
    <div id="actions" class="alert alert-primary">
      <p
        v-if="finalisedEntries.length === 0">
          There are no finalised entries, no emails to be sent.
      </p>
      <div v-else>
        <button 
          @click="sendAllEmails()"
          class="btn btn-primary"
          :class="{disabled: loading}">
            Send all emails
        </button>
      </div>
    </div>
    <div id="content">
      <p v-if="!finalisedEntries || (finalisedEntries && finalisedEntries.length === 0)">No Finalised Entries</p>
      <div v-else>
        <select
          v-if="selectedEntry !== null"
          v-on:change="changeSelectedEntry($event.target.value)"
          class="form-control entry-select-control">
          <option
            v-for="entry in finalisedEntries"
            :key="entry.entryNumber"
            v-bind:value="entry.entryNumber"
            v-bind:selected="entry.entryNumber === selectedEntry.entryNumber">
              {{getFormatedDate(entry.deliveryDate)}} - {{entry.entryNumber}} - {{entry.supplier}}
          </option>
        </select>
        <div
          v-if="selectedEntry" 
          class="card bg-light col-lg-12">
            <div class="card-header">
              <h5 class="font-weight-bold text-center">
                Email Template
              </h5>
              <div class="row">
                <div class="col-lg-2">Delivery Date:</div>
                <div class="col-lg-10">{{getFormatedDate(selectedEntry.deliveryDate)}}</div>
                <div class="col-lg-2">Supplier:</div>
                <div class="col-lg-10">{{selectedEntry.supplier}}</div>
                <div class="col-lg-2">Entry Number:</div>
                <div class="col-lg-10">{{selectedEntry.entryNumber}}</div>
              </div>
            </div>
            <div class="card-body">
              <div class="card-text">
                <div class="row">
                  <div class="email-td col-lg-1">to:</div>
                  <div class="email-td col-lg-11">
                    <input 
                      type="text"
                      readonly
                      class="form-control"
                      :value="getEmailTo(selectedEntry.supplier)">
                  </div>
                  <div class="email-td col-lg-1">CC:</div>
                  <div class="email-td col-lg-11">
                    <input 
                      type="text"
                      readonly
                      class="form-control"
                      value="afi@afi.net.au">
                  </div>
                  <div class="email-td col-lg-1">Title:</div>
                  <div class="email-td col-lg-11">
                    <input 
                      type="text"
                      readonly
                      class="form-control"
                      :value="getEmailTitle(selectedEntry)">
                  </div>
                  <div class="email-td col-lg-1">Body:</div>
                  <div class="email-td col-lg-11">
                    <div 
                      class="div-html-email-body"
                      contenteditable="true"
                      rows="15"
                      v-html="getEmailBody(selectedEntry)"
                    >
                    </div>
                    <div class="card" 
                          v-for="entryImg in selectedEntry.resultsImgs" 
                          :key="entryImg">
                      <img
                        class="card-img-top border border-info"
                        :src="entryImg" />
                    </div>
                  </div>
                  <div class="email-td col-lg-1"></div>
                  <div class="email-td col-lg-11">
                    <button 
                      v-if="selectedEntry"
                      @click="sendEmail(selectedEntry)"
                      class="btn btn-primary"
                      :class="{disabled: loading}">
                        Send Email
                    </button>
                  </div>
                </div>
                <result-msg v-bind:result="sendEmailResult"
                    v-on:reset-result="resetResult"></result-msg>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ResultMsg from './shared/ResultMsg';
  import {enums} from '../../business-logic/globals/enums';
  import ShipmentEntry from '../../business-logic/globals/ShipmentEntry';
  import * as emailLogic from '../../business-logic/email-logic';

  export default {
    components: {ResultMsg},
    data: function() {
      return {
        loading: false,
        selectedEntry: null,
        sendEmailResult: null,
      };
    },
    computed: {
      finalisedEntries: function() {
        return this.$store.getters.sortedFinalisedEntriesCopy;
      },
    },
    methods: {
      changeSelectedEntry(entryNumber) {
        const entry = this.finalisedEntries.find(e => e.entryNumber === entryNumber);
        this.selectedEntry = entry;
      },
      getFormatedDate(dateStr) {
        return ShipmentEntry.getFormatedDate(dateStr);
      },
      getEmailTo(supplier) {
        return enums.EmailTo[supplier];
      },
      getEmailTitle(entry) {
        return emailLogic.getEmailTitle(entry);
      },
      getEmailBody(entry) {
        return emailLogic.getEmailBody(entry);
      },
      sendEmail(entry) {
        this.loading = true;
        this.$emit('set-loading', true);
        this.sendEmailResult = null;
        emailLogic.sendEmail(entry).then((result) => {
          this.loading = false;
          this.sendEmailResult = result;
          this.$emit('set-loading', false);
        });
      },
      sendAllEmails() {
        this.loading = true;
        this.$emit('set-loading', true);
        this.sendEmailResult = null;
        emailLogic.sendEmails(this.finalisedEntries).then((result) => {
          this.loading = false;
          if (Array.isArray(result)) {
            const success = result.every(r => r.accepted && r.accepted.length > 0);
            this.sendEmailResult = success ? 'All Emails Sent' :
              `One Or More Emails Not Sent:\n${result}`;
          } else {
            if (result.accepted && result.accepted.length > 0) {
              this.sendEmailResult = 'Email Sent';
            } else {
              this.sendEmailResult = `Email not sent:\n${response}`;
            }
          }
          this.$emit('set-loading', false);
        });
      },
      resetResult() {
        this.sendEmailResult = null;
      },
    },
    created: function() {
      if (this.finalisedEntries && this.finalisedEntries.length > 0) {
        this.selectedEntry = this.finalisedEntries[0];
      }
    },
  };
</script>

<style scoped>
  #actions button {
    margin: 10px; 
  }
  .email-td {
    margin-top: 5px;
    margin-bottom: 5px; 
  }
  .div-html-email-body {
    background-color: #e9ecef;
    opacity: 1;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    margin-bottom: 10px;
  }
  .entry-select-control {
    margin-bottom: 20px; 
  }
</style>
