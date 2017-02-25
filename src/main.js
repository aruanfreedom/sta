// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import VueMask from 'v-mask'

// Css import
import normalize from './assets/css/normalize.css'
import skeleton from './assets/css/skeleton.css'

Vue.use(VueResource);
Vue.use(VueMask);

Vue.http.options.root = 'http://test.efflife.kz';

// Vue.http.interceptors.push((request, next) => {
//   request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
//   next()
// });

/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {App}
});
