<template>
  <div>
  <TopMenu></TopMenu>
  <div id="content">
    <!-- Player start -->
    <div id="player">
      <div class="row">
        <div class="eight columns">
          <video id="video"
                 width="640"
                 poster="//shaka-player-demo.appspot.com/assets/poster.jpg"
                 controls autoplay></video>
        </div>

        <!-- Playlist -->
        <div class="four columns">
          <Playlist></Playlist>
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
  import flowPlayerCss from '../assets/css/skin.css'

  export default {
    name: 'cabinet',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'Playlist': Playlist
    },
    props: ['relativeCls'],
    mounted() {
        var manifestUri = '//storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

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

            // Attach player to the window to make it easy to access in the JS console.
            window.player = player;

            // Listen for error events.
            //player.addEventListener('error', onErrorEvent);

            // Try to load a manifest.
            // This is an asynchronous process.

            player.load(manifestUri).then(function() {
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

          document.addEventListener('DOMContentLoaded', initApp);


//      $('#player').on('click', function() {
//        console.log("jquery");
//        manifestUri = 'http://test.efflife.kz/mpddirectory/nQvQAf/output893302.mpd';
//        initPlayer();
//      });


    },
    data() {
      return {
        relative: this.relativeCls
      }
    }
  }
</script>

<style scoped>
  /* Player start */

  video {
    width: 100%;
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

  #player #video {
    /*height: 100%;*/
    height: 470px;
    width: 100%;
  }

  .flowplayer.is-splash,
  .flowplayer .fp-message {
    background-color: #bbb;
  }

  /* Player end */

</style>
