import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/Login'
import Registration from 'components/Registration'
import RegistrationScreen from 'components/RegistrationScreen'
import ForgetPass from 'components/ForgetPass'
import EditPass from 'components/EditPass'
import Cabinet from 'components/CabinetMonitor'
import CabinetAdvertiser from 'components/CabinetAdvertiser'

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
        name: 'resetpass',
        components: {
            default: EditPass
        }
    },{
        path: '/cabinet',
        name: 'cabinet',
        components: {
            default: Cabinet
        }
    },{
        path: '/cabinet-advertiser',
        name: 'cabinet-advertiser',
        components: {
            default: CabinetAdvertiser
        }
    }, {
        path: '*',
        name: 'other',
        components: {
            default: Login
        }
    }]
})
