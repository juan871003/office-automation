<template>
  <div>
    <h1 class="text-center">Home</h1>
    <p>{{ showShipmentEntriesLengthMsg() }}</p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
      };
    },
    methods: {
      showShipmentEntriesLengthMsg() {
        return this.shipmentEntries
          ? this.shipmentEntries.length === 1
            ? '1 Shipment Entry Loaded'
            : `${this.shipmentEntries.length} Shipment Entries Loaded`
          : 'shipment entries does not exists, why?';
      },
    },
    computed: {
      shipmentEntries() {
        return this.$store.state.AppStore.shipmentEntries;
      },
    },
  };
</script>

<style scoped>
</style>
