import Vue from 'vue'
// import Vuex from 'vuex';
import Vuex from '../vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    count: 1,
  },
  getters: {
    doubleCount(state) {
      return state.count * 2;
    }
  },
  mutations: {
    changeCount(state,payload){
      state.count += payload.count;
    }
  },
  actions: {
    actionCount({commit}, payload) {
      commit('changeCount', payload);
    }
  },
  modules: {
    student: {
      namespaced: true,
      state: {
        num: 10,
      },
      getters: {
        doubleNum(state) {
          return state.num * 2;
        },
      },
      mutations: {
        changeNum(state, payload){
          state.num += payload.num;
        }
      },
      actions: {
        actionNum({commit}, payload) {
          console.log(payload);
          commit('changeNum', payload);
        }
      },
    },
  },
})
