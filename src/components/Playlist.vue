<template>
  <div id="playlist">
    <div class="card playlist-add">
      <span class="playlist-title">{{playlistTitle}}</span>
      <label for="add-video" class="u-pull-right" v-if="addVideoVisible">
        <img src="static/img/icons/ic_playlist_add_black_36px.svg" alt="add-video">
      </label>
      <input type='file' id="add-video" accept='video/*' @change="addVideo"/>
    </div>
    <ul class="card playlists-items">
      <li class="playlist-empty" v-if="!videoFileList.length">Нет видеофайлов</li>
      <li class="progress-bar"
          :style="{width: (procentLoading <= 100) ? procentLoading + '%' : procentLoading = 100}"
          :class="{doneVideo: procentLoading > 50}" v-if="procentLoading">
      </li>
      <li v-if="procentLoading" class="text-center">
        <span class="procent-number">{{Math.floor(procentLoading) + '%'}} </span>
      </li>
      <li class="playlists-item"
          :class="{active: activeVideo === videoFileItem._id,
                   confirmed: videoFileItem.statusOfEnableVideo === true,
                   notConfirmed: videoFileItem.statusOfEnableVideo === false}"
          v-for="videoFileItem in videoFileList"
          @mouseleave="del = false">

        <div class="five columns" :title="videoFileItem.originalFileName" @click="linkVideo(videoFileItem.mpdOutputFile); activeVideo = videoFileItem._id">
        <img class="playlist-skrin" :src="videoFileItem.linkToPoster" alt="skrin">
          </div>

        <div class="four columns" @click="linkVideo(videoFileItem.mpdOutputFile); activeVideo = videoFileItem._id">
        <span class="playlist-block-title" :title="videoFileItem.originalFileName">
                                        <b class="playlist-title">{{videoFileItem.originalFileName}}</b>
                                        <!--<small class="playlist-ip">Zhanalemi</small>-->
                                </span>
          </div>
        <div class="three columns text-right">
        <div class="options">
          <span v-if="!advertiserAccess">
            <img src="static/img/icons/ic_done_black_16px.svg" @click="videoDoneSend(videoFileItem._id)" v-if="!videoFileItem.statusOfEnableVideo" alt="options">
            <img src="static/img/icons/ic_done_all_black_24px.svg" v-if="videoFileItem.statusOfEnableVideo" alt="options">
          </span>
          <img src="static/img/icons/ic_delete_forever_black_24px.svg" alt="options" @click="del = videoFileItem._id">
          <span class="options-title" :class="{remove: del === videoFileItem._id}">
            Удалить?
            <strong @click="deleteVideo(videoFileItem._id)"><button>Да</button></strong>
          </span>
        </div>
          </div>

        <div class="u-cf"></div>
      </li>

    </ul>
  </div>
</template>

<script>
  import miniToastr from 'mini-toastr'

  export default {
    name: 'playlist',
    props: ['playlistTitleParent', 'iconVisibleAdd', 'advertiserAccess'],
    data() {
      return {
        playlistTitle: this.playlistTitleParent || '',
        progressNumber: 0,
        progressAnim: 0,
        addVideoVisible: this.iconVisibleAdd || false,
        videoFileList: [],
        del: false,
        activeVideo: false,
        procentLoading: 0
      }
    },
    mounted() {

        if (this.advertiserAccess) {
          this.advertiserFunc();
        } else {
          this.screenHolderFunc();
        }

    },
    methods: {
      videoDoneSend: function(videoId) {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken'],
            videoSchedullingId: videoId
          },
          dataJson = JSON.stringify(data);

        this.$resource('enableoneschedullingvideo').save({}, dataJson).then((response) => {
          console.log(response);
          if (response.body.code === "ok") {
              console.log('ok');
              this.screenHolderFunc();
          }
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });

      },
      linkVideo: function (linkVideo) {
        this.$emit('linkVideo', linkVideo);
      },
      advertiserFunc: function () {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('getallvideos').save({}, dataJson).then((response) => {
          console.log(response);
          this.videoFileList = response.body.resultFromDb;
//          this.videoFileList.reverse();
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });

      },
      screenHolderFunc: function () {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('getallvideoforscreenholder').save({}, dataJson).then((response) => {
          console.log(response);
          this.videoFileList = response.body.resultFromDb;
//          this.videoFileList.reverse();
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });

      },
      addVideo: function (e) {
        let dataJson,
            formData = new FormData(),
            file = e.target.files || e.dataTransfer.files;

        if (!file.length) {
          miniToastr.error("файл не выбран", "Ошибка!", 5000);
          return false;
        }

        this.progressNumber = file[0].size;

        console.log(file[0].size);

        let progressStart = 100000000 / file[0].size,
            progressSumma = (Math.ceil(file[0].size) / 1000000 <= 10) ? 2 : 5,
            progressEnd = progressStart / progressSumma,
            progressStep = 0,
            progressAnimStep = 0,
            limit = 100;
//        return false;

        let progress = () => {
          progressStep = progressStep +  progressEnd;
          this.procentLoading = progressStep;
        };

        formData.append('file', file[0]);

        // Первое обращение partFile

        this.$resource('addvideo', {}, {}, {
          headers: {
            "tokenCSRF": localStorage['tokenCSRF'],
            "Content-Type": "boundary=----WebKitFormBoundaryxpcMTuXDEYFClcUI",
            "sizeFile": "partFile",
            "sessionToken": localStorage['sessionToken']
          },
          progress: progress
        }).save({}, formData).then((response) => {
          console.log("Первое обращение partFile");
          console.log(response);

          if(response.body.code === 'lengthVideoError') {
            miniToastr.error("Не правильный формат видео", "Ошибка!", 5000);
          } else if(response.body.code === 'sizeFileHeaderError') {
            miniToastr.error("Размер видео превышен 100 мб", "Ошибка!", 5000);
          } else if(response.body.code === 'noThisVideo') {
            miniToastr.error("файл должен быть в формате видео", "Ошибка!", 5000);
          } else if(response.body.code === 'noHeightVideo') {
            miniToastr.error("файл должен быть в качестве не ниже 360px", "Ошибка!", 5000);
          }
          else if(response.body.code === "ok") {
            // Второе обращение fullFile

            this.$resource('addvideo', [], [], {
              headers: {
                "tokenCSRF": localStorage['tokenCSRF'],
                "sizeFile": "fullFile",
                "sessionToken": localStorage['sessionToken']
              },
              progress: progress
            }).save({}, formData).then((response) => {
              console.log("Второе обращение fullFile");
              console.log(response);
              if (response.body.code === 0) {
                this.advertiserFunc();
                miniToastr.success("Загрузка видео успешно завершена", "Оповещение", 5000);
                this.procentLoading = 0;
//                this.progressAnim = this.progressNumber;
              }
            }, (response) => {
              this.procentLoading = 0;
              console.error('error', response);
              miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
            });
          }

        }, (response) => {
          this.procentLoading = 0;
          console.error('error', response);
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
        });
      },
      deleteVideo: function (videoId) {
          let videoID = videoId || false;
          if(!videoID) {
              console.error('Нет id видео');
              return false;
          }
          let dataAdvertiser = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken'],
            videoId: videoID
          },
          dataScreenHolder = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken'],
            videoSchedullingId: videoID
          },
          dataJsonAdvertiser = JSON.stringify(dataAdvertiser),
          dataJsonScreenHolder = JSON.stringify(dataScreenHolder);

        if (this.advertiserAccess) { // Если это ипешник
          this.$resource('deleteonevideo').save({}, dataJsonAdvertiser).then((response) => {
            console.log(response);
          if(response.body.resultFromDb.n === 1) {
            miniToastr.info("Видео успешно удалено", "Оповещение", 5000);
            let deleteArr = this.videoFileList.filter(function (video) {
              return video._id !== videoID;
            });
            this.videoFileList = deleteArr;
          } else {
            miniToastr.error("Операция не удалась", "Ошибка!", 5000);
          }
        }, (response) => {
            miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
            console.error('error', response);
          });
        } else { // Или экрана-владелец
          this.$resource('deleteoneschedullingvideo').save({}, dataJsonScreenHolder).then((response) => {
            console.log(response);
          if(response.body.resultFromDb.n === 1) {
            miniToastr.info("Видео успешно удалено", "Оповещение", 5000);
            let deleteArr = this.videoFileList.filter(function (video) {
              return video._id !== videoID;
            });
            this.videoFileList = deleteArr;
          } else {
            miniToastr.error("Операция не удалась", "Ошибка!", 5000);
          }
        }, (response) => {
            miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
            console.error('error', response);
          });
        }
      },
      cancelAddVideo: function() {
          this.addVideo('cancel');
      }
    }
  }
</script>

<style>
  /* Playlist start */

  .procent-number {
    color: #000;
    font-weight: bold;
  }

  .progress-bar {
    position: relative;
    background-color: #fff;
    background-image:
      -webkit-linear-gradient(
        -45deg,
        #2196F3 25%,
        transparent 25%,
        transparent 50%,
        #2196F3 50%,
        #2196F3 75%,
        transparent 75%,
        transparent
      );
    background-image:
      -moz-linear-gradient(
        -45deg,
        #2196F3 25%,
        transparent 25%,
        transparent 50%,
        #2196F3 50%,
        #2196F3 75%,
        transparent 75%,
        transparent
      );
    background-image:
      -ms-linear-gradient(
        -45deg,
        #2196F3 25%,
        transparent 25%,
        transparent 50%,
        #2196F3 50%,
        #2196F3 75%,
        transparent 75%,
        transparent
      );
    background-image:
      linear-gradient(
        -45deg,
        #2196F3 25%,
        transparent 25%,
        transparent 50%,
        #2196F3 50%,
        #2196F3 75%,
        transparent 75%,
        transparent
      );
    -webkit-background-size:50px 50px;
    -moz-background-size:50px 50px;
    -ms-background-size:50px 50px;
    background-size:50px 50px;
    -webkit-animation:move 2s linear infinite;
    -moz-animation:move 2s linear infinite;
    -ms-animation:move 2s linear infinite;
    animation:move 2s linear infinite;
    height: 0px;
  }

  /*
Animate the stripes
*/
  @-webkit-keyframes move{
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }
  @-moz-keyframes move{
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }
  @-ms-keyframes move{
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }
  @keyframes move{
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }

  .progress-bar.doneVideo {
    background-color: #5ab500;
    background-image:
      -webkit-linear-gradient(
        -45deg,
        rgba(234,246,244, 1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(234,246,244, 1) 50%,
        rgba(234,246,244, 1) 75%,
        transparent 75%,
        transparent
      );
    background-image:
      -moz-linear-gradient(
        -45deg,
        rgba(234,246,244, 1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(234,246,244, 1) 50%,
        rgba(234,246,244, 1) 75%,
        transparent 75%,
        transparent
      );
    background-image:
      -ms-linear-gradient(
        -45deg,
        rgba(234,246,244, 1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(234,246,244, 1) 50%,
        rgba(234,246,244, 1) 75%,
        transparent 75%,
        transparent
      );
    background-image:
      linear-gradient(
        -45deg,
        rgba(234,246,244, 1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(234,246,244, 1) 50%,
        rgba(234,246,244, 1) 75%,
        transparent 75%,
        transparent
      );
    -webkit-background-size:50px 50px;
    -moz-background-size:50px 50px;
    -ms-background-size:50px 50px;
    background-size:50px 50px;
  }

  .playlist-empty {
    background: #9C27B0;
    color: #fff;
    padding: 15px 10px;
  }

  #add-video {
    cursor: pointer;
    position: absolute;
    visibility: hidden;
    width: 10px;
  }

  #playlist .playlists-items {
    overflow-y: scroll;
    padding: 0;
    height: 398px;
    margin-bottom: 0;
  }

  #playlist .playlists-items .playlists-item {
    display: table;
    cursor: pointer;
    height: 70px;
    padding: 0;
    margin: 0;
  }

  #playlist .playlists-items .playlists-item:hover .playlist-ip {
    color: #555;
  }

  #playlist .playlists-items .playlists-item.confirmed {
    background-color: #009688;
    background-color: rgba(0, 150, 136, 0.2);
  }

  #playlist .playlists-items .playlists-item.notConfirmed {
    background-color: #F44336;
    background-color: rgba(244, 67, 54, 0.2);
  }

  #playlist .playlists-items .playlists-item.notConfirmed .playlist-ip {
    color: #555;
  }

  #playlist .playlists-items .playlists-item.confirmed .playlist-ip {
    color: #555;
  }

  #playlist .playlists-items .playlists-item:hover,
  #playlist .playlists-items .playlists-item:active,
  #playlist .playlists-items .playlists-item:focus,
  #playlist .playlists-items .playlists-item.active {
    background-color: #e5e5e5;
    background-color: rgba(158, 158, 158, 0.2);
  }

  #playlist .playlists-items .playlists-item .playlist-skrin {
    display: table-cell;
    vertical-align: middle;
    height: auto;
    width: auto;
    max-width: 100%;
  }

  #playlist .playlists-items .playlists-item .playlist-block-title {
    position: relative;
    display: block;
    padding: 30px 0 0 0;
    width: auto;
  }

  #playlist .playlists-items .playlists-item .options {
    padding: 30px 10px 0 0;
    position: relative;
  }

  #playlist .playlists-items .playlists-item .options .options-title {
    display: none;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
    background: #fff;
    color: #000;
    position: absolute;
    padding: 20px 10px 10px 10px;
    top: 7px;
    right: 15px;
    width: 160px;
  }

  #playlist .playlists-items .playlists-item .options .options-title img {
    position: relative;
    top: 5px;
  }

  #playlist .playlists-items .playlists-item .options .options-title.remove {
    display: block;
  }

  #playlist .playlists-items .playlists-item .playlist-title {
    display: block;
    overflow: hidden;
    height: 21px;
  }

  #playlist .playlists-items .playlists-item .playlist-ip {
    display: block;
    color: #ccc;
  }

  #playlist .playlists-items a {
    color: #000;
    text-decoration: none;
  }

  #playlist ul {
    list-style: none;
  }

  #playlist ul li {
    border-bottom: 2px solid #f7f7f7;
    padding-bottom: 15px;
  }

  #playlist .playlist-add .playlist-title {
    display: inline-block;
    padding: 5px 0 0 0;
    color: #000;
  }

  #playlist .playlist-add {
    position: relative;
    padding: 20px 25px 20px 20px;
    border-bottom: 2px solid #f7f7f7;
    margin: 0;
  }

  #playlist .playlist-add img {
    cursor: pointer;
  }

  /* Playlist end */
</style>
