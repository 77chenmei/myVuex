import Vue from 'vue'
// import Vuex from 'vuex';
import Vuex from '../vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    count: 0,
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
  modules: {
    student: {
      namespaced: true,
      state: {
        count: 2222,
      },
      getters: {
        studentDoubleCount(state) {
          return state.count * 2;
        },
      },
      mutations: {
        changeCount(state,payload){
          state.count += payload.count;
        }
      },
    },
  },
})
