<template>
	<div class="app-file-upload-wrapper">
		<div class="app-file-upload-title">{{ title }}</div>

		<div
			class="app-file-upload"
			:class="{
				'is-dragging': isDragging,
				'is-disabled': disabled,
				'has-error': file && file.status === 'error',
				'has-file': file && file.status === 'success'
			}"
			@dragenter.prevent="handleDragEnter"
			@dragover.prevent="handleDragOver"
			@dragleave.prevent="handleDragLeave"
			@drop.prevent="handleDrop"
		>
			<input
				ref="input"
				class="app-file-upload__input d-none"
				type="file"
				:accept="acceptAttr"
				:disabled="disabled"
				@change="handleInputChange"

			>

			<div v-if="!file" class="app-file-upload-zone app-file-upload__dropzone" @click="openFileDialog">
				<slot name="empty" :is-dragging="isDragging" :open-file-dialog="openFileDialog" >
					<div class="app-file-message">{{ messages.dragFileHere ?? 'Prevucite fajl ovde' }}</div>

					<span class="app-file-upload-icon d-block">
						<k-icon name="alert-icons/file" wrapperClass="icon-lg"/>
					</span>

					<div class="app-file-bottom-section">
						{{ messages.or ?? 'ili' }}
						<button type="button" class="app-file-upload-click-button" @click.stop="openFileDialog">
							{{ messages.clickHere ?? 'Kliknite ovde' }}
						</button>
						{{ messages.toAdd ?? 'kako biste dodali' }} <br/>
						{{ messages.maxFileSize ?? 'dokument maksimalne veličine' }} {{ maxFileSizeLabel }}
					</div>
				</slot>
			</div>

			<div v-if="file" class="app-file-upload-zone app-file-upload__result" :class="`is-${file.status}`">
				<slot name="file" :item="file" :remove-file="removeFile" :open-file-dialog="openFileDialog">
					<template v-if="file.status === 'success'">
						<div class="app-file-message">{{ messages.fileAdded ?? 'Dokument je uspešno dodat!' }}</div>

						<span class="app-file-upload-icon d-block">
							<k-icon name="alert-icons/success" wrapperClass="icon-lg"/>
						</span>
					</template>

					<template v-if="file.status === 'error'">
						<div class="app-file-message">{{ file.error }}</div>

						<span class="app-file-upload-icon d-block">
							<k-icon name="alert-icons/error" wrapperClass="icon-lg"/>
						</span>
					</template>

					<div class="app-file-bottom-section">
						<div class="app-file-upload__progress my-3">
							<div class="app-file-upload__progress-bar" :style="{ width: file.progress + '%' }"></div>
						</div>

						<div class="app-file-upload__file-info d-flex justify-content-between">
							<span>{{ file.sizeLabel }}</span>
							<span>{{ file.progress }} %</span>
						</div>
					</div>
					
				</slot>
			</div>
		</div>

		<div
			v-if="file"
			class="app-file-upload-file-list"
		>
			<div class="app-file-upload-file-list-row">
				<span>{{ file.name }}</span>

				<div class="d-flex align-items-center gap-k-4">
					<span
						v-if="showReplace"
						class="app-file-upload-delete-file cursor-pointer"
						:class="{ 'opacity-50': disabled }"
						role="button"
						tabindex="0"
						:title="messages.replaceFile ?? 'Zamenite fajl'"
						@click="openFileDialog"
						@keydown.enter.prevent="openFileDialog"
						@keydown.space.prevent="openFileDialog"
					>
						<k-icon name="replace" wrapperClass="icon-sm"/>
					</span>

					<span
						class="app-file-upload-delete-file cursor-pointer"
						@click="removeFile"
					>
						<k-icon name="delete" wrapperClass="icon-sm"/>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'KFileUpload',

	props: {
		modelValue: {
			type: [Object, null],
			default: null
		},

		accept: {
			type: Array,
			default: () => ['pdf', 'jpg', 'jpeg', 'png']
		},

		maxFileSize: {
			type: Number,
			default: 20 * 1024 * 1024
		},

		title: {
			type: String,
			default: 'Dodajte dokument'
		},

		messages: {
			type: Object,
			default: () => ({})
		},

		disabled: {
			type: Boolean,
			default: false
		},

		showReplace: {
			type: Boolean,
			default: false
		}
	},

	emits: [
		'update:modelValue',
		'selected',
		'removed',
		'validation-error'
	],

	data() {
		return {
			file: null,
			isDragging: false
		};
	},

	computed: {
		acceptAttr() {
			return this.accept
				.map((item) => {
					if (item.startsWith('.')) {
						return item;
					}

					if (item.includes('/')) {
						return item;
					}

					return `.${item}`;
				})
				.join(',');
		},

		maxFileSizeLabel() {
			return this.formatFileSize(this.maxFileSize);
		}
	},

	methods: {
		openFileDialog() {
			if (this.disabled) {
				return;
			}

			this.$refs.input.click();
		},

		handleInputChange(event) {
			this.addFile(event.target.files[0]);
			event.target.value = null;
		},

		handleDragEnter() {
			if (this.disabled) {
				return;
			}

			this.isDragging = true;
		},

		handleDragOver() {
			if (this.disabled) {
				return;
			}

			this.isDragging = true;
		},

		handleDragLeave() {
			this.isDragging = false;
		},

		handleDrop(event) {
			if (this.disabled) {
				return;
			}

			this.isDragging = false;
			this.addFile(event.dataTransfer.files[0]);
		},

		addFile(file) {
			if (!file) {
				return;
			}

			const validationError = this.validateFile(file);

			if (validationError) {
				this.file = this.createFileItem(file, {
					status: 'error',
					error: validationError
				});

				this.emitValue();

				this.$emit('validation-error', {
					file,
					error: validationError
				});

				return;
			}

			this.file = this.createFileItem(file, {
				status: 'success',
				progress: 100
			});

			this.emitValue();
			this.$emit('selected', this.file);
		},

		validateFile(file) {
			const extension = this.getExtension(file.name);
			const allowedExtensions = this.accept.map((item) => {
				return item.replace('.', '').toLowerCase();
			});

			if (!allowedExtensions.includes(extension)) {
				return this.messages.invalidFileType ?? 'Tip fajla nije dozvoljen.';
			}

			if (file.size > this.maxFileSize) {
				return this.messages.fileTooLarge ?? 'Veličina fajla je veća od dozvoljene.';
			}

			return null;
		},

		createFileItem(file, options = {}) {
			return {
				id: this.createId(),
				file,
				name: file.name,
				size: file.size,
				sizeLabel: this.formatFileSize(file.size),
				type: file.type,
				extension: this.getExtension(file.name),
				progress: options.progress ?? 100,
				status: options.status ?? 'success',
				error: options.error ?? null
			};
		},

		removeFile() {
			const removedFile = this.file;

			this.file = null;

			this.emitValue();
			this.$emit('removed', removedFile);
		},

		emitValue() {
			this.$emit('update:modelValue', this.file);
		},

		getExtension(fileName) {
			return fileName
				.split('.')
				.pop()
				.toLowerCase();
		},

		formatFileSize(size) {
			if (size < 1024) {
				return `${size} B`;
			}

			if (size < 1024 * 1024) {
				return `${Math.round(size / 1024)} KB`;
			}

			return `${(size / 1024 / 1024).toFixed(0)} MB`;
		},

		createId() {
			if (window.crypto?.randomUUID) {
				return window.crypto.randomUUID();
			}

			return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		}
	}
};
</script>
