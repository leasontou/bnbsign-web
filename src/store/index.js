import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "") {
      return true;
  } else {
      return false;
  }
}

export default new Vuex.Store({
  state: {
    account: '',
    chainId: 0,
  },
  getters: {
    isLogin: state => !isEmpty(state.account),
  },
  mutations: {
    setAccount(state, payload){
      state.account = payload.account
    },
  },
  actions: {
    accountChange({ commit }, payload){
      commit("setAccount", payload)
    },
  },
  modules: {
  }
})
