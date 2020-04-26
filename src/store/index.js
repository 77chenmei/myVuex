import Vue from 'vue'
import Vuex from 'vuex';
// import Vuex from '../vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,
  state: {
    count: 0,
  },
  modules: {
    student: {
      state: {
        count: 2222,
      },
    },
  },
})
