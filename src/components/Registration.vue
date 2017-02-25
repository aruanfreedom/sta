<template>
  <div>
    <TopMenu></TopMenu>
    <div id="content">
      <Form-vue :title="titleForm"
                :role="advertiser"
                :btnSubmitText="submitText">
      </Form-vue>
    </div>
    <Bottom></Bottom>
  </div>

</template>

<script>
    import TopMenu from './TopMenu';
    import Bottom from './Bottom';
    import FormVue from './Form-vue';

    export default {
        name: 'registration',
        data() {
          return {
            titleForm: 'Регистрация ИП',
            advertiser: 'advertiser',
            submitText: 'Зарегестрироваться'
          }
        },
        components: {
            'TopMenu': TopMenu,
            'Bottom': Bottom,
            'Form-vue': FormVue
        }
    }
</script>
