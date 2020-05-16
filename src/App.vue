<template>
  <div id="app">
    <p>mapState</p>
    <p>root</p>
    <span>count: {{ count }}</span> &nbsp;&nbsp;
    <span>rootCount: {{ rootCount }}</span>&nbsp;&nbsp;
    <span>countDouble: {{countDouble}}</span>
    <p>student </p>
    <span>num {{ num }}</span>&nbsp;&nbsp;
    <span>studentNum {{ studentNum }}</span>&nbsp;&nbsp;
    <span>numDouble {{numDouble}}</span>
    <hr>
    <p>mapGettrers</p>
    <p>doubleCount: {{doubleCount}}</p>
    <p>student/doubleNum: {{doubleNum}}</p>
    <hr>
    <p>
      <button @click="handleMutaions"> Mutaions </button>
      <button @click="handleMutaionsAlisa"> MutationsAlisa </button>
    </p>
    <p>
      <button @click="handleActions"> Actions </button>
      <button @click="handleActionsAlisa"> ActionsAlisa </button>
    </p>
  </div>
</template>

<script>
import { mapState, mapGettrers, mapMutations, mapActions } from "./vuex";

export default {
  name: 'App',
  data(){
    return {
      localCount: 100,
      localNum: 20,
    }
  },
  computed: {
    ...mapState(['count']),
    ...mapState({
      rootCount: 'count',
      countDouble(state, getters){
        return  state.count + getters.doubleCount + this.localCount
      }
    }),
    ...mapState('student', ['num']),
    ...mapState('student', {
      studentNum: 'num',
      numDouble(state, getters){
        return  state.num + getters.doubleNum + this.localNum
      }
    }),

    ...mapGettrers(['doubleCount']),
    ...mapGettrers('student', ['doubleNum']),
  },
  methods: {
    ...mapMutations(['changeCount']),
    ...mapMutations({
      changeCountAdd: 'changeCount',
    }),
    ...mapMutations('student', ['changeNum']),
     ...mapMutations('student', {
      changeNumAdd: 'changeNum',
    }),
    handleMutaions() {
      this.changeCount({count: 5}) // === this.$store.commit('changeCount', {count: 5})
      this.changeNum({num: 5}) // === this.$store.commit('student/changeCount', {count: 5})
    },
    handleMutaionsAlisa() {
      this.changeCountAdd({count: 5})
      this.changeNumAdd({num: 5}) 
    },
    ...mapActions(['actionCount']),
    ...mapActions({
      actionCountAdd: 'actionCount',
    }),
    ...mapActions('student', ['actionNum']),
    ...mapActions('student', {
      actionNumAdd: 'actionNum',
    }),
    handleActions() {
      this.actionCount({count: 20});
      this.actionNum({num: 100});
    },
    handleActionsAlisa() {
      this.actionCountAdd({count: 40})
      this.actionNumAdd({num: 200});
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
