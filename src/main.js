// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'


// Css import
import normalize from './assets/css/normalize.css'
import skeleton from './assets/css/skeleton.css'
import toastrCss from 'toastr/build/toastr.min.css'



Vue.use(VueResource);

Vue.http.options.root = 'http://test.efflife.kz';

// try {


new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
});

// } catch(e) {
//   let data = {
//       tokenCSRF: localStorage['tokenCSRF'],
//       error: e
//     },
//     dataJson = JSON.stringify(data);

//   this.$resource('trase').save({}, dataJson).then((response) => {
//     alert('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);

//   }, (response) => {
//     toastr.error("Неполадки в системе. Попробуйте позже.");

//   });
// }
