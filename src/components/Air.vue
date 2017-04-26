<template>
  <div>
    <TopMenu :notification="notification" :nameLink="nameMenus"></TopMenu>

    <div id="content">
      <!-- Player start -->
      <div id="player">
        <div class="row">
          <div class="twelve columns">
           <div class="playlist-empty" v-show="!videoFileListVisible">
            <img src="../../static/img/not-video.png" alt="">
          </div>
            <videoOnAir v-show="videoFileListVisible"></videoOnAir>
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
  import toastr from 'toastr';
  import shaka from '../../static/js/shaka-player.compiled.js';

  export default {
    name: 'cabinetAdvertiser',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'videoOnAir': videoOnAir
    },
    data() {
      return {
        advertiser: false,
        videoFileListVisible: false,
        notification: true,
        playlistTitle: 'Заявки на рекламу',
        iconVisible: false,
        nameMenus: [
          {
            name: 'Личный кабинет',
            link: '#cabinet'
          }, {
            name: 'Начать трансляцию',
            link: '#on-air'
          }
        ]
      }
    },
    mounted() {
      // try {

      let fullDate = new Date(),
          newDate = fullDate.getFullYear() + '-' + 
          ('0' + (fullDate.getMonth()+1)).slice(-2) + '-'+ ('0' + fullDate.getDate()).slice(-2) + "T00:00:00.000Z";

      let sendEndVideo = (id) => {
        let data = {
              tokenCSRF: localStorage['tokenCSRF'],
              sessionToken: localStorage['sessionToken'],
              _id: id
            },
            dataJson = JSON.stringify(data);

        this.$resource('savecountvideo').save({}, dataJson).then((response) => {
            console.info(response)
          }, (response) => {
            toastr.error("Неполадки в системе. Попробуйте позже.");
          });
      };

      let data = {
        tokenCSRF: localStorage['tokenCSRF'],
        sessionToken: localStorage['sessionToken'],
        dateNow: new Date(newDate).toISOString()
      },
      dataJson = JSON.stringify(data),
      videoStep = 0,
      videoPlayer = [];

      let playlistEmulate = () => {
        let video = document.getElementById('video');
        let manifestUri = videoPlayer[videoStep].mpdOutputFile;

        // video.src = '../static/video/видео12345.mp4';

        function initApp() {
          // Install built-in polyfills to patch browser incompatibilities.
          shaka.polyfill.installAll();

          // Check to see if the browser supports the basic APIs Shaka needs.
          if (shaka.Player.isBrowserSupported()) {
            // Everything looks good!
            initPlayer();
            //  flash();
          } else {
            // This browser does not have the minimum set of APIs we need.
            // alert('Browser not supported!');
            flash();

          }
        }

        function playlistHidden() {
          if (videoStep !== videoPlayer.length - 1) {
            videoStep++;
          } else {
            videoStep = 0;
          }
        }

        function nextVideo() {

          playlistHidden();

          sendEndVideo(videoPlayer[videoStep]._id);

          manifestUri = videoPlayer[videoStep].mpdOutputFile;

          initPlayer();
        }

        function nextVideoFlash() {

          playlistHidden();

          sendEndVideo(videoPlayer[videoStep]._id);

          video.src = videoPlayer[videoStep].mp4OutputFile;

          // video.src = '../static/video/видео1234.mp4';

          // initPlayer();
        }

        function flash() {
          playlistHidden();
          video.src = videoPlayer[videoStep].mp4OutputFile;
          // video.src = '../static/video/видео12345.mp4';
          video.addEventListener('ended', nextVideoFlash);
        }

        function initPlayer() {

          var player = new shaka.Player(video);

          window.player = player;

          player.addEventListener('error', nextVideo);

          video.addEventListener('ended', nextVideo);

          player.load(manifestUri).then(function () {
            // This runs if the asynchronous load is successful.
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



      this.$resource('getonair').save({}, dataJson).then((response) => {

        videoPlayer =  response.body.resultFromDb;
        console.log(response);

        if(!videoPlayer.length) {
          // miniToastr.info("Список утвержденых видео отсутствует", "Оповещение!", 5000);
          this.videoFileListVisible = false;
          return;
        }

        this.videoFileListVisible = true;

        playlistEmulate();

      }, (response) => {
        toastr.error("Неполадки в системе. Попробуйте позже.");
      });

    // } catch(e) {

    //   alert('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack); // (3) <--

    // }




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
