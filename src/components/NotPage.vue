<template>
  <!-- Login start -->
  <div>
    <TopMenu></TopMenu>
    <div class="not-bg-page" id="content">
      <div class="container">
        <div class="twelve columns">
          <div class="not-page">
            <div class="text-center">
              <img src="static/img/dribbble-shot-404.png" alt="404 tv">
            </div>
            <div class="text-center">
              <a href="#/">Вернутся на главную</a> - <a href="#/login">Авторизоваться</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Bottom></Bottom>
  </div>

  <!-- Login end -->
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';

  export default {
    name: 'notPage',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom
    }
  }
</script>

<style>

  .not-bg-page {
    background: url("../../static/img/pattern.png") repeat;
    position: absolute;
    height: 100%;
    width: 100%;
  }

  .not-page {
    margin-top: 80px;
  }

</style>
