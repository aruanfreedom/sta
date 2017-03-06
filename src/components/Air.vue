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
  import VideoPlayer from './VideoPlayer';
  import flowPlayerCss from '../assets/css/skin.css'
  import miniToastr from 'mini-toastr'

  export default {
    name: 'cabinetAdvertiser',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'VideoPlayer': VideoPlayer
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

      let data = {
        tokenCSRF: localStorage['tokenCSRF'],
        sessionToken: localStorage['sessionToken'],
        dateNow: new Date()
      },
      dataJson = JSON.stringify(data),

      obj = [
          {
            id: 1,
            mpdOutputFile: "http://test.efflife.kz/mpddirectory/XicTds/output878398.mpd"
          },{
            id: 2,
            mpdOutputFile: "http://test.efflife.kz/mpddirectory/YNxdl3/output480454.mpd"
          },{
            id: 3,
            mpdOutputFile: "http://test.efflife.kz/mpddirectory/qEKL9l/output506971.mpd"
          }
      ];

      this.$resource('getonair').save({}, dataJson).then((response) => {
        console.log(response);
      }, (response) => {
        miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
        console.error('error', response);
      });


        var manifestUri = "http://test.efflife.kz/mpddirectory/YNxdl3/output480454.mpd";

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

        function onProgress(storedContent, percent) {
          console.log('Stored ' + percent + '%');
        }

        function initPlayer() {
          var video = document.getElementById('video');
          var player = new shaka.Player(video);

          window.player = player;

          player.addEventListener('error', onErrorEvent);
          player.addEventListener('progress', onProgress);

          player.load(manifestUri).then(function () {
            // This runs if the asynchronous load is successful.
            console.log(video);
            console.log('The video has now been loaded!');
          }).catch(onError);  // onError is executed if the asynchronous load fails.
        }

        function onErrorEvent(event) {
          onError(event.detail);
        }

        function onEndEvent(event) {
          console.log(event);
        }

        function onError(error) {
          // Log the error.
          console.error('Error code', error.code, 'object', error);
        }

        initApp();



    },
    methods: {

    }
  }
</script>

<style scoped>
  /* Player start */

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
