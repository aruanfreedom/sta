<template>
     <!-- Footer start -->
    <div id="footer" class="u-full-width">
        <div class="max-center">
            <a id="info-service" href="#">О сервисе</a>
            <a href="#">Условия использования</a>
            <a href="#">Правило и безопасность</a>
            <span class="u-pull-right">
            @2017 AdsMe, LLC
        </span>
        </div>
    </div>
    <!-- Footer end -->
</template>

<script>
    export default {
        name: 'Footer'
//        data() {
//            return {
//              
//            }
//        }
    }
</script>

<style>
    /* Footer start */

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
