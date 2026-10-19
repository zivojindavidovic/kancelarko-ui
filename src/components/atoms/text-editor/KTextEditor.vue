<template>
    <Editor
        v-model="value"
        :tinymce-script-src="scriptSrc"
        :license-key="licenseKey"
        :init="editorConfig"
        :disabled="disabled"
        @init="handleEditorInit"
    />
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import { resolveThemeFor, THEME_CHANGE_EVENT } from '../../../helpers/theme'

export default {
    name: 'KTextEditor',

    components: {
        Editor
    },

    props: {
        modelValue: {
            type: String,
            default: ''
        },
        config: {
            type: Object,
            default: () => ({})
        },
        placeholder: {
            type: String,
            default: ''
        },
        /**
         * Putanja do self-hosted TinyMCE skripte (postinstall paketa je kopira u public/tinymce).
         */
        scriptSrc: {
            type: String,
            default: '/tinymce/tinymce.min.js'
        },
        licenseKey: {
            type: String,
            default: 'gpl'
        },
        height: {
            type: [Number, String],
            default: 400
        },
        /**
         * Naziv icon pack-a (public/tinymce/icons/<icons>/icons.js). Kancelarko pack je src/helpers/tinymce-icons.js.
         */
        icons: {
            type: String,
            default: 'kancelarko'
        },
        disabled: {
            type: Boolean,
            default: false
        },
    },

    emits: ['update:modelValue'],

    data() {
        return {
            editor: null,
            currentTheme: resolveThemeFor(null),
            themeObserver: null,
        }
    },

    computed: {
        value: {
            get() {
                return this.modelValue
            },

            set(val) {
                this.$emit('update:modelValue', val)
            }
        },
        editorTextColor() {
            const fallbackColor = this.currentTheme === 'light' ? '#0F0F0F' : '#FFFFFF'

            return window.getComputedStyle(document.documentElement)
                .getPropertyValue('--tinymce-text-white-color')
                .trim() || fallbackColor
        },
        editorConfig() {
            return {
                promotion: false,
                branding: false,

                height: this.height,
                menubar: false,
                resize: false,
                statusbar: true, // da se ne vidi footer broj reci/slova i reklama ako je promocija ukljucena
                elementpath: false,
                // skin: 'oxide-dark',
                // content_css: 'dark',

                placeholder: this.placeholder,

                plugins: 'lists link table image code media',
                toolbar: 'undo redo | bold italic underline | bullist numlist | link image table | code',
                toolbar_mode: 'wrap',
                
                icons: this.icons, // koristi custom ikonice, ako neka ikonica ne postoji u icons/kancelarko/icons.js onda ce uzeti fallback default ikonicu od samog plugina

                paste_data_images: false,

                content_style: `
                    body {
                        --app-text-editor-text-color: ${this.editorTextColor};
                        color: var(--app-text-editor-text-color);
                    }

                    body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                        color: #828587 !important;
                        opacity: 1 !important;
                    }

                    p, span, div {
                        color: var(--app-text-editor-text-color);
                    }

                    a {
                        color: #049BE5;
                    }
                `,

                ...this.config
            }
        },
    },

    mounted() {
        this.themeObserver = new MutationObserver(this.syncThemeFromDocument)
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        })
        this.themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme'],
        })
        window.addEventListener(THEME_CHANGE_EVENT, this.syncThemeFromDocument)
    },

    beforeUnmount() {
        this.themeObserver?.disconnect()
        window.removeEventListener(THEME_CHANGE_EVENT, this.syncThemeFromDocument)
    },

    methods: {
        handleEditorInit(event, editor) {
            this.editor = editor
            this.applyEditorTheme()
        },
        syncThemeFromDocument() {
            this.currentTheme = resolveThemeFor(this.$el)
            this.applyEditorTheme()
        },
        applyEditorTheme() {
            const editorBody = this.editor?.getBody()

            if (!editorBody) {
                return
            }

            editorBody.style.setProperty('--app-text-editor-text-color', this.editorTextColor)
        },
    }
}
</script>
