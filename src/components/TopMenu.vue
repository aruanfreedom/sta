<template>
  <!-- Header start -->
  <div id="header" class="u-full-width" @mouseleave="alertFadeOut = false">
    <div class="row max-center">
      <ul>
        <li id="logo" class="u-pull-left"><a href="/#">logo</a></li>
        <li class="u-pull-left" v-for="nameMenu in nameMenus">
          <a :href="nameMenu.link">{{nameMenu.name}}</a>
        </li>
        <li class="u-pull-right" v-if="notificationShow">
          <a href="#" @click.prevent="exit"><img src="static/img/icons/ic_exit_to_app_white_24px.svg" alt=""></a>
        </li>
        <li id="info-icon" class="u-pull-right">
          <a href="#"><img src="static/img/icons/ic_info_outline_white_24px.svg" alt=""></a>
        </li>
        <li id="notification" class="u-pull-right" v-if="notificationShow">
          <a href="#" @click.prevent="alertFadeOut = true; notificationValidate()">
            <img id="notification-icon"
                 src="static/img/icons/ic_notifications_none_white_24px.svg"
                 alt="">
            <span class="notification-count" v-if="readings.length">
              {{readings.length}}
            </span>
          </a>
          <div class="notification-block" v-if="alertFadeOut">
            <div class="notfication-item" v-if="!notificationDataAccess.length">
              <div class="row">
                <div class="twelve columns">
                  <p class="notification-des">Новых уведомлении нет</p>
                </div>
              </div>
            </div>
            <div class="notfication-item" v-for="notificationItem in notificationDataAccess">
              <div class="row">
                <div class="four columns">
                  <!--<img class="notification-img" src="static/img/playlist/skrin.png" alt="delete">-->
                  <h4>{{notificationItem.nameOfFromCompany}}</h4>
                </div>
                <div class="eight columns">
                  <p class="notification-des">{{notificationItem.messageOfNotification}}</p>
                  <a v-if="notificationItem.linkPay" :href="notificationItem.linkPay" class="linkPay u-pull-right" target="_blank">Оплата</a>
                  <small class="notification-date u-pull-right">{{notificationItem.dateOfNotification}}</small>
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
  import miniToastr from 'mini-toastr'

  export default {
    name: 'Header',
    props: ['notification', 'nameLink', 'notificationData'],
    data() {
      return {
        alertFadeOut: false,
        nameMenus: this.nameLink || [],
        notificationShow: this.notification || false,
        notificationDataAccess: this.notificationData || [],
        readings: []
      }
    },
    mounted() {
      let date = new Date(),
        plusDay = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 120000)),
        localDate = localStorage['createDateToken'] || undefined,
        dateToday = date.getTime(),
        dateCreate = new Date(localStorage['createDateToken']).getTime();

      if (!localStorage['tokenCSRF'] || dateToday >= dateCreate) {

        this.$resource('gettokencsrf').get().then((response) => {
          localStorage.setItem('createDateToken', plusDay);
          localStorage.setItem('tokenCSRF', response.body.tokenCSRF);
          console.log(localStorage['tokenCSRF']);
        }, (response) => {
          console.error('error', response);
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
        });

      }

      this.notificationSend();

    },
    methods: {
      notificationSend: function() {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('getnotification').save({}, dataJson).then((response) => {
          let readings;
          console.log(response);
          if (response.body.resultFromDb.length) {
            this.notificationDataAccess = response.body.resultFromDb;
            readings = this.notificationDataAccess.filter( (read) => {
              return !read.statusRead;
            });
            this.readings = readings;
          }
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });
      },
      notificationValidate: function() {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('updatestatusnotification').save({}, dataJson).then((response) => {
          console.log(response);
          let readings = this.notificationDataAccess.filter( (read) => {
              return !read.statusRead;
          });
          this.readings = readings;
          this.notificationSend();
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });
      },
      exit: function () {

        if (localStorage['saveAuth'] === 'false') {
          console.log('clear');
          this.exitVisible = false;
          localStorage.clear();
        }
        this.$router.push('/');
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

  .linkPay:hover {
    text-decoration: underline;
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

  #header #notification .notification-count {
    background: #F44336;
    border-radius: 50%;
    color: #fff;
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 10px 18px;
  }

  #notification {
    position: relative;
  }

  #notification .notification-block {
    /*display: none;*/
    background: #fff;
    position: absolute;
    border-radius: 2px;
    max-height: 450px;
    overflow-y: auto;
    right: -45px;
    top: 50px;
    -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    width: 380px;
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
