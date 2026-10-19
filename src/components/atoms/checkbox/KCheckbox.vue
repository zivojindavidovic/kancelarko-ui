<template>
	<div class="form-check" :class="[wrapperClass, {'lighter-bg': lightBackground}]">
		<input
			:id="id"
			class="form-check-input custom-checkbox"
			type="checkbox"
			:name="name"
			:value="value"
			:checked="isChecked"
			:disabled="disabled"
			@change="onChange"
		/>

		<label
			v-if="label"
			class="form-check-label ms-2"
			:for="id"
		>
			{{ label }}
		</label>
	</div>
</template>

<script>
export default {
	name: "KCheckbox",

	props: {
		/**
		 * Može biti:
		 * - Boolean (true/false)
		 * - Array (npr. ['a', 'b'] za multi checkbox)
		 * - bilo šta (uz trueValue/falseValue)
		 */
		modelValue: {
			type: [Boolean, Array, String, Number, Object, null],
			default: false,
		},

		id: {
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
		 * value atribut checkbox-a (bitno za Array v-model)
		 */
		value: {
			type: [String, Number, Boolean, Object],
			default: true,
		},

		/**
		 * Ako želiš da v-model ne bude boolean nego custom vrednosti:
		 * npr trueValue="DA", falseValue="NE"
		 */
		trueValue: {
			type: [String, Number, Boolean, Object],
			default: true,
		},

		falseValue: {
			type: [String, Number, Boolean, Object],
			default: false,
		},

		/**
		 * Za radio/checkbox semantiku (opciono)
		 */
		name: {
			type: String,
			default: "",
		},

		/* da bude svetlija pozadina */
		lightBackground: {type: Boolean, default: false}
	},

	emits: ["update:modelValue", "change"],

	computed: {
		isArrayModel() {
			return Array.isArray(this.modelValue);
		},

		isChecked() {
			if (this.isArrayModel) {
				return this.modelValue.some((v) => this.isEqual(v, this.value));
			}

			// Custom true/false scenario: checked ako je modelValue == trueValue
			if (this.trueValue !== true || this.falseValue !== false) {
				return this.isEqual(this.modelValue, this.trueValue);
			}

			// Default boolean scenario
			return !!this.modelValue;
		},
	},

	methods: {
		onChange(event) {
			const checked = event.target.checked;

			let next;

			if (this.isArrayModel) {
				const copy = [...this.modelValue];

				const idx = copy.findIndex((v) => this.isEqual(v, this.value));

				if (checked && idx === -1) copy.push(this.value);
				if (!checked && idx !== -1) copy.splice(idx, 1);

				next = copy;
			} else if (this.trueValue !== true || this.falseValue !== false) {
				next = checked ? this.trueValue : this.falseValue;
			} else {
				next = checked;
			}

			this.$emit("update:modelValue", next);

			// "change" emit: praktično da znaš i checked i value uvek
			this.$emit("change", {
				checked,
				value: this.value,
				modelValue: next,
				event,
			});
		},

		isEqual(a, b) {
			// Za objekte (value kao object) radi referentno poređenje;
			// u praksi obično value bude string/number.
			return a === b;
		},

	},
};
</script>
