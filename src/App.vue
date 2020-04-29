<template>
  <div id="app">
    <p>
     {{ $store.state.count}}
    </p>
    <hr />
    {{ $store.state.student.count }}
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
      this.$store.commit({
        type: 'changeCount',
        payload: {
          count: 3,
        }
      })
      this.$store.commit('student/changeCount', {
        count: 3,
      })
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
