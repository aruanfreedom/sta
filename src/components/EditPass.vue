<template>
  <div>
    <TopMenu></TopMenu>
    <div id="content">
      <div class="error-reg-msg" v-if="isErrorPassVerify">
        <p>* Пароль должен иметь: </p>
        <p>Цифру от 0 до 9</p>
        <p>Символ латинницы в нижем и в верхнем регистре</p>
        <p>Специальный символ из списка "@#$%"</p>
        <p>Длину от 8 символов</p>
      </div>
      <div class="login">
        <div class="login-card">
          <h4 class="text-center">Новый пароль</h4>
          <form action="/setnewpass" @submit.prevent="auth" class="card">
            <div class="form-skl" :class="{error: isErrorPass}">
              <label>Пароль
                <input type="password" v-model="newPass" class="u-full-width" required>
              </label>
            </div>
            <div class="form-skl" :class="{error: isErrorPass}">
              <label>Подтвердить пароль
                <input type="password" v-model="confirmNewPass" class="u-full-width" required>
                <small class="error-msg" v-if="isErrorPass">* Пароли не совпадают</small>
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
    name: 'resetpass',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom
    },
    data() {
      return {
        newPass: '',
        confirmNewPass: '',
        isErrorPass: false,
        isErrorPassVerify: false
      }
    },
    watch: {
      newPass: function (val) {
        let pattern = val.match("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,})");
        if (pattern) {
          this.isErrorPassVerify = false;
        } else {
          this.isErrorPassVerify = true;
        }
      },
      confirmNewPass: function (val) {
        if (val !== this.newPass) {
          this.isErrorPass = true;
        } else {
          this.isErrorPass = false;
        }
      }
    },
    mounted() {
      if (!localStorage['tokenCSRF']) {
        miniToastr.error("Ваша сессия истекла", "Ошибка!", 5000, () => {
          this.$router.push('/');
        });
      }
    },
    methods: {
      auth: function () {
        let data = {
            tokenCSRF: localStorage['tokenCSRF'],
            activateToken: localStorage['activateToken'],
            pass: this.confirmNewPass
          },
          dataJson = JSON.stringify(data);

        let sendNewPass = () => {
          this.$auth = this.$resource('setnewpass');

          this.$auth.save({}, dataJson).then((response) => {
            console.log(response);
            if (response.body.code === 'ok') {
              this.$router.push('/');
            }
          }, (response) => {
            miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
            console.error('error', response);
          });
        };

        // Проверка паролей
        if (this.newPass !== this.confirmNewPass) {
          this.isErrorPass = true;
        } else if (this.isErrorPassVerify) {
          return false;
        } else {
          sendNewPass();
          this.isErrorPass = false;
          this.isErrorPassVerify = false;
        }


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
