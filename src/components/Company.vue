<template>
  <div>
    <TopMenu :notification="notification"
             :notificationData="notificationData"
             :nameLink="nameMenus">
    </TopMenu>

    <div id="content">
      <!-- Select monitor -->
      <div id="select-company">
        <div class="row">
          <div class="twelve columns">
            <div class="company-description card">
              <h5>Информация о компании</h5>
              <table class="u-full-width">
                <thead>
                <tr>
                  <th>Имя компании</th>
                  <th>Адрес</th>
                  <th>Цена за секунду</th>
                  <th>График работы экрана</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{{nameOfCompany}}</td>
                  <td>{{addressOfmonitor}}</td>
                  <td>{{totalCost}}</td>
                  <td>{{graphOfWork}}</td>
                </tr>
                </tbody>
              </table>
              <div class="date">
                <Modal v-if="showModal" @close="closeModal">

                  <h3 slot="header">{{titleModal}}</h3>
                  <small class="info-date" slot="date">{{dateVideo | date}}</small>
                  <div class="modal-body" slot="body" >
                    <div class="video-item" @click="sendScreenHolder(videoItem)" v-for="videoItem in videoMyData">
                      <div class="six columns">
                          <span class="video-item-title" :title='videoItem.originalFileName'>
                            <p>{{videoItem.originalFileName}}</p>
                          </span>
                      </div>
                      <div class="six columns">
                        <div class="pull-right text-right video-price" v-if="videoItem.price">
                          <b>{{videoItem.price}}</b> тенге
                        </div>
                      </div>

                    </div>
                  </div>

                </Modal>
              </div>
              <div id='calendar'></div>
            </div>

          </div>
        </div>
      </div>
      <!-- Select end -->
    </div>



    <Bottom></Bottom>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import miniToastr from 'mini-toastr'
  import Modal from './Modal'
  import calendarCss from '../assets/css/fullcalendar.css'

  export default {
    name: 'listsCompany',
    components: {
      TopMenu: TopMenu,
      Bottom: Bottom,
      Modal: Modal
    },
    filters: {
      date(data) {
        return moment(data).format('YYYY-MM-DD');
      }
    },
    data() {
      return {
        notificationData: [],
        infoCalendar: [],
        price: '',
        priceId: '',
        dateVideo: new Date(),
        videoClick: false,
        titleModal: 'Выберите видео',
        showModal: false,
        iconVisible: true,
        notification: true,
        companyData: [],
        videoMyData: [],
        addressOfmonitor: 'Название компании',
        totalCost: 'Адрес экрана',
        graphOfWork: 'Стоимость за секунду',
        nameOfCompany: '',
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

      this.informationVideoCalendar();

      this.$resource('getonecompany?id={id}').get({id: this.$route.params.id}).then((response) => {


        this.addressOfmonitor = response.body.resultFromDb.addressOfmonitor;
        this.totalCost = response.body.resultFromDb.totalCost.$numberDecimal;
        this.graphOfWork = response.body.resultFromDb.graphOfWork;
        this.nameOfCompany = response.body.resultFromDb.nameOfCompany;

      }, (response) => {

        miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
      });

    },
    // watch: {
    //   infoCalendar: function(val, old) {
    //     if (val.length !== old.length) { 
    //       console.log(val.length)
    //       console.info(old.length)
    //     }
    //   }
    // },
    methods: {
      closeModal() {
        this.showModal = false;       
        this.informationVideoCalendar();
        // location.reload();
        $('#calendar').fullCalendar( 'refetchEvents' );
      },
      informationVideoCalendar() {

      let modalCall = (date) => {
        this.videoSend();
        this.showModal = true;
        this.dateVideo = date || false;
      },
      dataVideo = {
        tokenCSRF: localStorage['tokenCSRF'],
        sessionToken: localStorage['sessionToken'],
        userId: this.$route.params.id
      },
      dataJson = JSON.stringify(dataVideo),
      infoCalendar = [], infoCalendarAdd = [];

      let updateCalendar = (info) => {
        let infoVideos = info || [];
        if(infoVideos) {
          console.log(infoVideos)
          for(let infoItem of info) { 
            infoCalendar.push({
              
                title: `Имя - ${infoItem.originalFileName}
                        Показы - ${infoItem.statusOfPlayToEnd}
                        Цена - ${infoItem.amountResult.$numberDecimal}`,
                start: `${moment(infoItem.dateOfShowVideo).format('YYYY-MM-DD')} + T00:00:00.000Z`
              });
          }

          infoCalendar.pop()
          console.log(infoCalendar)
                   
        
          $('#calendar').fullCalendar({
              // enable theme
              theme: true,

              dayClick: function(date) {
                 console.log(date.format());
                modalCall(date.format());
              },
              eventClick: function(event, jsEvent, view) {
                let date = moment(event.start._d).format("YYYY-MM-DD");
                console.log(date);
                modalCall(date);
              },
              events: infoCalendar
            });
           

          for(let infoItem of info) { 
            infoCalendarAdd = [{
                title: `Имя - ${infoItem.originalFileName}
                        Показы - ${infoItem.statusOfPlayToEnd}
                        Цена - ${infoItem.amountResult.$numberDecimal}`,
                start: `${moment(infoItem.dateOfShowVideo).format('YYYY-MM-DD')} + T00:00:00.000Z`
              }]
          }

        $('#calendar').fullCalendar( 'addEventSource', infoCalendarAdd);     
        $('#calendar').fullCalendar( 'refetchEvents' );

        infoCalendar = [];

        } else {
          return false;
        }
      }

      // Вызов всех видео информации для каленьдарья
        this.$resource('getallvideoforadvertiser').save({}, dataJson).then((response) => {
            this.infoCalendar = [];
            this.infoCalendar = response.body.resultFromDb;
            updateCalendar(this.infoCalendar);
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);

        });
      },
      sendScreenHolder: function(video) {

        let fullDate = new Date(this.dateVideo),
            newDate = fullDate.getFullYear() + '-' + ('0' + (fullDate.getMonth()+1)).slice(-2) + '-'
             + ('0' + fullDate.getDate()).slice(-2);

            newDate + "T00:00:00.000Z";

        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken'],
            userId: this.$route.params.id,
            videoId: video._id,
            dateOfShowVideo: new Date(newDate).toISOString()
          },
          dataJson = JSON.stringify(data);


        this.$resource('setnewvideotoscheduling').save({}, dataJson).then((response) => {

          if (response.body.resultFromDb) {
            let priceArr = [],
                price = response.body.resultFromDb;

            for (let key of  this.videoMyData) {
              key.price = (key.price === "" || key._id === video._id) ? price : key.price;
              priceArr.push(key);
            }

            this.videoMyData = priceArr;

            // miniToastr.success("Ваша видео отправлено.", "Оповещение", 5000);
          }
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);

        });

      },
      videoSend: function(){
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },

          dataJson = JSON.stringify(data);

        this.$resource('getallvideos').save({}, dataJson).then((response) => {

          this.videoMyData = response.body.resultFromDb;
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);

        });

      }
    }
  }
</script>

<style>

  .fc-time {
    display: none;
  }

  .ui-icon-circle-triangle-w {
    background: url('../../static/img/icons/ic_keyboard_arrow_left_black_18px.svg') no-repeat center center;
    position: relative;
    display: block;
    height: 18px;
    width: 10px;
  }

  .ui-icon-circle-triangle-e {
    background: url('../../static/img/icons/ic_keyboard_arrow_right_black_18px.svg') no-repeat center center;
    position: relative;
    display: block;
    height: 18px;
    width: 10px;
  }

  #select-company {
    max-width: 1280px;
    padding: 55px 20px 0 20px;
    margin: 0 auto;
  }

  #select-company .company-skrin img {
    width: 100%;
  }

  .company-skrin, .company-description {
    min-height: 300px;
  }

  .modal-body {
    overflow-y: auto;
    max-height: 350px;
  }

  .video-item {
    cursor: pointer;
    display: block;
    border: 1px solid #000;
    border-radius: 10px;
    margin: 10px 0;
    padding: 10px;
    overflow: hidden;
  }

  .video-item .video-item-title {
    display: block;
    overflow: hidden;
    height: 25px;
    width: 100%;
  }

  .video-item .video-price b {
    color: #F44336;
  }

  .video-item .video-item-title p {
    display: block;
    margin: 0;
    width: 100%;
  }

  .video-item:hover {
    background: #bbbbbb;
  }

  .video-item.send, .video-item.send:hover {
    color: #fff;
    background: #009688;
  }


</style>
