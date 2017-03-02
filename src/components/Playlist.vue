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
      <li class="playlists-item not-confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>
      <li class="playlists-item confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                    </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>
      <li class="playlists-item confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                    </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>
      <li class="playlists-item not-confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                    </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>
      <li class="playlists-item not-confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                    </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>
      <li class="playlists-item not-confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>
      <li class="playlists-item not-confirmed">

        <img class="playlist-skrin u-pull-left" src="static/img/playlist/skrin.png" alt="skrin">
        <span class="playlist-block-title u-pull-left">
                                        <b class="playlist-title ">Видео 01</b>
                                        <small class="playlist-ip">Zhanalemi</small>
                                    </span>
        <div class="u-pull-right options">
          <img src="static/img/icons/ic_more_vert_black_24px.svg" alt="options">
          <span class="options-title button">Удалить</span>
        </div>

        <div class="u-cf"></div>
      </li>

    </ul>
  </div>
</template>

<script>
  export default {
    name: 'playlist',
    props: ['playlistTitleParent', 'iconVisibleAdd'],
    data() {
      return {
        playlistTitle: this.playlistTitleParent || '',
        addVideoVisible: this.iconVisibleAdd || false
      }
    },
    methods: {
      addVideo: function (e) {
        let dataJson,
            parogressNumber = 0,
            formData = new FormData(),
            file = e.target.files[0] || e.dataTransfer.files[0];

//        if (!file.length) {
//          return false;
//        }


        const progress = () => {
          console.log('PROGRESS', parogressNumber++);
        };

        formData.append('file', file);
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

          if(response.body.code === "ok") {
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
            }, (response) => {
              console.error('error', response);
            });
          }

        }, (response) => {
          console.error('error', response);
        });





      }
    }
  }
</script>

<style>
  /* Playlist start */

  #add-video {
    cursor: pointer;
    position: absolute;
    visibility: hidden;
    width: 10px;
  }

  #playlist .playlists-items {
    overflow-y: scroll;
    padding: 0px;
    height: 100%;
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
    display: inline-block;
    margin-left: 10px;
    margin-top: 25px;
  }

  #playlist .playlists-items .playlists-item .options {
    margin-top: 30px;
    position: relative;
  }

  #playlist .playlists-items .playlists-item .options .options-title {
    display: none;
    background: #FF5722;
    color: #fff;
    /*padding: 5px 10px;
    border-radius: 2px;*/
    position: absolute;
    top: 0;
    right: 10px;
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
