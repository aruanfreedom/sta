// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'

// Css import
import normalize from './assets/css/normalize.css'
import skeleton from './assets/css/skeleton.css'

Vue.use(VueResource);

Vue.http.options.root = 'http://test.efflife.kz';
// Vue.http.options.emulateHTTP = true;
// Vue.http.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
// Vue.http.headers.common['Access-Control-Allow-Origin'] = 'true';

Vue.http.interceptors.push((request, next) => {
  request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  // request.headers['Accept'] = 'application/json'
  next()
});

// Vue.http.interceptors.push((request, next) => {
//   request.headers.set('Content-Type', 'application/x-www-form-urlencoded');
//   request.headers.set('Access-Control-Allow-Origin', '*');
//   next();
// });

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
});
