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
      <li class="progress-bar" :style="{width: (procentLoading <= 100) ? procentLoading + '%' : 100  + '%'}" :class="{doneVideo: procentLoading > 80}" v-if="procentLoading"><span>Загрузка {{progressAnim + ' / ' + progressNumber}} </span></li>
      <li class="playlists-item" v-for="videoFileItem in videoFileList" @mouseleave="del = false">

        <!--<img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">-->
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title">{{videoFileItem.originalFileName}}</b>
                                        <!--<small class="playlist-ip">Zhanalemi</small>-->
                                </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_delete_forever_black_24px.svg" alt="options" @click="del = videoFileItem._id">
          <span class="options-title" :class="{remove: del === videoFileItem._id}">
            Удалить?
            <strong @click="deleteVideo(videoFileItem._id)"><img src="static/img/icons/ic_done_black_16px.svg" alt="options">Да</strong>
          </span>
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
        advertiser: this.advertiserAccess || false,
        videoFileList: [],
        del: false,
        procentLoading: 0
      }
    },
    mounted() {

        if (this.advertiser) {
          this.advertiserFunc();
        }

    },
    methods: {
      advertiserFunc: function () {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken']
          },
          dataJson = JSON.stringify(data);

        this.$resource('getallvideos').save({}, dataJson).then((response) => {
          console.log(response);
          this.videoFileList = response.body.resultFromDb;
          this.videoFileList.reverse();
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
          return false;
        }

        this.progressNumber = file[0].size;


        let progressStep = 0,
            progressAnimStep = 0,
            limit = 100;

        let progress = () => {
          console.log('PROGRESS', progressStep);
          if (progressStep >= limit) {
              progressStep = 0;
          }
          this.procentLoading = progressStep += 5;
          this.progressAnim = (this.progressNumber >= progressAnimStep) ? progressAnimStep += 50001: this.progressNumber;

        };

        formData.append('file', file[0]);
        console.log(file);

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
                this.progressAnim = this.progressNumber;
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
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            sessionToken: localStorage['sessionToken'],
            videoId: videoID
          },
          dataJson = JSON.stringify(data);

        this.$resource('deleteonevideo').save({}, dataJson).then((response) => {
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
      },
      cancelAddVideo: function() {
          this.addVideo('cancel');
      }
    }
  }
</script>

<style>
  /* Playlist start */

  .progress-bar {
    position: relative;
    background-color: #f1a165;
    background-image: linear-gradient(to bottom, #CDDC39, #DCE775);
    height: 50px;
  }

  .progress-bar span{
    display: block;
    padding: 20px 0;
    min-width: 100%;
    top: 0;
    left: 10px;
    position: absolute;
    font-weight: bold;
    width: 210px;
  }

  .progress-bar.doneVideo {
    background: #009688;
    background-image: linear-gradient(to bottom, #66BB6A, #81C784);
  }

  .progress-bar.doneVideo span {
    color: #fff;
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
    cursor: pointer;
    padding: 15px 20px;
    margin: 0;
  }

  #playlist .playlists-items .playlists-item:hover .playlist-ip {
    color: #555;
  }

  #playlist .playlists-items .playlists-item.confirmed {
    background-color: #009688;
    background-color: rgba(0, 150, 136, 0.2);
  }

  #playlist .playlists-items .playlists-item.not-confirmed {
    background-color: #F44336;
    background-color: rgba(244, 67, 54, 0.2);
  }

  #playlist .playlists-items .playlists-item.not-confirmed .playlist-ip {
    color: #555;
  }

  #playlist .playlists-items .playlists-item.confirmed .playlist-ip {
    color: #555;
  }

  #playlist .playlists-items .playlists-item:hover {
    background-color: #e5e5e5;
    background-color: rgba(158, 158, 158, 0.2);
  }

  #playlist .playlists-items .playlists-item .playlist-skrin {
    height: 80px;
    width: 80px;
  }

  #playlist .playlists-items .playlists-item .playlist-block-title {
    position: relative;
    display: inline-block;
    margin-left: 10px;
    margin-top: 18px;
  }

  #playlist .playlists-items .playlists-item .options {
    margin-top: 19px;
    position: relative;
  }

  #playlist .playlists-items .playlists-item .options .options-title {
    display: none;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
    background: #fff;
    color: #000;
    position: absolute;
    padding: 10px;
    top: -18px;
    right: 0;
    width: 115px;
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
