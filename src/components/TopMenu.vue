<template>
  <!-- Header start -->
  <div id="header" class="u-full-width" @mouseleave="alertFadeOut = false; alertProfile = false;">
    <div class="row max-center">
      <ul>
        <li id="logo" class="u-pull-left"><a href="index.html">adshot</a></li>
        <li class="u-pull-left" v-for="nameMenu in nameMenus">
          <a :href="nameMenu.link">{{nameMenu.name}}</a>
        </li>
        <li class="parent-menu u-pull-right" v-if="notificationShow">
          <a href="#" @click.prevent="alertProfile = true; alertFadeOut = false;"><img src="static/img/icons/ic_account_circle_white_36px.svg"
                                                                 alt=""></a>
          <div class="menu-block micro-block" v-if="alertProfile">
            <router-link class="menu-item" :to="{name: 'price'}" v-if="roleLocal === 'screenHolder'">
              <div class="row">
                <div class="twelve columns">
                  <p class="icon-price">Выплата</p>
                </div>
              </div>
            </router-link>
            <div class="menu-item" @click="exit">
              <div class="row">
                <div class="twelve columns">
                  <p class="icon-exit">Выход</p>
                </div>
              </div>
            </div>
          </div>
        </li>
        <!--<li id="info-icon" class="u-pull-right">
          <a href="#/login"><img src="static/img/icons/ic_info_outline_white_24px.svg" alt=""></a>
        </li>-->
        <li class="parent-menu u-pull-right" v-if="notificationShow">
          <a href="#" @click.prevent="alertFadeOut = true; alertProfile = false;">
            <img id="notification-icon"
                 src="static/img/icons/ic_notifications_none_white_24px.svg"
                 alt="">
            <span class="notification-count" v-if="readings.length">
              {{readings.length}}
            </span>
          </a>
          <div class="menu-block" v-if="alertFadeOut">
            <div class="menu-item" v-if="!notificationDataAccess.length">
              <div class="row">
                <div class="twelve columns">
                  <div class="text-center">
                    <img src="static/img/not-message.png" alt="not message">
                    <p>Новых уведомлении нет</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="menu-item-scroll" v-if="notificationDataAccess.length">
            <div class="clear-notification">
              <div class="u-pull-left">Уведомление</div>
              <a href="#" @click.prevent="readingsAll">Отметить все как прочитанные</a>
            </div>
            <div class="menu-item" v-for="notificationItem in notificationDataAccess">
              <div class="row">
                <div class="four columns">
                  <!--<img class="notification-img" src="static/img/playlist/skrin.png" alt="delete">-->
                  <h4>{{notificationItem.nameOfFromCompany}}</h4>
                </div>
                <div class="eight columns">
                  <p class="menu-des">{{notificationItem.messageOfNotification}}</p>
                  <small class="notification-date">{{notificationItem.dateOfNotification | date}}</small>
                  <div class="text-right">
                    <a v-if="notificationItem.linkPay" :href="notificationItem.linkPay" class="linkPay" target="_blank">Оплата</a>
                  </div>
                </div>
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
  import toastr from 'toastr'

  export default 
  {
    name: 'Header',
    props: ['notification', 'nameLink', 'notificationData'],
    data() 
    {
      return 
      {
        roleLocal: localStorage.role || false,
        alertFadeOut: false,
        alertProfile: false,
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

      if (!localStorage['tokenCSRF'] || dateToday >= dateCreate) 
      {
        localStorage.clear();
        this.$resource('gettokencsrf').get().then((response) => 
        {
          localStorage.setItem('createDateToken', plusDay);
          localStorage.setItem('tokenCSRF', response.body.tokenCSRF);
        }, (response) => 
        {
          toastr.error("Неполадки в системе. Попробуйте позже.");
        });

      }

      if (this.notificationShow) 
      {
        this.notificationSend();
      }

    },
    filters: {
            date(data) 
            {
                return moment(data).format('YYYY-MM-DD');
            }
        },
    methods: 
    {
      readingsAll()
      {
        let data = 
          {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('updatestatusnotification').save({}, dataJson).then((response) => 
        {
           this.readings = [];
           this.notificationDataAccess = [];
           this.notificationSend();
        }, (response) => 
        {
          toastr.error("Неполадки в системе. Попробуйте позже.");

        });
      },
      notificationSend() 
      {
        let data = 
          {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('getnotification').save({}, dataJson).then((response) => 
        {
          let readings;

          if (response.body.resultFromDb.length) 
          {
            this.notificationDataAccess = response.body.resultFromDb;
            readings = this.notificationDataAccess.filter((read) => 
            {
              return !read.statusRead;
            });
            this.readings = readings;
          }
        }, (response) => {
          toastr.error("Неполадки в системе. Попробуйте позже.");

        });
      },
      exit() 
      {

        if (localStorage.saveAuth === 'false') 
        {
          this.exitVisible = false;
          localStorage.clear();
        }
        // Удаляем роль чтобы функцию проверка роли
        // на авторизаций не перекидывало по кабинетам
        delete localStorage.role;
        this.$router.push('/');
      }
    }
  }
</script>

<style scoped>
  /* header start */

  #header {
    background: #4285f4;
    padding: 10px 20px;
    box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28);
    position: absolute;
    top: 0;
    height: 60px;
    z-index: 100;
    min-width: 960px;
  }

  #header ul {
    padding: 0;
    margin: 0;
  }

  .menu-item-scroll {
    overflow-y: auto;
    max-height: 420px;
  }

  .notification-date {
    display: block;
    text-align: right;
  }

  .clear-notification {
    display: block;
    text-align: right;
    padding: 10px;
    font-weight: bold;
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
    font-family: "Montserrat",sans-serif;
    letter-spacing: 3px;
    font-weight: 700;
    text-transform: uppercase;
    -webkit-transition: 0.36s;
    transition: 0.36s;
    font-size: 1.7em;
    text-decoration: none;
    padding: 0 20px 0 0;
    color: #fff
  }

  #header ul li {
    list-style: none;
  }

  #header .parent-menu {
    position: relative;
  }

  #header .parent-menu .notification-count {
    background: #F44336;
    border-radius: 50%;
    color: #fff;
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 10px 18px;
  }

  .parent-menu {
    position: relative;
  }

  .parent-menu .menu-block {
    /*display: none;*/
    background: #fff;
    position: absolute;
    border-radius: 2px;
    max-height: 450px;
    /*overflow-y: auto;*/
    right: -45px;
    top: 50px;
    -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    width: 380px;
  }

  .parent-menu .menu-block:before {
    content: "";
    position: absolute;
    right: 48px;
    top: -29px;
    border: 15px solid transparent;
    border-bottom: 15px solid #fff;
  }

  .parent-menu .menu-block.micro-block:before {
    content: "";
    position: absolute;
    right: 21px;
  }

  .parent-menu .menu-item {
    display: block;
    color: #000;
    cursor: pointer;
    padding: 20px;
    border-bottom: 2px solid #f7f7f7;
  }

  .parent-menu .menu-item:hover {
    background-color: #e5e5e5;
    background-color: rgba(158, 158, 158, 0.2);
  }

  .icon-exit {
    background: url("../../static/img/icons/ic_exit_to_app_white_24px.svg") no-repeat left center;
    padding-left: 30px;
  }

  .icon-price {
    background: url("../../static/img/icons/ic_attach_money_black_36px.svg") no-repeat left center;
    padding-left: 30px;
  }

  .parent-menu .menu-block.micro-block {
    right: -20px;
    width: auto;
  }

  .parent-menu .menu-block.micro-block .menu-item {
    display: block;
    padding: 10px 20px !important;
  }

  .parent-menu .menu-block .menu-item p {
    margin: 0;
  }

  .parent-menu .menu-block .menu-item .menu-des {
    margin-bottom: 2rem;
  }

  /* Header end */
</style>
