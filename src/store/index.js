import Vue from 'vue'
// import Vuex from 'vuex';
import Vuex from '../vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
  },
  getters: {
    doubleCount(state,getters) {
      console.log('root',state,getters)
      return state.count * 2;
    }
  },
  modules: {
    student: {
      // namespaced: true,
      state: {
        count: 2222,
      },
      getters: {
        studentDoubleCount(state, getters) {
          console.log('student', state, getters)
          return state.count * 2;
        },
        sleCount(state, getters) {
          console.log('student', state, getters)
          return state.count * 2;
        }
      },
    },
  },
})
