<template>
	<div class="form-check form-switch" :class="wrapperClass">
		<input
			:id="id"
			class="form-check-input"
			type="checkbox"
			:name="name"
			:value="value"
			:checked="isChecked"
			:disabled="disabled"
			@change="onChange"
		/>

		<label
			v-if="label"
			class="form-check-label"
			:for="id"
		>
			{{ label }}
		</label>
	</div>
</template>

<script>
export default {
	name: "KSwitch",

	props: {
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
		 * Dodatne klase na wrapperu (.form-check.form-switch)
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
		 * Custom true/false vrednosti (ako želiš da v-model nije boolean)
		 */
		trueValue: {
			type: [String, Number, Boolean, Object],
			default: true,
		},

		falseValue: {
			type: [String, Number, Boolean, Object],
			default: false,
		},

		name: {
			type: String,
			default: "",
		},
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

			if (this.trueValue !== true || this.falseValue !== false) {
				return this.isEqual(this.modelValue, this.trueValue);
			}

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
			this.$emit("change", {
				checked,
				value: this.value,
				modelValue: next,
				event,
			});
		},

		isEqual(a, b) {
			return a === b;
		},
	},
};
</script>
