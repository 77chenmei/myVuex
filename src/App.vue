<template>
  <div id="app">
    <p>
      {{ $store.state.count}}
      {{ $store.getters.doubleCount}}
    </p>
    <hr />
    <p>
      {{ $store.state.student.count }}
      <!-- {{ $store.getters.studentDoubleCount }} -->
      {{ $store.getters['student/studentDoubleCount']}}
    </p>
    <button @click="handleClick"> click </button>
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    console.log(this.$store);
  },
  methods: {
    handleClick() {
      this.$store.commit('chageCount', {
        num:11,
      })
      //  this.$store.commit('student/chageCount', {
      //   num:11,
      //})
      // this.$store.state.count ++;
      // this.$store.state.student.count ++ ;
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
