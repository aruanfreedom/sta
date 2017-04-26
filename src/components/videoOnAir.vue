<template>
  <div class="video-container one-air-video">
   <div class="text-center">
      <button id="full-video">Полный экран</button>
    </div>
    <video id="video"
           class="video-on"
           poster="static/img/poster.jpg"
           autoplay>
    </video>
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
                  alert('Ваш браузер не поддерживает Полный экран');
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
    position: relative;
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

  #video.video-on {
    height: 420px;
    width: 100%;
  }

  .flowplayer.is-splash,
  .flowplayer .fp-message {
    background-color: #bbb;
  }

</style>
