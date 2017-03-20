<template>
  <div>
    <TopMenu :notification="notification" :nameLink="nameMenus"></TopMenu>

    <div id="content">
      <div class="login">
        <div class="login-card">
          <h4 class="text-center">Вывести деньги</h4>
          <form action="/resetpass" @submit.prevent="auth" class="card">
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
    props: ['relativeCls'],
    data() {
      return {
        numberCard: '',
        isErrorCard: false,
        relative: this.relativeCls,
        advertiser: false,
        notification: true,
        playlistTitle: 'Предлогаемые',
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
    }
  }
</script>

<style>

  .credit-input .credit-cell {
    margin-right: 14px;
    width: 42px;
  }

</style>
