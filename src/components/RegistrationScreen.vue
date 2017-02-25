<template>
  <div>
    <TopMenu></TopMenu>
    <div id="content">
      <Form-vue :title="titleForm"
                :role="screenHolder"
                :btnSubmitText="submitText">
      </Form-vue>
    </div>
    <Bottom :relativeCls="relativeCls"></Bottom>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import FormVue from './Form-vue';

  export default {
    name: 'registation',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom,
      'Form-vue': FormVue
    },
    data() {
      return {
        titleForm: 'Регистрация Экрана',
        relativeCls: true,
        submitText: 'Зарегистрироваться',
        screenHolder: 'screenHolder'
      }
    }
  }
</script>
