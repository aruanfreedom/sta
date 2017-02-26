<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        tokenCSRF: ''
      }
    },
    mounted() {
      let date = new Date(),
          plusDay = new Date( new Date().getTime() -  ( new Date().getTimezoneOffset() * 60000 ) );
      console.log( 'start ' + date );
      console.log( 'end ' + localStorage['createDateToken'] );

      if (date === localStorage['createDateToken'] || !localStorage['createDateToken']) {
        this.$token = this.$resource('gettokencsrf');

        this.$token.get().then((response) => {
          localStorage.setItem('createDateToken', plusDay);
          localStorage.setItem('tokenCSRF', response.body.tokenCSRF);
          console.log(localStorage['tokenCSRF']);
        }, (response) => {
          console.error('error', response);
        });

      }
    }
  }
</script>

<style>
  /* Element for all page start */
  /* Content start */

  #content {
    padding: 60px 0 20px 0;
  }

  /* Content end */

  .card {
    background: #fff;
    padding: 20px 40px;
    margin-bottom: 10px;
    border-radius: 2px;
    -moz-box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
  }

  .text-center {
    text-align: center;
  }

  .uppercase {
    text-transform: uppercase;
  }

  label {
    cursor: pointer;
  }

  .max-center {
    max-width: 1280px;
    margin: 0 auto;
  }

  #licennse {
    font-size: 0.7em;
  }

  /* Modal start */

  #modal-info {
    display: none;
    background: rgba(0, 0, 0, 0.7);
    position: fixed;
    top: 0;
    left: 0;
    padding-top: 5%;
    height: 100%;
    width: 100%;
    z-index: 100;
  }

  #modal-info .modal-block {
    position: relative;
    z-index: 101;
  }

  #modal-info .modal-block .close-modal {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
  }

  .red {
    color: #F44336;
  }

  /* Modal end */

  /* Element for all page end */
</style>
