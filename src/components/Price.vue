<template>
  <div>
    <TopMenu :notification="notification" :nameLink="nameMenus"></TopMenu>

    <div id="content">
      <div class="login">
        <div class="login-card">
          <h4 class="text-center">Вывести деньги</h4>
          <form action="/paysendreq" @submit.prevent="priceSend" class="card">
            <div class="form-skl credit-input">
              <label>Номер карточки
                <input type="text" class="credit" placeholder="1234-5678-9012-3456"
                       v-model="numberCard" required>
                <small class="error-msg" v-if="isErrorCard">* Не правильный формат</small>
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
  import miniToastr from 'mini-toastr'
  import credit from '../../static/js/credit.js';

  export default {
    name: 'cabinetAdvertiser',
    components: {
      'TopMenu': TopMenu,
      'Bottom': Bottom
    },
    watch: {
      numberCard: function (number) {
        if (number.length < 19) {
          this.isErrorCard = true;
        } else {
          this.isErrorCard = false;
        }
      }
    },
    methods: {
        priceSend() {
          let inputsValue = $('.credit-input input').val(),
              data = {
                tokenCSRF: localStorage['tokenCSRF'],
                sessionToken: localStorage['sessionToken'],
                cardNumber: inputsValue
              },
              dataJson = JSON.stringify(data);
        
        if (inputsValue.length < 16) {
          this.isErrorCard = true;
          return false;
        }

        this.isErrorCard = false;

        this.$resource('paysendreq').save({}, dataJson).then((response) => {
          console.log(response);
          if (response.body.code === "ok") {
              if (localStorage.role === 'screenHolder') { // Проверяем кто зашел и куда его перекинуть если он был авторизован
                this.$router.push('/cabinet');
                console.log(localStorage.role);
              } else if (localStorage.role === 'advertiser') {
                this.$router.push('/cabinet-advertiser');
              }
          } else {
            miniToastr.error("Платежная система не разрешена для магазина");
          }
        }, (response) => {
          miniToastr.error("Неполадки в системе. Попробуйте позже.", "Ошибка!", 5000);
          console.error('error', response);
        });

        }
    },
    props: ['relativeCls'],
    data() {
      return {
        numberCard: '',
        isErrorCard: false,
        relative: this.relativeCls,
        advertiser: false,
        notification: true,
        iconVisible: false,
        nameMenus: [
          {
            name: 'Cab экран',
            link: '#cabinet'
          }, {
            name: 'On-air',
            link: '#on-air'
          }
        ]
      }
    },
    mounted() {
      $(".credit").credit();
      $('.credit-input input').attr("required", "required")
    }
  }
</script>

<style>

  .credit-input .credit-cell {
    margin-right: 14px;
    width: 42px;
  }

</style>
