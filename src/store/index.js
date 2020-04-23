import Vue from 'vue'
// import Vuex from 'vuex'
import * as Vuex from './vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    count: 0,
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
  },
  mutations: {
    chageCount(state, payload) {
      console.log(this);
      state.count += payload.num;
    }
  },
  actions: {
  },
  modules: {
    student: {
      namespaced: true,
      state: {
        count: 1111,
      },
      getters :{
        studentDoubleCount(state) {
          return state.count * 2
        },
      },
      mutations: {
        chageCount(state, payload) {
          state.count += payload.num;
        }
      },
      modules: {
        a: {
          state: {
            count: 1111,
          },
          getters: {
            adouble(state) {
              return state.count * 2
            }
          }
        },
        b: {
          state: {
            count: 2222,
          }
        }
      },
    },
  },
})
