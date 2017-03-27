<template>
  <div>
    <TopMenu :notification="notification" :nameLink="nameMenus"></TopMenu>

    <div id="content">
      <!-- Player start -->
      <div id="player">
        <div class="row">
          <div class="eight columns">
            <VideoPlayer></VideoPlayer>
          </div>

          <!-- Playlist -->
          <div class="four columns">
            <Playlist :iconVisibleAdd="iconVisible" :advertiserAccess="advertiser" :playlistTitleParent="playlistTitle" v-on:linkVideo="linkVideoParent"></Playlist>
          </div>
          <!-- Playlist end -->

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
  import Playlist from './Playlist';
  import VideoPlayer from './VideoPlayer';
  import flowPlayerCss from '../assets/css/skin.css'
  import shaka from '../../static/js/shaka-player.compiled.js';

  export default {
    name: 'cabinetAdvertiser',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'Playlist': Playlist,
      'VideoPlayer': VideoPlayer
    },
    data() {
      return {
        advertiser: false,
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
    methods: {
      linkVideoParent: function (video) {
        var manifestUri = video;

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

        function initPlayer() {
          // Create a Player instance.
          var video = document.getElementById('video');
          var player = new shaka.Player(video);

//         Attach player to the window to make it easy to access in the JS console.
          window.player = player;

//         Listen for error events.
          player.addEventListener('error', onErrorEvent);

//         Try to load a manifest.
//         This is an asynchronous process.

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

      }
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
