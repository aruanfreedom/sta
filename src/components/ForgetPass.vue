<template>
  <div>
    <TopMenu></TopMenu>
    <div id="content">
      <div class="login">
        <div class="login-card">
          <h4 class="text-center">Восстановление пароля</h4>
          <form action="/resetpass" @submit.prevent="auth" class="card">
            <div class="form-skl">
              <label>Email
                <input type="email" v-model="email" class="u-full-width" required>
              </label>
            </div>
            <div class="form-skl">
              <input type="submit" class="u-full-width button-primary">
            </div>
          </form>
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
    name: 'forget',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom
    },
    data() {
      return {
        email: ''
      }
    },
    methods: {
      auth: function () {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            email: this.email,
          },
          dataJson = JSON.stringify(data);

        this.$auth = this.$resource('resetpass');
        console.log(dataJson);
        this.$auth.save({}, dataJson).then((response) => {
          if (response.body.activateToken) {
            localStorage.setItem('activateToken', response.body.activateToken);
            this.$router.push('/resetpass');
          }
        }, (response) => {
          console.error('error', response);
        });
      }
    }
  }
</script>

<style scoped>
  .login .login-card {
    margin: 100px auto;
  }

  h4 {
    font-size: 1.5em;
  }
</style>
