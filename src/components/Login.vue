<template>
  <!-- Login start -->
  <div>
    <TopMenu></TopMenu>
    <div id="content">
      <Form-vue :title="titleForm"
                :btnSubmitText="submitText">
      </Form-vue>
    </div>
    <Bottom></Bottom>
  </div>

  <!-- Login end -->
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import FormVue from './Form-vue';

  export default {
    name: 'login',
    data () {
        return {
          titleForm: 'Авторизация',
          checkboxText: 'Запомнить пароль',
          submitText: 'Войти'
        }
    },
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'Form-vue': FormVue
    }
  }
</script>


