import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/Login'
import Registration from 'components/Registration'
import RegistrationScreen from 'components/RegistrationScreen'
import ForgetPass from 'components/ForgetPass'
import EditPass from 'components/EditPass'

Vue.use(Router);

export default new Router({
    routes: [{
        path: '/',
        name: 'Login',
        components: {
            default: Login
        }
    }, {
        path: '/registration',
        name: 'registration',
        components: {
            default: Registration
        }
    }, {
        path: '/registration-screen',
        name: 'registrationScreen',
        components: {
            default: RegistrationScreen
        }
    }, {
        path: '/forget',
        name: 'forget',
        components: {
            default: ForgetPass
        }
    },{
        path: '/resetpass',
        name: 'forget',
        components: {
            default: EditPass
        }
    }, {
        path: '*',
        name: 'other',
        components: {
            default: Login
        }
    }]
})
