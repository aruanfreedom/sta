<template>
  <div>
    <TopMenu :notification="notification" :nameLink="nameMenus"></TopMenu>

    <div id="content">
      <!-- Player start -->
      <div id="player">
        <div class="row">
          <div class="twelve columns">
            <VideoPlayer></VideoPlayer>
          </div>
        </div>
      </div>
      <!-- Player end -->
    </div>
    <Bottom></Bottom>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import videoOnAir from './videoOnAir';
  import flowPlayerCss from '../assets/css/skin.css'
  import miniToastr from 'mini-toastr'
  import shaka from '../../static/js/shaka-player.compiled.js';

  export default {
    name: 'cabinetAdvertiser',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'VideoPlayer': videoOnAir
    },
    props: ['relativeCls'],
    data() {
      return {
        relative: this.relativeCls,
        advertiser: false,
        notification: true,
        playlistTitle: 'Предлогаемые',
        iconVisible: false,
        nameMenus: [
          {
            name: 'Cab экран',
            link: '#cabinet'
          }, {
            name: 'On-air',
            link: '#on-air'
          }
        ]
      }
    },
    mounted() {

      let fullDate = new Date(),
            newDate = fullDate.getFullYear() + '-' + ('0' + (fullDate.getMonth()+1)).slice(-2) + '-'
             + ('0' + fullDate.getDate()).slice(-2);

            newDate + "T00:00:00.000Z";

      let sendEndVideo = (id) => {
        let data = {
              tokenCSRF: localStorage['tokenCSRF'],
              sessionToken: localStorage['sessionToken'],
              _id: id
            },
            dataJson = JSON.stringify(data);
          console.log(data);
        this.$resource('savecountvideo').save({}, dataJson).then((response) => {
            console.log(response);
          }, (response) => {
            console.error('error', response);
            miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          });
      }

      let data = {
        tokenCSRF: localStorage['tokenCSRF'],
        sessionToken: localStorage['sessionToken'],
        dateNow: new Date(newDate).toISOString()
      },
      dataJson = JSON.stringify(data),
      videoStep = 0,
      videoPlayer = [];

      let playlistEmulate = () => {
        let manifestUri = videoPlayer[videoStep].mpdOutputFile;
        let video = document.getElementById('video');

        function initApp() {
          // Install built-in polyfills to patch browser incompatibilities.
          shaka.polyfill.installAll();

          // Check to see if the browser supports the basic APIs Shaka needs.
          if (shaka.Player.isBrowserSupported()) {
            // Everything looks good!
            initPlayer();
          } else {
            // This browser does not have the minimum set of APIs we need.
            console.error('Browser not supported!');
          }
        }

        function nextVideo() {

          if (videoStep !== videoPlayer.length - 1) {
            videoStep++;
          } else {
            videoStep = 0;
          }

          sendEndVideo(videoPlayer[videoStep]._id);

          manifestUri = videoPlayer[videoStep].mpdOutputFile;
          initPlayer();
        }



        function initPlayer() {

          var player = new shaka.Player(video);

          window.player = player;

          player.addEventListener('error', nextVideo);

          video.addEventListener('ended', nextVideo);

          player.load(manifestUri).then(function () {
            // This runs if the asynchronous load is successful.
            console.log('The video has now been loaded!');
          }).catch(onError);  // onError is executed if the asynchronous load fails.
        }

      function onErrorEvent(event) {
        // Extract the shaka.util.Error object from the event.
        onError(event.detail);
      }

      function onError(error) {
        // Log the error.
        console.error('Error code', error.code, 'object', error);
      }

        initApp();
      };

      console.log(dataJson);

      this.$resource('getonair').save({}, dataJson).then((response) => {
        console.log(response);
        videoPlayer =  response.body.resultFromDb;

        if(!videoPlayer.length) {
          miniToastr.info("Список утвержденых видео отсутствует", "Оповещение!", 5000);
          return false;
        }

        playlistEmulate();

      }, (response) => {
        miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
        console.error('error', response);
      });




    },
    methods: {

    }
  }
</script>

<style scoped>
  /* Player start */

  .text-right {
    text-align: right;
  }

  #player {
    max-width: 1280px;
    padding: 35px 20px 0 20px;
    margin: 0 auto;
  }

  #select-company {
    max-width: 1280px;
    padding: 55px 20px 0 20px;
    margin: 0 auto;
  }

  #select-company .company-skrin img {
    width: 100%;
  }

  /* Player end */

</style>
