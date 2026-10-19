import { createApp } from 'vue'
import axios from 'axios'
import KancelarkoUI from '../src/index.js'
import '../src/scss/app.scss'
import App from './App.vue'
import { demoResponse } from './demo-data'
import { setTheme } from '../src/helpers/theme'

// u blade projektima ovo setuje backend (session locale)
window.appLocale = window.appLocale || 'rs'

// mock backend za komponente koje same zovu server (KDataTablePrint): sve sto pocinje sa /demo/
axios.interceptors.request.use((config) => {
    if (String(config.url || '').startsWith('/demo/')) {
        config.adapter = async (cfg) => ({
            data: demoResponse(cfg),
            status: 200,
            statusText: 'OK',
            headers: {},
            config: cfg,
        })
    }

    return config
})

// ?theme=light ili ?theme=dark forsira temu (za testiranje)
const forcedTheme = new URLSearchParams(window.location.search).get('theme')
if (forcedTheme) setTheme(forcedTheme, { persist: true })

createApp(App)
    .use(KancelarkoUI, { persistTheme: true })
    .mount('#app')
