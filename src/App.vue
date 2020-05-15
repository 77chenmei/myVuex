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
  methods: {
    handleClick() {
      this.$store.dispatch('actionCount', { count: 5});
      this.$store.dispatch('student/actionCount', { count: 5});
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
