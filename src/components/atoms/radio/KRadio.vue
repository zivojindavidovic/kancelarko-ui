<template>
	<div class="form-check" :class="[wrapperClass, { 'lighter-bg': lightBackground }]">
		<input
			:id="id"
			class="form-check-input custom-radio"
			:class="inputClass"
			type="radio"
			:name="name"
			:value="value"
			:checked="isChecked"
			:disabled="disabled"
			@change="onChange"
		/>

		<label
			v-if="label"
			class="form-check-label ms-2"
			:class="labelClass"
			:for="id"
		>
			{{ label }}
		</label>
	</div>
</template>

<script>
export default {
	name: "KRadio",

	props: {
		/**
		 * Trenutno izabrana vrednost grupe
		 */
		modelValue: {
			type: [String, Number, Boolean, Object, null],
			default: null,
		},

		/**
		 * Vrednost koju ovaj radio predstavlja
		 */
		value: {
			type: [String, Number, Boolean, Object],
			required: true,
		},

		/**
		 * ID input-a (obavezno zbog label for)
		 */
		id: {
			type: String,
			required: true,
		},

		/**
		 * Name je OBAVEZAN da bi radio dugmići bili u istoj grupi
		 */
		name: {
			type: String,
			required: true,
		},

		label: {
			type: String,
			default: "",
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		/**
		 * Dodatne klase za .form-check wrapper
		 */
		wrapperClass: {
			type: [String, Array, Object],
			default: "",
		},

		/**
		 * Dodatne klase za labelu
		 */
		labelClass: {
			type: [String, Array, Object],
			default: "",
		},

		/**
		 * Dodatne klase za input
		 */
		inputClass: {
			type: [String, Array, Object],
			default: "",
		},

		/* da bude svetlija pozadina */
		lightBackground: {type: Boolean, default: false}
	},

	emits: ["update:modelValue", "change"],

	computed: {
		isChecked() {
			return this.isEqual(this.modelValue, this.value);
		},
	},

	methods: {
		onChange(event) {
			// Radio kada se promeni -> uvek postaje ova vrednost
			const next = this.value;

			this.$emit("update:modelValue", next);

			this.$emit("change", {
				value: next,
				event,
			});
		},

		isEqual(a, b) {
			// Za objekte radi referentno poređenje (isto kao checkbox)
			return a === b;
		},
	},
};
</script>
