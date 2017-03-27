<template>
  <div>
    <TopMenu></TopMenu>

    <div id="content">
      <div class="card offset-top">
        <div>
          <h4 class="text-center">Поздравляю! Вы зарегистрированны<br />Пожалуйста активируйте вашу почту</h4>
        </div>
      </div>
    </div>
    <Bottom></Bottom>
  </div>
</template>

<script>
    import TopMenu from './TopMenu';
    import Bottom from './Bottom';

    export default {
        name: 'cabinetAdvertiser',
        components: {
            'TopMenu': TopMenu,
            'Bottom': Bottom
        }
    }


</script>

<style scoped>
    .offset-top {
        max-width: 500px;
        margin: 50px auto;
    }
</style>