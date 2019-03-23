// import { ShipmentEntry } from '../../globals/ShipmentEntry'
// const fs = require('fs')
// let initialStateInitialised = false

const state = {
  shipmentEntries: [],
  entriesFolder: null,
  expensesExcelFile: null,
  insectResultsExcelFile: null,
};
// #region  old
/* const actions = {
  SET_INITIAL_STATE ({commit}, userDataPath) {
    return new Promise((resolve, reject) => {
      if (initialStateInitialised) {
        reject(new Error('initial state has already been initialised'))
      } else {
        if (fs.existsSync(userDataPath))
        commit('SET_INITIAL_STATE', )
        initialStateInitialised = true
      }
    })
  },
  SET_SHIPMENT_ENTRIES_FOLDER ({ commit }, path) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(state.userDataFile)) {
        if ((path || false) && fs.existsSync(path)) {
          commit('SET_SHIPMENT_ENTRIES_FOLDER', path)
          fs.writeFileSync(state.userDataFile, JSON.stringify(state), 'utf8')
          resolve(true)
        } else {
          reject(new Error('path does not exist'))
        }
      } else {
        reject(new Error('cannot set shipment entries folder because userDataFile is not properly set'))
      }
    })
  },
  ADD_ENTRY ({ commit }, entry) {
    return new Promise((resolve, reject) => {
      if (entry instanceof ShipmentEntry) {
        if ((entry || false) && entry.isPrefilled()) {
          commit('ADD_ENTRY', entry)
          resolve(true)
        } else {
          reject(new Error('Entry is not prefilled, only prefilled entries should be added to the store'))
        }
      } else {
        reject(new Error('only objects of type ShipmentEntry can be added to the store'))
      }
    })
  },
  REMOVE_ENTRY ({ commit }, entryNumber) {
    return new Promise((resolve, reject) => {
      if (state.shipmentEntries.some(s => s.entryNumber === entryNumber)) {
        commit('REMOVE_ENTRY', entryNumber)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  },
  REPLACE_ENTRY ({ commit }, entry) {
    return new Promise((resolve, reject) => {
      if (entry instanceof ShipmentEntry) {
        if (state.shipmentEntries.some(s => s.entryNumber === entry.entryNumber)) {
          commit('REMOVE_ENTRY', entry.entryNumber)
          if ((entry || false) && entry.isPrefilled()) {
            commit('ADD_ENTRY', entry)
            resolve(true)
          } else {
            reject(new Error('Entry is not prefilled, only prefilled entries should be replaced in the store'))
          }
        } else {
          resolve(false)
        }
      } else {
        reject(new Error('only objects of type ShipmentEntry can be replaced in the store'))
      }
    })
  }
} */

// #endregion

const actions = {
  SET_INITIAL_STATE(context, state) {
    context.commit('SET_INITIAL_STATE', state);
  },
  ADD_ENTRY(context, entry) {
    context.commit('ADD_ENTRY', entry);
  },
  REMOVE_ENTRY(context, entryNumber) {
    context.commit('REMOVE_ENTRY', entryNumber);
  },
  REPLACE_ENTRY(context, entry) {
    context.commit('REMOVE_ENTRY', entry.entryNumber);
    context.commit('ADD_ENTRY', entry);
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
  REMOVE_ENTRY(state, entryNumber) {
    state.shipmentEntries = state.shipmentEntries.filter(s => s.entryNumber !== entryNumber);
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

export default {
  state,
  mutations,
  actions,
};
