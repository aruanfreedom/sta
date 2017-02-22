<template>
  <div id="app">
    <router-view name="header"></router-view>
    <router-view></router-view>
    <router-view name="footer"></router-view>
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
    /* Element for all page start */

    .card {
        background: #fff;
        padding: 40px;
        margin-bottom: 10px;
        border-radius: 2px;
        -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
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
        top: 0%;
        left: 0%;
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
    /* Modal end */
    /* Element for all page end */
</style>
