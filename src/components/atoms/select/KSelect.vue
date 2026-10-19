<template>
	<div>
		<div class="app-select floating-label" 
		:class="{ 
			'is-filled': hasValue, 
			'has-error': !!error, 
			'select-sm': sizeSM,
			'lighter-bg': lightBackground,
			'is-disabled': disabled,
		}"
		>
			<Multiselect
			v-model="innerValue"
			:options="options"
			:mode="mode"
			:searchable="searchable"
			:placeholder="placeholder"
			:disabled="disabled"
			:label="label"
			:track-by="trackBy"
			:value-prop="valueProp"
			:object="object"
			:can-clear="canClear"
			:clear-on-search="clearOnSearch"
			:close-on-select="closeOnSelect"
			:limit="limit"
			:no-options-text="noOptionsText"
			:no-results-text="noResultsText"
			:classes="classes"
			:hide-selected="hideSelected"
			@open="$emit('open')"
			@close="$emit('close')"
			@clear="$emit('clear')"
			@select="(option, id) => $emit('select', { option, id })"
			@deselect="(option, id) => $emit('deselect', { option, id })"
			@search-change="(q) => $emit('search-change', q)"
			>
			<template #option="slotProps">
				<slot name="option" v-bind="slotProps">
					<!-- ako zelimo cb u opciji, moramo da dodamo klase za poziciniranje -->
					<div class="app-select__option" :class="{'d-flex align-items-center': showOptionCheckbox}">
						<div v-if="showOptionCheckbox" class="form-check option-checkbox lighter-bg" :class="{'d-flex align-items-center': showOptionCheckbox}">
							<input
								type="checkbox"
								:checked="slotProps.isSelected(slotProps.option)"
								@change.prevent
								class="form-check-input custom-checkbox"
							>
						</div>

						{{ slotProps.option?.[label] ?? slotProps.option }}
					</div>
				</slot>
			</template>

			<template #singlelabel="slotProps">
				<slot name="singlelabel" v-bind="slotProps">
					<div class="app-select__singlelabel">
						<div class="label-title">
							{{ slotProps.value?.[label] ?? slotProps.value }}
						</div>
					</div>
				</slot>
			</template>

			<template #tag="slotProps">
				<slot name="tag" v-bind="slotProps">
					<div class="app-select__tag">
						<div class="tag-title">
							{{ slotProps.option?.[label] ?? slotProps.option }}
						</div>
						

						<button
							v-if="tagRemovable && !slotProps.disabled && !slotProps.option?.disabled && typeof slotProps.handleTagRemove === 'function'"
							type="button"
							class="app-chip__remove"
							@mousedown.prevent="slotProps.handleTagRemove(slotProps.option, $event)"
							aria-label="Ukloni"
						>
							<k-icon :name="tagRemoveIcon" wrapperClass="icon-sm" />
						</button>
					</div>
				</slot>
			</template>

			<template #nooptions="slotProps">
				<slot name="nooptions" v-bind="slotProps">
					<div class="app-select__empty">{{ noOptionsText }}</div>
				</slot>
			</template>

			<template #noresults="slotProps">
				<slot name="noresults" v-bind="slotProps">
					<div class="app-select__empty">{{ noResultsText }}</div>
				</slot>
			</template>
			</Multiselect>

			<label v-if="floatingLabel" class="app-floating__label">
				{{ floatingLabel }}
			</label>

		</div>

		<div v-if="typeof error === 'string' && error" class="app-select__error">
			<k-icon name="info" wrapperClass="icon-sm me-1" />
			{{ error }}
		</div>
	</div>
</template>

<script>
	import Multiselect from '@vueform/multiselect'

	export default {
	name: 'KSelect',
	components: { Multiselect },

	props: {
		modelValue: { default: null },
		options: { type: Array, default: () => [] },

		mode: { type: String, default: 'single' },

		label: { type: String, default: 'label' },
		trackBy: { type: [String, Array], default: 'value' },
		valueProp: { type: String, default: 'value' },
		object: { type: Boolean, default: true },

		searchable: { type: Boolean, default: true },
		placeholder: { type: String, default: '' },
		disabled: { type: Boolean, default: false },
		canClear: { type: Boolean, default: true },
		clearOnSearch: { type: Boolean, default: false },
		closeOnSelect: { type: Boolean, default: true },
		hideSelected: { type: Boolean, default: true },
		limit: { type: Number, default: -1 },

		noOptionsText: { type: String, default: 'Nema opcija.' },
		noResultsText: { type: String, default: 'Nema rezultata.' },

		classes: { type: Object, default: null },
		floatingLabel: { type: String, default: '' },
		tagRemovable: { type: Boolean, default: true },
		tagRemoveIcon: { type: String, default: 'close' },
		error: { type: [String, Boolean], default: ''},

		sizeSM: {type: Boolean, default: false},
		/* da se pojavi checkbox u opciji */
		showOptionCheckbox: {type: Boolean, default: false},
		/* da bude svetlija pozadina */
		lightBackground: {type: Boolean, default: false}
	},

	emits: [
		'update:modelValue',
		'change',
		'search-change',
		'open',
		'close',
		'clear',
		'select',
		'deselect'
	],

	data() {
		return {
		innerValue: this.modelValue
		}
	},

	watch: {
		modelValue(next) {
			this.innerValue = next
		},
		innerValue(next, prev) {
			//ukoliko je single i ako ne moze da 'clear-uje' vrednost, onda nemoj deselkovati ako kliknem na selektovanu opciju
			if (this.mode === 'single' && this.canClear === false && (next === null || next === undefined || next === '')) {
				this.$nextTick(() => {
					this.innerValue = prev
				})

				return
			}
			this.$emit('update:modelValue', next)
			this.$emit('change', next)
		}
	},

	methods: {
		defaultMultipleLabel(values) {
		if (!Array.isArray(values) || values.length === 0) return ''
		if (values.length === 1) return values[0]?.[this.label] ?? values[0]
			return `${values.length} izabrano`
		}
	},
	computed: {
		hasValue() {
			if (this.mode === 'multiple' || this.mode === 'tags') {
				return Array.isArray(this.innerValue) && this.innerValue.length > 0
			}
			return this.innerValue !== null && this.innerValue !== undefined && this.innerValue !== ''
		}
	}
	}
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
