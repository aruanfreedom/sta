// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'

Vue.use(VueResource);

Vue.http.interceptors.push(function(request, next) {

    // modify method
    request.method = 'GET';

    // modify headers
    request.headers.set('Content-Type', 'application/x-www-form-urlencoded');

    // continue to next interceptor
    next();
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
})