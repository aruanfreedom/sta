<template>
     <!-- Footer start -->
    <div id="footer" class="u-full-width">
        <div class="max-center">
            <a id="info-service" href="#" @click.prevent="showModal = true">О сервисе</a>
            <a href="#">Условия использования</a>
            <a href="#">Правило и безопасность</a>
            <span class="u-pull-right">
            @2017 AdsMe, LLC
        </span>
        </div>
        <Modal v-if="showModal" @close="showModal = false">

                  <h4 slot="header">{{titleModal}}</h4>
                  <small class="info-date" slot="date"></small>
                  <div class="modal-body" slot="body" >
                    <p><b>Для владельцев экрана:</b></p>
                    <p>С помощью этого сервиса Вы сможете заработать деньги, у Вас есть кафе, ресторан, магазин. В нем есть любой экран подключенный к интернету? Ну тогда просто зарегистрируйся на нашем сервисе выбери какую рекламу будешь у себя показывать и начинай зарабатывать.</p>
                    <p><b>Ты владелец ИП, ТОО, само занятый:</b></p>
                    <p>Сними свою рекламу на свой телефон, зарегистрируйся на нашем сервисе, выбери место трансляции, время и оплати услугу и начни активно рекламировать свою продукцию или услугу.</p>
                  </div>

            </Modal>
    </div>
    <!-- Footer end -->
</template>

<script>
import Modal from './Modal'
    export default {
        name: 'Footer',
        components: {
            Modal: Modal
        },
       data() {
           return {
             titleModal: 'О сервисе',
             showModal: false
           }
       }
    }
</script>

<style>
    /* Footer start */

    .modal-container {
        min-width: 600px;
    }

    .modal-container p {
        margin-bottom: 5px;
    }

    #footer {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        background: #263238;
        padding: 10px 20px;
        box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28);
        height: 45px;
        min-width: 960px;
    }

    #footer.footer-relative {
        position: relative;
    }

    #footer a {
        color: #fff;
        margin: 0 1px;
        display: inline-block;
        padding: 3px;
        text-decoration: none;
    }

    #footer a:hover {
        background: rgba(0, 0, 0, .1);
    }

    #footer span {
        color: #fff;
        margin: 0 1px;
        display: inline-block;
        padding: 3px;
    }
    /* Footer end */
</style>
