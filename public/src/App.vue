<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view></router-view>
  </div>
</template>

<script>
    export default {
        name: 'app',
        mounted() {
            this.$http.get('http://test.efflife.kz/gettokencsrf').then((response) => {
                console.log(response);
            }, (response) => {
                console.error('error', response);
            });
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>