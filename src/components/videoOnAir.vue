<template>
  <div class="video-container one-air-video">
    <video id="video"
           poster="static/img/poster.jpg"
           autoplay></video>
    <button id="full-video">Полный экран</button>
  </div>
</template>

<script>
  export default {
    name: 'videoPlayer',
    mounted() {
      var $video=$('video');
        //fullscreen button clicked
        $('#full-video').on('click', function() {
        $(this).toggleClass('enterFullscreenBtn');
            if($.isFunction($video.get(0).webkitEnterFullscreen)) {
                      // if($(this).hasClass("enterFullscreenBtn"))
                          document.getElementById('video').webkitRequestFullScreen();                          
                      // else 
                      // document.webkitCancelFullScreen();    
            }  
            else if ($.isFunction($video.get(0).mozRequestFullScreen)) {
                      // if($(this).hasClass("enterFullscreenBtn"))
                          document.getElementById('video').mozRequestFullScreen(); 
                      // else 
                          // document.mozCancelFullScreen();   
            }
            else { 
                  alert('Your browsers doesn\'t support fullscreen');
            }
        });
    }
  }
</script>

<style>

  .video-container {
    position: relative;
  }

  #full-video {
    background: #fff;
    position: absolute;
    right: 2%;
    top: 0px;
    // z-index: 11111111111;
  }

  video {
    width: 100%;
  }

  .one-air-video video::-webkit-media-controls {
    display:none !important;
  }

  #video {
    /*height: 100%;*/
    height: 470px;
    width: 100%;
  }

  .flowplayer.is-splash,
  .flowplayer .fp-message {
    background-color: #bbb;
  }

</style>
