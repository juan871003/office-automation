const state = {
  shipmentEntries: [],
  entriesFolder: null,
  expensesExcelFile: null,
  insectResultsExcelFile: null,
};

const actions = {
  SET_INITIAL_STATE(context, state) {
    context.commit('SET_INITIAL_STATE', state);
  },
  ADD_ENTRY(context, entry) {
    context.commit('ADD_ENTRY', entry);
  },
  ADD_ENTRIES(context, entries) {
    context.commit('ADD_ENTRIES', entries);
  },
  REMOVE_ENTRY(context, entryNumber) {
    context.commit('REMOVE_ENTRY', entryNumber);
  },
  REPLACE_ENTRY(context, entry) {
    context.commit('REPLACE_ENTRY', entry);
  },
  MODIFY_ENTRY(context, {entry, property, newValue}) {
    const oldEntry = context.state.shipmentEntries.find(e => e.entryNumber === entry.entryNumber);
    if (oldEntry !== undefined && oldEntry.hasOwnProperty(property)) {
      context.commit('MODIFY_ENTRY', {entryNumber: entry.entryNumber, property: property, newValue: newValue});
    }
  },
  SET_ENTRIES_FOLDER(context, thePath) {
    context.commit('SET_ENTRIES_FOLDER', thePath);
  },
  SET_EXPENSES_FILEPATH(context, thePath) {
    context.commit('SET_EXPENSES_FILEPATH', thePath);
  },
  SET_INSECTRESULTS_FILEPATH(context, thePath) {
    context.commit('SET_INSECTRESULTS_FILEPATH', thePath);
  },
  DELETE_ALL_ENTRIES(context) {
    context.commit('DELETE_ALL_ENTRIES');
  },
};

const mutations = {
  SET_INITIAL_STATE(state, value) {
    state = {...value};
  },
  ADD_ENTRY(state, entry) {
    state.shipmentEntries.push({...entry});
  },
  ADD_ENTRIES(state, entries) {
    // We do this a a single transaction
    // We have had problems when committing multiple transactions
    //       (error accessing vuex.json file multiple times one after another)
    for (let i=0; i< entries.length; i++) {
      state.shipmentEntries = state.shipmentEntries.filter(s => s.entryNumber !== entries[i].entryNumber);
      state.shipmentEntries.push({...entries[i]});
    }
  },
  REMOVE_ENTRY(state, entryNumber) {
    state.shipmentEntries = state.shipmentEntries.filter(s => s.entryNumber !== entryNumber);
  },
  REPLACE_ENTRY(state, entry) {
    // We do this a a single transaction instead of using REMOVE_ENTRY and ADD_ENTRY.
    // We have had problems when committing multiple transactions
    //       (error accessing vuex.json file multiple times one after another)
    state.shipmentEntries = state.shipmentEntries.filter(s => s.entryNumber !== entry.entryNumber);
    state.shipmentEntries.push({...entry});
  },
  SET_ENTRIES_FOLDER(state, thePath) {
    state.entriesFolder = thePath;
  },
  SET_EXPENSES_FILEPATH(state, thePath) {
    state.expensesExcelFile = thePath;
  },
  SET_INSECTRESULTS_FILEPATH(state, thePath) {
    state.insectResultsExcelFile = thePath;
  },
  DELETE_ALL_ENTRIES(state) {
    state.shipmentEntries = [];
  },
  MODIFY_ENTRY(state, {entryNumber, property, newValue}) {
    const entry = state.shipmentEntries.find(e => e.entryNumber === entryNumber);
    entry[property] = newValue;
  },
};

const getters = {
  sortedEntriesCopy: state => [...state.shipmentEntries]
      .sort((e1, e2) =>
        e1.entryNumber > e2.entryNumber ? 1 :
        e1.entryNumber < e2.entryNumber ? -1 : 0),
  sortedFinalisedEntriesCopy: (state, getters) =>
    getters.sortedEntriesCopy
        .filter(e =>
          e.status === enums.EntryStatus.Finalised),
};

export default {
  state,
  mutations,
  actions,
  getters,
};
