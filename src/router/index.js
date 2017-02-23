import Vue from 'vue'
import Router from 'vue-router'
import Hello from 'components/Hello'
import Header from 'components/Header'
import Footer from 'components/Footer'


Vue.use(Router);

export default new Router({
    routes: [{
        path: '/',
        name: 'Hello',
        components: {
          default: Hello,
          header: Header,
          footer: Footer
        }
    }]
})
