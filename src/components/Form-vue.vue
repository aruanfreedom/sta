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
        <h4 class="text-center"> {{title}}</h4>
        <form action="/login" @submit.prevent="auth" class="card">
          <div class="form-skl" v-if="role === 'advertiser' || role === 'screenHolder'">
            <label>Название компании <span class="red">&#9913;</span>
              <input type="text" autofocus placeholder="ТОО Company" v-model="nameCompany" class="u-full-width" required>
            </label>
          </div>
          <div class="form-skl">
            <label>Email <span class="red" v-if="role === 'advertiser' || role === 'screenHolder'">&#9913;</span>
              <input type="email"
                     v-model="email"
                     :value="email"
                     autofocus
                     placeholder="user@mail.com"
                     class="u-full-width"
                     required>
            </label>
          </div>
          <div class="form-skl" :class="{error: isErrorPass}">
            <label>Пароль <span class="red" v-if="role === 'advertiser' || role === 'screenHolder'">&#9913;</span>
              <input v-if="role === 'advertiser' || role === 'screenHolder'"
                     type="password"
                     v-model="password"
                     :value="password"
                     class="u-full-width"
                     required
                     pattern="((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,})">
              <input v-if="role !== 'advertiser' && role !== 'screenHolder'"
                     type="password"
                     v-model="password"
                     class="u-full-width"
                     required>
            </label>
          </div>
          <div class="form-skl" :class="{error: isErrorPass}" v-if="role === 'advertiser' || role === 'screenHolder'">
            <label>Повторить пароль <span class="red">&#9913;</span>
              <input type="password" v-model="confirmPassword" class="u-full-width" required>
              <small class="error-msg" v-if="isErrorPass">* Пароли не совпадают</small>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>Город<span class="red">&#9913;</span>
              <select disabled="disabled">
                <option value="">Выберите город</option>
                <option value="Астана" selected="selected">Астана</option>
                <!--<option :value="city.cityName" v-for="city in cityes">{{street.cityName}}</option>-->
              </select>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>Улица<span class="red">&#9913;</span>
              <input id="clickme" type="text" class="filter u-full-width" v-model="streetAdressFilter" :placeholder="streetAdress">
              <select id="choose" v-model="streetAdress" :disabled="streets.length ? false : true " style="display:none;">
                <option value="">Выберите улицу</option>
                <option :value="street.streetName" v-for="street in filteredItems">{{street.streetName}}</option>
              </select>
            </label>
          </div>
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>Дом <span class="red">&#9913;</span>
              <input type="text" placeholder="Номер дома" v-model="home" class="u-full-width" required>
            </label>
          </div>
          <!--<div class="form-skl" v-if="role === 'screenHolder'">
            <label>Квартира <span class="red">&#9913;</span>
              <input type="text" placeholder="Номер квартиры" v-model="apartment" class="u-full-width" required>
            </label>
          </div>-->
          <div class="form-skl" v-if="role === 'screenHolder'">
            <label>Стоимость за секунду (тг) <span class="red">&#9913;</span>
              <input type="number" placeholder="50" v-model="priceSecond" class="u-full-width" required>
            </label>
          </div>
          <!--<div class="form-skl" v-if="role === 'screenHolder'">   
            <label>График работы экрана <span class="red">&#9913;</span><br>
              С <input type="time" v-model="workStart" required>
              До <input type="time" v-model="workEnd" required>
            </label> 
          </div>
          -->
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
        <!--<div class="text-center" v-if="role !== 'advertiser' && role !== 'screenHolder'">
          <span>Нет учетной записи? Зарегестрируйся</span>
        </div>-->
      </div>
     <!-- <div class="container" v-if="role !== 'advertiser' && role !== 'screenHolder'">
        <router-link to="registration" class="u-pull-left button-primary button">Я хочу разместить видео рекламу
        </router-link>
        <router-link to="registration-screen" class="u-pull-right button-primary button">У меня есть экран</router-link>
        <div class="u-cf"></div>
      </div>-->
    </div>
  </div>
</template>

<script>
  import TopMenu from './TopMenu';
  import Bottom from './Bottom';
  import toastr from 'toastr';

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
        streetAdressFilter: "",
        value: null,
        options: ['list', 'of', 'options'],
        cityes: [],
        city: 'Астана',
        home: '',
        apartment: '',
        email: localStorage['login'],
        streets: [],
        password: localStorage['password'],
        nameCompany: '',
        confirmPassword: '',
        saveAuth: localStorage['saveAuth'],
        streetAdress: '',
        priceSecond: '',
        // workStart: '',
        // workEnd: '',
        isErrorPass: false,
        isErrorPassVerify: false,
        isErrorUser: false
      }
    },
    computed: {
    filteredItems() {
        return this.streets.filter(street => {
          return street.streetName.indexOf(this.streetAdressFilter.toLowerCase()) > -1
        })
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
            addressOfMonitor: `г. ${this.city}, ул. ${this.streetAdress}, дом. ${this.home}, кв. ${this.apartment}`
            // graphOfWork: "с " + this.workStart + " до " + this.workEnd
          };

        let roleSend = () => {

          dataJson = JSON.stringify(regMonitorData);

          this.$resource('register').save({}, dataJson).then((response) => {

            if (response.body.resultFromDb.n === 1) {
                this.$router.push('/email-activate');
            } else if (response.body.resultFromDb.message) {
              toastr.error("Почта занята");
            } else if (response.body.code === "noCsrfToken") {
              toastr.error("Ваша сессия истекла");
              let home = () => {
                this.$router.push('/');
              }
              home();
            }
          }, (response) => {
            toastr.error("Неполадки в системе. Попробуйте позже.");

          });
        };

        let loginSend = () => {
          dataJson = JSON.stringify(loginData);
          this.$resource('login').save({}, dataJson).then((response) => {

            if (response.body.code === 'activateEmailError') {
              toastr.error("Пожалуйста активируйте почту!", "Ошибка");
            } else if (response.body.code === 'userNotFound') {
              toastr.error("Такой пользователь не найден", "Ошибка");
            } else if (response.body.code === 'noCsrfToken') {
              toastr.error("Ваша сессия истекла", "Ошибка", () => {
                this.$router.push('/');
              });
            } else if (response.body.code === 'passWrongRegExp' || response.body.code === 'passWrong') {
              toastr.error("Не правильный логин/пароль", "Ошибка", () => {
                this.$router.push('/');
              });
            } else if (response.body.code === 'ok') {
              localStorage.setItem('sessionToken', response.body.sessionToken);
              localStorage.setItem('saveAuth', this.saveAuth);
              if(this.saveAuth) {
                localStorage.setItem('role', response.body.role);
                localStorage.setItem('login', this.email);
                localStorage.setItem('password', this.password);
              } else {
                localStorage.removeItem('login');
                localStorage.removeItem('password');
                localStorage.removeItem('saveAuth');
              }
            }
            if (response.body.role === "screenHolder") {
              this.$router.push('/cabinet');
            } else if(response.body.role === "advertiser") {
              this.$router.push('/cabinet-advertiser');
            }

          }, (response) => {
            toastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка");

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
    },
    mounted() {
        if (this.role === 'screenHolder') { // Проверям кто региструется и выводим список улиц если это screenHolder
          let data = {
              tokenCSRF: localStorage['tokenCSRF']
            },
            dataJson = JSON.stringify(data);

          this.$resource('getstreets').save({}, dataJson).then((response) => {
            if (response.body.resultFromDb.length) {
              this.streets = response.body.resultFromDb;
            } else {
              // miniToastr.info("Список улиц пуст", "Оповещение!", 5000);
            }

          }, (response) => {
            toastr.error("Неполадки в системе. Попробуйте позже.");

          });
        }

        if (localStorage.role === 'screenHolder') { // Проверяем кто зашел и куда его перекинуть если он был авторизован
          this.$router.push('/cabinet');
        } else if (localStorage.role === 'advertiser') {
          this.$router.push('/cabinet-advertiser');
        }

        $("#clickme").on("click",function(){
          var se=$("#choose");
          se.show();
          se[0].size=2;
        });
        
        $("#choose").on("click",function(){
          var se=$(this);
          se.hide();
        });

    }
  }
</script>

<style>
  /* Login start */

  #choose {
    height: 200px;
  }

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

  select {
    max-width: 100%;
    width: 100%;
  }

  select[disabled='disabled'] {
    background: #dddddd;
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
