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
              <div class="row">
                <div class="four columns">
                  <div class="company-skrin">
                    <img src="static/img/company_0.jpg" alt="skrin">
                  </div>
                </div>
                <div class="four columns">
                  <h5>Описание компании</h5>
                  <p>Имя компании: <b>{{nameOfCompany}}</b></p>
                  <p>Адрес: <b>{{addressOfmonitor}}</b></p>
                  <p>Цена за секунду: <b>{{totalCost}}</b></p>
                  <p>График работы экрана: <b>{{graphOfWork}}</b></p>
                </div>
                <div class="date four columns">
                  <label>Выберите дату размещение</label>
                  <input type="text" class="datepicker u-full-width">
                  <button @click="videoSend(); showModal = true" class="button button-primary">Отправить видеорекламу</button>
                  <Modal v-if="showModal" @close="showModal = false">

                    <h3 slot="header">{{titleModal}}</h3>
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
              </div>
            </div>

          </div>
        </div>
      </div>
      <!-- Select end -->

    </div>


    <Bottom :relativeCls="relativeCls"></Bottom>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import miniToastr from 'mini-toastr'
  import Modal from './Modal'
  import dateCssModal from '../assets/css/default.css'
  import dateCss from '../assets/css/default.date.css'
  import lang from '../assets/css/rtl.css'

  export default {
    name: 'listsCompany',
    components: {
      TopMenu: TopMenu,
      Bottom: Bottom,
      Modal: Modal
    },
    data() {
      return {
        notificationData: [],
        price: '',
        priceId: '',
        dateVideo: new Date(),
        videoClick: false,
        titleModal: 'Выберите видео',
        showModal: false,
        relativeCls: false,
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
            name: 'Кабинет ИПешника',
            link: '#cabinet-advertiser'
          }, {
            name: 'Выбрать экран для размещения',
            link: '#search-company'
          }
        ]
      }
    },
    mounted() {

      $(this.$el).find('.datepicker').pickadate({
        clear: '',
        formatSubmit: 'yyyy/mm/dd',
        format: 'dd/mm/yyyy',
        hiddenName: false,
        onClose: function () {
          this.showModal = true;
        }
      });

      this.$resource('getonecompany?id={id}').get({id: this.$route.params.id}).then((response) => {
        console.log(response);

        this.addressOfmonitor = response.body.resultFromDb.addressOfmonitor;
        this.totalCost = response.body.resultFromDb.totalCost.$numberDecimal;
        this.graphOfWork = response.body.resultFromDb.graphOfWork;
        this.nameOfCompany = response.body.resultFromDb.nameOfCompany;

      }, (response) => {
        console.error('error', response);
        miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
      });

    },
    methods: {
      sendScreenHolder: function(video) {

        this.dateVideo = $(this.$el).find('.date input[type="hidden"]').val();

        if(!this.dateVideo) {
          miniToastr.error("Вы не выбрали дату размещение", "Ошибка!", 5000);
          return false;
        }

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

          console.log(data.dateOfShowVideo);

        this.$resource('setnewvideotoscheduling').save({}, dataJson).then((response) => {
          console.log(response);
          if (response.body.resultFromDb) {
            let priceArr = [],
                price = response.body.resultFromDb;

            for (let key of  this.videoMyData) {
              key.price = (key.price === "" || key._id === video._id) ? price : key.price;
              priceArr.push(key);
            }
            
            this.videoMyData = priceArr;

            miniToastr.success("Ваша видео отправлено.", "Ошибка!", 5000);
          }
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });

      },
      videoSend: function(){
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },

          dataJson = JSON.stringify(data);

        this.$resource('getallvideos').save({}, dataJson).then((response) => {
          console.log(response);
          this.videoMyData = response.body.resultFromDb;
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });

      }
    }
  }
</script>

<style scoped>

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
