<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <Home msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Home from './components/Home.vue';

@Component({
  components: {
    Home,
  },
})
export default class App extends Vue {}
</script>

<style>
body {
  padding: 0;
  margin: 0;
  background-color: black;
  /* transform:rotate(-90deg); */
}

#app {

}
</style>
