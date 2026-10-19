import { customToast } from './toast';

export default {
    install(app) {
        const toastApi = (payload, options = {}) => customToast.show(payload, options);

        toastApi.show = (payload, options = {}) => customToast.show(payload, options);
        toastApi.showToast = (payload, options = {}) => customToast.showToast(payload, options);
        toastApi.notification = (payload, options = {}) => customToast.notification(payload, options);
        toastApi.html = (payload, options = {}) => customToast.html(payload, options);
        toastApi.info = (message, options = {}) => customToast.info(message, options);
        toastApi.success = (message, options = {}) => customToast.success(message, options);
        toastApi.warning = (message, options = {}) => customToast.warning(message, options);
        toastApi.error = (message, options = {}) => customToast.error(message, options);

        app.config.globalProperties.$toast = toastApi;
        app.provide('toast', toastApi);
    }
};
