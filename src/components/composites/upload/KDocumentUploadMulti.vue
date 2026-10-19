<template>
    <div class="app-card">
        <div class="app-card-box" :class="boxClass">
            <div class="app-card-header app-card-header-inline" :class="allFiles.length ? 'app-card-header-divider' : 'pb-0'">
                <h3 class="h3 app-card-title normal-text-color">
                    {{ title }}
                </h3>

                <button
                    v-if="canShowAddButton"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="triggerFileSelect"
                >
                    {{ addButtonLabel }}
                </button>

                <input
                    ref="fileInput"
                    type="file"
                    class="d-none"
                    :accept="accept"
                    :multiple="multiple"
                    @change="handleFileChange"
                >
            </div>

            <div v-if="allFiles.length || showEmptyState" class="app-card-body g-0">
                <template v-if="allFiles.length">
                    <div
                        v-for="(file, index) in allFiles"
                        :key="file.ID ?? file._tempId"
                        class="app-card-row p-16 align-items-center"
                    >
                        <div class="app-card-value muted-text-color">
                            <span class="app-card-value-ellipsis">
                                {{ file.fileName ?? file.file?.name ?? file.name }}
                            </span>
                        </div>

                        <div class="app-card-row-right d-inline-flex gap-3">
                            <div
                                v-if="canDownload"
                                class="app-card-action"
                                :title="downloadLabel"
                                @click="$emit('download', {file, index})"
                            >
                                <k-icon name="download" wrapperClass="k-icon icon-sm gray-50-icon cursor-pointer" />
                            </div>

                            <div
                                v-if="canPreview"
                                class="app-card-action"
                                :title="previewLabel"
                                @click="$emit('preview', {file, index})"
                            >
                                <k-icon name="view" wrapperClass="k-icon icon-sm gray-50-icon cursor-pointer" />
                            </div>

                            <div
                                v-if="canDelete"
                                class="app-card-action"
                                :title="deleteLabel"
                                @click="handleRemove(file, index)"
                            >
                                <button
                                    v-if="deleteAsButton"
                                    type="button"
                                    class="btn btn-outline-primary btn-sm"
                                >
                                    {{ deleteLabel }}
                                </button>

                                <k-icon
                                    v-else
                                    :name="deleteIconName"
                                    wrapperClass="k-icon icon-sm gray-50-icon cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </template>

                <div v-else-if="showEmptyState" class="app-card-row p-16">
                    <div class="app-card-value muted-text-color">
                        <span>{{ emptyText }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KDocumentUploadMulti',

    props: {
        /**
         * Card title shown in the header.
         */
        title: {
            type: String,
            required: true,
        },

        /**
         * Array of already-persisted file objects (from the API).
         * Each object should have at minimum: { ID, fileName }
         * Full shape example:
         * {
         *   ID: 1045,
         *   fileName: "1234.PDF",
         *   fileDirName: "6a01c635af9db_1234.PDF",
         *   fileSize: 22645,
         *   uploaderID: 78,
         *   uploadTime: "2026-05-11 14:06:13",
         *   fileExt: "PDF",
         *   IsLocked: "N",
         *   ...
         * }
         */
        files: {
            type: Array,
            default: () => [],
        },

        /**
         * Newly selected (not yet uploaded) File objects staged locally.
         * The parent manages this array; the component emits 'select' and 'remove'
         * so the parent can push/splice accordingly.
         */
        pendingFiles: {
            type: Array,
            default: () => [],
        },

        /**
         * When true, only users with the right role can delete.
         * Pass through whatever permission flags you need and handle
         * the logic via the `canDelete` prop function or rely on `isReadonly`.
         */
        isReadonly: {
            type: Boolean,
            default: false,
        },

        /**
         * Optional custom predicate to decide whether a specific file
         * can be deleted. Receives the file object; return true to show
         * the delete icon. Falls back to `!isReadonly` when not provided.
         */
        canDeleteFile: {
            type: Function,
            default: null,
        },

        /**
         * Hide the "Add" button entirely (e.g. for request/view-only mode).
         */
        hideAddButton: {
            type: Boolean,
            default: false,
        },

        /**
         * Hide the "Add" button once at least one file exists.
         */
        hideAddWhenHasFile: {
            type: Boolean,
            default: false,
        },

        addButtonLabel: {
            type: String,
            default: 'Dodajte',
        },

        downloadLabel: {
            type: String,
            default: 'Preuzmi',
        },

        previewLabel: {
            type: String,
            default: 'Pregled',
        },

        deleteLabel: {
            type: String,
            default: 'Obriši',
        },

        emptyText: {
            type: String,
            default: 'Nema dokumenata.',
        },

        showEmptyState: {
            type: Boolean,
            default: false,
        },

        accept: {
            type: String,
            default: '.pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.csv',
        },

        /**
         * Allow picking multiple files at once from the file dialog.
         */
        multiple: {
            type: Boolean,
            default: true,
        },

        boxClass: {
            type: String,
            default: 'app-card-box-padding-16',
        },

        canPreview: {
            type: Boolean,
            default: false
        },

        canDownload: {
            type: Boolean,
            default: false
        },

        canDelete: {
            type: Boolean,
            default: true
        },

        deleteAsButton: {
            type: Boolean,
            default: false
        },

        deleteIconName: {
            type: String,
            default: 'delete'
        }
    },

    emits: [
        /** Emitted with the new File object(s) when the user picks files. */
        'select',
        /** Emitted when a pending (not-yet-uploaded) file is removed. Payload: { file, index } */
        'remove-pending',
        /** Emitted when a persisted file is deleted. Payload: { file, index } */
        'delete',
        /** Emitted when the user clicks the download icon. Payload: file */
        'download',
        /** Emitted when the user clicks the preview icon. Payload: { file, index } */
        'preview',
    ],

    computed: {
        /**
         * Merge persisted files with locally staged pending files into one flat list.
         * Pending files are wrapped so the template can distinguish them.
         */
        allFiles() {
            const pending = this.pendingFiles.map((f, i) => ({
                // Stable key for v-for (no server ID yet)
                _tempId: `pending-${i}-${f.name}`,
                fileName: f.name,
                file: f,
                _isPending: true,
            }))
            return [...this.files, ...pending]
        },

        hasAnyFile() {
            return this.allFiles.length > 0
        },

        canShowAddButton() {
            if (this.hideAddButton || this.isReadonly) return false
            if (this.hideAddWhenHasFile && this.hasAnyFile) return false
            return true
        },
    },

    methods: {

        triggerFileSelect() {
            this.$refs.fileInput?.click()
        },

        handleFileChange(event) {
            const files = Array.from(event.target.files || [])
            if (!files.length) return

            if (this.multiple) {
                files.forEach(f => this.$emit('select', f))
            } else {
                this.$emit('select', files[0])
            }

            // Reset native input so the same file can be re-selected later
            this.$refs.fileInput.value = ''
        },

        handleRemove(file, index) {
            if (file._isPending) {
                // index within allFiles; need the index within pendingFiles
                const pendingIndex = index - this.files.length
                this.$emit('remove-pending', { file, index: pendingIndex })
            } else {
                this.$emit('delete', { file, index })
            }
        },
    },
}
</script>
