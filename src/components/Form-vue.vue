<template>
  <div>
    <div class="login">
      <div class="login-card">
        <div class="error-reg-msg" v-if="isErrorPassVerify">
          <p>* Пароль должен иметь: </p>
          <p>Цифру от 0 до 9</p>
          <p>Символ латинницы в нижем регистре и в верхнем регистре</p>
          <p>Специальный символ из списка "@#$%"</p>
          <p>Длину от 8 символов</p>
        </div>
        <div class="error-reg-msg" v-if="isErrorEmail">
          <p class="red">* Пожалуйста активируйте почту </p>
        </div>
        <div class="error-reg-msg" v-if="isErrorEmailBusy">
          <p class="red">* Это почта зарегистрированна </p>
        </div>
        <h4 class="text-center"> {{title}}</h4>
        <form action="/login" @submit.prevent="auth" class="card">
          <div class="form-skl" v-if="role === 'advertiser' || role === 'screenHolder'">
            <label>Название компании <span class="red">&#9913;</span>
              <input type="text" v-model="nameCompany" class="u-full-width" required>
            </label>
          </div>
          <div class="form-skl">
            <label>Email <span class="red" v-if="role === 'advertiser' || role === 'screenHolder'">&#9913;</span>
              <input type="email" v-model="email" class="u-full-width" required>
            </label>
          </div>
          <div class="form-skl" :class="{error: isErrorPass}">
            <label>Пароль <span class="red" v-if="role === 'advertiser' || role === 'screenHolder'">&#9913;</span>
              <input v-if="role === 'advertiser' || role === 'screenHolder'" type="password" v-model="password"
                     class="u-full-width" required
                     pattern="((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,})">
              <input v-if="role !== 'advertiser' && role !== 'screenHolder'" type="password" v-model="password"
                     class="u-full-width" required>
              <small class="error-msg" v-if="isErrorUser">* Такой пользователь не найден</small>
            </label>
          </div>
          <div class="form-skl" :class="{error: isErrorPass}" v-if="role === 'advertiser' || role === 'screenHolder'">
            <label>Повторить пароль <span class="red">&#9913;</span>
              <input type="password" v-model="confirmPassword" class="u-full-width" required>
              <small class="error-msg" v-if="isErrorPass">* Пароли не совпадают</small>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>Адрес экрана <span class="red">&#9913;</span>
              <input type="text" v-model="adressMonitor" class="u-full-width" required>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>Стоимость за секунду (тг) <span class="red">&#9913;</span>
              <input type="number" v-model="priceSecond" class="u-full-width" required>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>График работы экрана <span class="red">&#9913;</span><br>
              С <input type="time" v-model="workStart" required>
              До <input type="time" v-model="workEnd" required>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <h6 class="red">Укажите реквизиты для принятия оплаты</h6>
            <label>Номер карточки <span class="red">&#9913;</span>
              <input type="text" class="u-full-width" placeholder="1234-5678-9012-3456" v-mask="'####-####-####-####'" v-model="numberCard" required>
              <small class="error-msg" v-if="isErrorCard">* Не правильный формат</small>
            </label>
          </div>
          <div class="form-skl">
            <label v-if="role === 'advertiser' || role === 'screenHolder'">
              <input type="checkbox" required>
              <span class="label-body">Я принимаю <a href="#">лицензионное соглашение</a></span>
            </label>
            <label v-if="role !== 'advertiser' && role !== 'screenHolder'">
              <input v-model="saveAuth" type="checkbox">
              <span class="label-body">Запомнить пароль</a></span>
            </label>
          </div>
          <div class="form-skl text-center">
            <input type="submit" :value="btnSubmitText" class="button-primary">
          </div>
          <div class="text-center" v-if="role !== 'advertiser' && role !== 'screenHolder'">
            <router-link to="/forget">Забыли пароль?</router-link>
          </div>
        </form>
        <div class="text-center" v-if="role !== 'advertiser' && role !== 'screenHolder'">
          <span>Нет учетной записи? Зарегестрируйся</span>
        </div>
      </div>
      <div class="container" v-if="role !== 'advertiser' && role !== 'screenHolder'">
        <router-link to="registration" class="u-pull-left button-primary button">Я хочу разместить видео рекламу
        </router-link>
        <router-link to="registration-screen" class="u-pull-right button-primary button">У меня есть экран</router-link>
        <div class="u-cf"></div>
      </div>

    </div>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';

  export default {
    name: 'login',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom
    },
    props: [
      'title',
      'role',
      'btnSubmitText'
    ],
    watch: {
      numberCard: function (number) {
        if (number.length < 19) {
          this.isErrorCard = true;
        } else {
          this.isErrorCard = false;
        }
      },
      password: function (val) {
        this.isErrorUser = false;
        if (this.confirmPassword) { // Проверка есть ли проверка пароля, для страницы авторизаций
          let pattern = val.match("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,})");
          if (pattern) {
            this.isErrorPassVerify = false;
          } else {
            this.isErrorPassVerify = true;
          }
        }
      },
      confirmPassword: function (val) {
        if (val !== this.password) {
          this.isErrorPass = true;
        } else {
          this.isErrorPass = false;
        }
      }
    },
    data() {
      return {
        email: '',
        password: '',
        nameCompany: '',
        confirmPassword: '',
        saveAuth: false,
        adressMonitor: '',
        priceSecond: '',
        workStart: '',
        workEnd: '',
        numberCard: '',
        isErrorEmail: false,
        isErrorEmailBusy: false,
        isErrorPass: false,
        isErrorPassVerify: false,
        isErrorUser: false,
        isErrorCard: false
      }
    },
    methods: {
      auth: function () {
        let dataJson,
          loginData = {
            tokenCSRF: localStorage['tokenCSRF'],
            email: this.email,
            pass: this.password
          },
          regMonitorData = {
            tokenCSRF: localStorage['tokenCSRF'],
            email: this.email,
            pass: this.password,
            role: this.role,
            costOfSecond: String(this.priceSecond),
            nameOfCompany: this.nameCompany,
            addressOfMonitor: this.adressMonitor,
            graphOfWork: "с " + this.workStart + " до " + this.workEnd,
            numberOfBankCard: String(this.numberCard)
          };

        let roleSend = () => {

          dataJson = JSON.stringify(regMonitorData);

          console.log(dataJson);

          this.$auth = this.$resource('register');
          this.$auth.save({}, dataJson).then((response) => {
            console.log(response);
            if (response.body.resultFromDb.n === 1) {
              this.isErrorEmail = true;
              setTimeout(() => {
                this.isErrorEmail = false;
                this.$router.push('/');
              }, 4000);
            } else if (response.body.resultFromDb.message) {
              this.isErrorEmailBusy = true;
              setTimeout(() => {
                this.isErrorEmailBusy = false;
              }, 4000);
            }
          }, (response) => {
            console.error('error', response);
          });
        };

        let loginSend = () => {
          dataJson = JSON.stringify(loginData);
          this.$auth = this.$resource('login');
          this.$auth.save({}, dataJson).then((response) => {
            console.log(response);
            if (response.body.code === 'activateEmailError') {
              this.isErrorEmail = true;
              setTimeout(() => {
                this.isErrorEmail = false;
              }, 4000);
            }
            if (response.body.code === 'ok') {
              this.isErrorUser = false;
              localStorage.setItem('role', response.body.role);
              localStorage.setItem('sessionToken', response.body.sessionToken);
              localStorage.setItem('saveAuth', this.saveAuth);
            } else {
              this.isErrorUser = true;
            }
          }, (response) => {
            console.error('error', response);
          });

        };

        // Проверка паролей
        if (this.password !== this.confirmPassword && this.confirmPassword) {
          this.isErrorPass = true;
          return false;
        } else {
          this.isErrorPass = false;
        }

        // Проверка есть ли роли
        if (this.role) {
          roleSend();
        } else {
          loginSend();
        }

      }
    }
  }
</script>

<style>
  /* Login start */

  .login {
    position: relative;
    width: 100%;
  }

  .form-skl {
    position: relative;
  }

  .form-skl.error label {
    color: #F44336;
  }

  .form-skl.error input {
    border-color: #F44336;
  }

  .form-skl .error-msg {
    color: #F44336;
    position: absolute;
    bottom: -5px;
    right: 0px;
  }

  .error-reg-msg {
    background: rgba(0, 0, 0, .7);
    position: fixed;
    border-radius: 10px;
    left: 2%;
    bottom: 8%;
    max-width: 300px;
    padding: 20px;
    z-index: 101;
  }

  .error-reg-msg p {
    margin: 5px 0;
    font-size: 0.9em;
    color: #fff;
  }

  html input[disabled].button-primary,
  button[disabled].button-primary,
  input[disabled="disabled"].button-primary {
    background: #eeeeee;
    border-color: #eeeeee;
  }

  html input[disabled].button-primary:hover,
  button[disabled].button-primary:hover,
  input[disabled="disabled"].button-primary:hover {
    background: #eeeeee;
    border-color: #eeeeee;
  }

  .form-skl.error input:focus {
    border-color: #F44336;
  }

  .login .login-card {
    position: relative;
    margin: 10px auto;
    width: 320px;
  }

  .login .login-card a {
    text-decoration: none;
  }

  .login .login-card h4 {
    margin-bottom: 1rem;
    margin-top: 2rem;
  }

  .login .login-card a:hover {
    text-decoration: underline;
  }

  .login span.label-body {
    font-size: 0.7em;
  }

  /* Login end */
</style>
