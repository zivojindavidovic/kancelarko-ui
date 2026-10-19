<template>
    <div class="app-card">
        <div class="app-card-box" :class="boxClass">
            <div class="app-card-header app-card-header-divider app-card-header-inline" :class="{'border-0 p-0': hideBorder == true && file == null && !existingFileName }">
                <h3 class="h3 app-card-title normal-text-color">
                    {{ title }}
                </h3>

                <button v-if="canShowAddButton" type="button" class="btn btn-sm btn-outline-primary" @click="triggerFileSelect">
                    {{ addButtonLabel }}
                </button>

                <input ref="fileInput" type="file" class="d-none" :accept="accept" @change="handleFileChange">
            </div>

            <div v-if="shouldShowBody" class="app-card-body g-0">
                <div class="app-card-row gap-12px">
                    <img
                        v-if="showImage && isImage && imagePreview"
                        :src="imagePreview"
                        alt="Preview"
                        class="image-preview"
                    >

                    <div class="app-card-value muted-text-color">
                        <span class="app-card-value-ellipsis">
                            {{ displayedFileName }}
                        </span>
                    </div>

                    <div v-if="hasDisplayedFile" class="app-card-row-right">
                        <div class="app-card-action" @click="removeFile">
                            <k-icon name="delete" wrapperClass="icon-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KDocumentUpload',

    props: {
        title: {
            type: String,
            required: true,
        },
        file: {
            type: [File, Object, null],
            default: null,
        },
        existingFileName: {
            type: String,
            default: '',
        },
        emptyText: {
            type: String,
            default: '',
        },
        showEmptyState: {
            type: Boolean,
            default: false,
        },
        hideAddWhenHasFile: {
            type: Boolean,
            default: false,
        },
        addButtonLabel: {
            type: String,
            default: 'Dodajte',
        },
        accept: {
            type: String,
            default: '.pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.csv',
        },
        boxClass: {
            type: String,
            default: '',
        },
        hideBorder: {
            type: Boolean,
            default: false,
        },
        showImage: {
            type: Boolean,
            default: false,
        },
        existingFileUrl: {
            type: String,
            default: '',
        },
    },

    emits: ['select', 'remove'],

    computed: {
        hasDisplayedFile() {
            return Boolean(this.file?.name || this.existingFileName)
        },
        displayedFileName() {
            return this.file?.name || this.existingFileName || this.emptyText
        },
        shouldShowBody() {
            return this.hasDisplayedFile || this.showEmptyState
        },
        canShowAddButton() {
            return !this.hideAddWhenHasFile || !this.hasDisplayedFile
        },
        isImage() {
            const fileName = this.file?.name || this.existingFileName || ''

            return /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)
        },
        imagePreview() {
            // novo uploadovana slika
            if (this.objectUrl && this.isImage) {
                return this.objectUrl
            }

            // postojeca slika sa servera
            if (this.existingFileUrl && this.isImage) {
                return this.existingFileUrl
            }

            return null
        },
    },

    watch: {
        file: {
            immediate: true,
            handler(value) {
                if (this.objectUrl) {
                    URL.revokeObjectURL(this.objectUrl)
                    this.objectUrl = null
                }

                if (value instanceof File) {
                    this.objectUrl = URL.createObjectURL(value)
                }

                if (!value) {
                    this.clearNativeInput()
                }
            },
        },

        existingFileName(value) {
            if (!value && !this.file) {
                this.clearNativeInput()
            }
        },
    },

    data() {
        return {
            objectUrl: null,
        }
    },

    beforeUnmount() {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl)
        }
    },

    methods: {
        triggerFileSelect() {
            this.$refs.fileInput?.click()
        },
        handleFileChange(event) {
            const file = event.target.files?.[0] || null

            if (!file) return

            this.$emit('select', file)
        },
        removeFile() {
            this.clearNativeInput()
            this.$emit('remove')
        },
        clearNativeInput() {
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = ''
            }
        },
    },
}
</script>
