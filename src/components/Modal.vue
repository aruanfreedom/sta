<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              окно
            </slot>
            <slot name="date">
              {{new Date()}}
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <img src="static/img/icons/progress.gif" alt="progress">
            </slot>
          </div>

          <div class="modal-footer text-center">
            <slot name="footer">
              <button class="button button-primary" @click="$emit('close')">
                Закрыть окно
              </button>
              <div class="u-cf"></div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
      name: 'modal'
  }
</script>

<style>

  .info-date{
      position: absolute;
      right: 30px;
      color: #ccc;
      top: 10px;
  }

  img {
    max-width: 100%;
  }

  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
    width: auto;
    position: relative;
    max-width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }

  .modal-header h3 {
    margin-top: 0;
    color: #000;
  }

  .modal-body {
    margin: 20px 0;
  }

  .modal-default-button {
    float: right;
  }

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
