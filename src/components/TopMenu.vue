<template>
    <!-- Header start -->
    <div id="header" class="u-full-width">
        <div class="row max-center">
            <ul>
                <li id="logo" class="u-pull-left"><a href="/#">logo</a></li>
                <li id="info-icon" class="u-pull-right">
                    <a href="#"><img src="static/img/icons/ic_info_outline_white_24px.svg" alt=""></a>
                </li>
            </ul>
        </div>
    </div>
    <!-- Header end -->
</template>

<script>
    export default {
        name: 'Header',
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<style scoped>
    /* header start */

    #header ul {
        padding: 0;
        margin: 0;
    }

    #header {
        background: #4285f4;
        padding: 10px 20px;
        box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28);
        position: fixed;
        top: 0;
        height: 60px;
        z-index: 100;
    }

    #header .u-pull-left a {
        font-size: 1em;
        display: inline-block;
        color: #fff;
        text-decoration: none;
        padding: 10px 10px;
    }

    #header .u-pull-right a {
        padding: 10px 0px 10px 10px;
    }

    #header .u-pull-left a:hover {
        background: rgba(0, 0, 0, .1);
    }

    #header #logo.u-pull-left a:hover {
        background: none;
    }

    #header #logo a {
        font-size: 1.7em;
        color: #fff;
        text-decoration: none;
        text-transform: uppercase;
        padding: 0 20px 0 0;
    }

    #header ul li {
        list-style: none;
    }

    #header #notification {
        position: relative;
    }

    #notification {
        position: relative;
    }

    #notification .notification-block {
        display: none;
        background: #fff;
        position: absolute;
        border-radius: 2px;
        right: -45px;
        top: 50px;
        -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
        width: 350px;
    }

    #notification .notification-block:before {
        content: "";
        position: absolute;
        right: 48px;
        top: -29px;
        border: 15px solid transparent;
        border-bottom: 15px solid #fff;
    }

    #notification .notfication-item {
        cursor: pointer;
        padding: 20px;
        border-bottom: 2px solid #f7f7f7;
    }

    #notification .notification-item:hover {
        background-color: #e5e5e5;
        background-color: rgba(158, 158, 158, 0.2);
    }
    /* Header end */
</style>
