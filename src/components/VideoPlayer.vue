<template>
  <div>
    <video id="video"
           controls
           poster="static/img/poster.jpg"
           autoplay></video>
  </div>
</template>

<script>
  export default {
    name: 'videoPlayer',
    props: ['relativeCls'],
    data() {
      return {
        relative: this.relativeCls
      }
    }
  }
</script>

<style>

  video {
    width: 100%;
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
