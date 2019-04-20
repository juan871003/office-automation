<template>
  <div class="row" v-if="result">
    <div class="col-lg-12 alert alert-info alert-dismissible fade show" role="alert">
      {{result}}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="waitAndSetResult()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'result-msg',
  props: {
    result: String,
  },
  methods: {
    waitAndSetResult() {
      // allow alert to fade before setting result to null
      setTimeout(() => {
        // this.result = null;
        this.$emit('reset-result');
      }, 1000);
    },
  },
};
</script>

