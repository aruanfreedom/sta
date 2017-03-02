<template>
  <!-- Header start -->
  <div id="header" class="u-full-width" @mouseleave="alertFadeOut = false">
    <div class="row max-center">
      <ul>
        <li id="logo" class="u-pull-left"><a href="/#">logo</a></li>
        <li class="u-pull-left" v-for="nameMenu in nameMenus">
          <a :href="nameMenu.link">{{nameMenu.name}}</a>
        </li>
        <li id="info-icon" class="u-pull-right">
          <a href="#"><img src="static/img/icons/ic_info_outline_white_24px.svg" alt=""></a>
        </li>
        <li id="notification" class="u-pull-right" v-if="notificationShow">
          <a href="#" @click.prevent="alertFadeOut = true"><img id="notification-icon"
                                                                src="static/img/icons/ic_notifications_none_white_24px.svg"
                                                                alt=""></a>

          <div class="notification-block" v-if="alertFadeOut">
            <div class="notfication-item">
              <div class="row">
                <div class="four columns">
                  <img class="notification-img" src="static/img/playlist/skrin.png" alt="delete">
                </div>
                <div class="eight columns">
                  <p class="notification-des">Извините, но видео которое вы прислали для размещения на моем экране, не
                    подходит. Поробуйте, его переделать, и прислать снова.</p>
                  <small class="notification-date u-pull-right">23.02.2017 / 23:02</small>
                </div>
              </div>
            </div>
            <div class="notfication-item">
              <div class="row">
                <div class="four columns">
                  <img class="notification-img" src="static/img/playlist/skrin.png" alt="delete">
                </div>
                <div class="eight columns">
                  <p class="notification-des">Извините, но видео которое вы прислали для размещения на моем экране, не
                    подходит. Поробуйте, его переделать, и прислать снова.</p>
                  <small class="notification-date u-pull-right">23.02.2017 / 23:02</small>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <!-- Header end -->
</template>

<script>
  export default {
    name: 'Header',
    props: ['notification', 'nameLink'],
    data() {
      return {
        alertFadeOut: false,
        nameMenus: this.nameLink || [],
        notificationShow: this.notification || false
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
    /*display: none;*/
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
