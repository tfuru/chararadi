import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex)

import { FacialExpression } from './modules/FacialExpression';

export default new Vuex.Store({
  state: {
    facialExpression: new FacialExpression(0),
  },
  mutations: {
    setFacialExpression(state,payload){
      state.facialExpression.setValues(payload.src);
    }
  },
  actions: {
    doUpdateFacialExpression: ({commit}, src) => {
      commit('setFacialExpression',{src});
    }
  },
  getters: {
    facialExpression: (state) => {
      return state.facialExpression.values;
    }
  },
  modules: {

  }
})
