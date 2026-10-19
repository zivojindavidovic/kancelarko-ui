// resources/js/plugins/alert.js
import { alert } from './alert';

export default {
    install(app) {
        // Options API: this.$alert
        app.config.globalProperties.$alert = alert;

        // Composition API: const alert = inject('alert')
        app.provide('alert', alert);
    },
};
