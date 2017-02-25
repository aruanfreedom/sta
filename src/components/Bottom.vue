<template>
     <!-- Footer start -->
    <div id="footer" class="u-full-width" v-bind:class="{ 'footer-relative': relative }">
        <div class="max-center">
            <a id="info-service" href="#">О сервисе</a>
            <a href="#">Условия пользование</a>
            <a href="#">Правило и безопасность {{relativeCls}}</a>
            <span class="u-pull-right">
            @2017 AdsMe, LLC
        </span>
        </div>
    </div>
    <!-- Footer end -->
</template>

<script>
    export default {
        name: 'Footer',
        props: ['relativeCls'],
        data() {
            return {
              relative: this.relativeCls
            }
        }
    }
</script>

<style>
    /* Footer start */

    #footer {
        position: absolute;
        bottom: 0;
        background: #263238;
        padding: 10px 20px;
        box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28);
        height: 45px;
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
