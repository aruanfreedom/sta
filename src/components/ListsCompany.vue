<template>
  <div>
    <TopMenu :notification="notification" :nameLink="nameMenus"></TopMenu>

    <div id="content">
      <!-- Player start -->
      <div id="select-monitor">
        <div class="container">
          <div class="row">
            <input type="text" v-model="search" @keyup="searchCompany" placeholder="Поиск компании" class="u-full-width select-monitor_search"/>
          </div>
            <div class="row optimal-height">
              <div class="not-data" v-if="!companyLists.length">
                <h2>Нет данных о компании</h2>
              </div>
              <div class="twelve columns" v-for="companyList in companyLists">
                <div class="select-monitor__item">
                  <div class="card" @click="openCompany(companyList._id)">
                    <div class="row">
                      <div class="two columns">
                        <div class="select-monitor-tv">
                          <!--<img class="select-monitor__img" src="https://s-media-cache-ak0.pinimg.com/originals/a6/18/92/a61892c9b992454424106cf20e863d9d.gif" alt="delete">-->
                        </div>
                      </div>
                      <div class="three columns">
                        <span class="select-monitor__name select-monitor__name_status_on">{{companyList.nameOfCompany}}</span>
                        <p class="select-monitor__adress">{{companyList.addressOfmonitor}}</p>
                        <b class="select-monitor__price">{{companyList.costOfSecond}}</b> тг за секунду
                      </div>
                      <div class="four columns">
                        <p class="select-monitor__graph-of-work">
                          График работы:
                          <b class="select-monitor__graph-work">{{companyList.graphOfWork}}</b>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="u-cf"></div>
            </div>
        </div>
      </div>
      <!--selectmonitor end -->
    </div>

    <Bottom></Bottom>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import toastr from 'toastr';

  export default {
    name: 'listsCompany',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom
    },
    data() {
      return {
        iconVisible: true,
        notification: true,
        companyLists: [],
        search: '',
        nameMenus: [
          {
            name: 'Личный кабинет',
            link: '#cabinet-advertiser'
          }, {
            name: 'Поиск компаний',
            link: '#search-company'
          }
        ]
      }
    },
    mounted() {

      this.allCompany();

    },
    methods: {
        allCompany: function() {
          let data = {
            tokenCSRF: localStorage['tokenCSRF'],
          };

          let dataJson = JSON.stringify(data);

          this.$resource('getallcompany').save({}, dataJson).then((response) => {

            this.companyLists = response.body.resultFromDb;
            
          }, (response) => {

            toastr.error("Неполадки в системе. Попробуйте позже.");
          });
        },

        openCompany: function (idpage) {
          this.$router.push( { name: 'getonecompany', params: { id: idpage } } );
        },

        searchCompany: function () {
          let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            searchQuery: this.search
          };

          let dataJson = JSON.stringify(data);

          if (this.search.length > 3) {

            this.$resource('searchcompany').save({}, dataJson).then((response) => {

              this.companyLists = response.body.resultFromDb;
            
            }, (response) => {

              toastr.error("Неполадки в системе. Попробуйте позже.");
            });

          }

          if(!this.search) {
            this.allCompany();
          }

        }
    }
  }
</script>

<style scoped>
  /* Select Monitor start */

  .not-data {
    background: #9C27B0;
    color: #fff;
    padding: 15px 10px;
  }

  .not-data h2 {
    margin: 0;
  }

  .card {
    cursor: pointer;
  }

  .card:hover {
    background: #e5e5e5;
  }

  .select-monitor__graph-of-work {
    margin-top: 20px;
    font-size: 1.2em;
  }

  #select-monitor {
    padding: 10px 0 0 0;
  }

  .select-monitor__item {
    margin: 20px 0;
  }

  .select-monitor_search {
    margin-top: 20px;
  }

  .select-monitor__item .select-monitor__name {
    margin-bottom: 0;
    font-size: 2.7em;
    position: relative;
  }

  /*.select-monitor__item .select-monitor__name.select-monitor__name_status_on:before {
    content: "Свободен";
    font-size: 0.3em;
    position: absolute;
    top: 0;
    right: -75px;
  }

  .select-monitor__item .select-monitor__name.select-monitor__name_status_on:after {
    content: "";
    background: #4CAF50;
    border-radius: 50%;
    position: absolute;
    top: 0;
    right: -15px;
    height: 10px;
    width: 10px;
  }*/

  .select-monitor__item .select-monitor__name.select-monitor__name_status_off:before {
    content: "Занят";
    font-size: 0.3em;
    position: absolute;
    top: 0;
    right: -52px;
  }

  .select-monitor__item .select-monitor__name.select-monitor__name_status_off:after {
    content: "";
    background: #F44336;
    border-radius: 50%;
    position: absolute;
    top: 0;
    right: -15px;
    height: 10px;
    width: 10px;
  }

  .select-monitor__item .select-monitor__adress {
    margin-bottom: 0;
  }

  .select-monitor__item .select-monitor__price {
    font-size: 2em;
    color: #FF5722;
  }

  .select-monitor-tv {
    cursor: pointer;
    padding: 30px;
    background: url(../../static/img/tv-icon.png) no-repeat center center;
    position: relative;
    height: 59px;
    width: 72px;
  }

  .select-monitor__item .select-monitor__img {
    position: absolute;
    top: 35px;
    height: 76px;
    left: 8px;
    border-radius: 10px;
    width: 93px;
  }

  /* Select Monitor end */
</style>
