import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/*
 * Sve third-party zavisnosti ostaju eksterne u lib build-u (consumer ih dobija kroz
 * `dependencies`), sem njihovih CSS fajlova koji se bandluju u dist/kancelarko-ui.css.
 */
const externals = [
    'vue',
    'bootstrap',
    'axios',
    'dayjs',
    'dayjs/plugin/isoWeek',
    'date-fns',
    'date-fns/locale',
    'dompurify',
    'sweetalert2',
    'vue3-toastify',
    'floating-vue',
    '@vueform/multiselect',
    '@vuepic/vue-datepicker',
    '@tinymce/tinymce-vue',
    'tinymce',
    'datatables.net',
    'datatables.net-vue3',
    'datatables.net-fixedheader',
    '@fullcalendar/core',
    '@fullcalendar/vue3',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/interaction',
]

const sassOptions = {
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls'],
}

export default defineConfig(({ command, mode }) => {
    const isLibraryBuild = command === 'build' && mode !== 'playground'

    return {
        plugins: [
            vue(),
            ...(command === 'serve' ? [vueDevTools()] : []),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        css: {
            preprocessorOptions: {
                scss: sassOptions,
                sass: sassOptions,
            },
        },
        // lib: asset url-ovi u CSS-u relativni u odnosu na dist/kancelarko-ui.css
        base: isLibraryBuild ? './' : '/',
        publicDir: isLibraryBuild ? false : 'public',
        build: isLibraryBuild
            ? {
                copyPublicDir: false,
                lib: {
                    entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
                    formats: ['es'],
                    fileName: () => 'kancelarko-ui.js',
                },
                cssCodeSplit: false,
                sourcemap: true,
                rollupOptions: {
                    external: externals,
                    output: {
                        chunkFileNames: 'chunks/[name]-[hash].js',
                        assetFileNames: (assetInfo) => {
                            const name = assetInfo.names?.[0] ?? assetInfo.name ?? ''

                            if (name.endsWith('.css')) {
                                return 'kancelarko-ui.css'
                            }

                            return 'assets/[name]-[hash][extname]'
                        },
                    },
                },
            }
            : {
                outDir: 'dist-playground',
            },
    }
})
