<template>
	<div>
		<div class="b-dp" :class="wrapperClass">
			<VueDatePicker
			ref="dp"
			:model-value="modelValue"
			@update:model-value="emitModel"
			@open="openEvent"
			@closed="closedEvent"

			:format="format"
			:month-picker="isMonthOnly"
			:year-picker="isYearOnly"

			:inline="isInline"
			:teleport="teleport"
			:dark="dark"

			:locale="resolvedLocale"

			:min-date="minDate"
			:max-date="maxDate"
			:min-time="minTime"
			:max-time="maxTime"
			:start-date="resolvedStartDate"
			:start-time="startTime"

			:time-picker="isTimeOnly"
			:enable-time-picker="isDateTime" 
			:time-config="timeConfigResolved"
			:flow="flow"

			:auto-apply="resolvedAutoApply"
			:action-row="resolvedActionRow"

			:text-input="useTextInput"
			:placeholder="placeholderResolved"

			:hide-offset-dates="hideOffsetDates"
			:focus-start-date="focusStartDateResolved"

			:input-attrs="{ clearable: clearable }"
			:disabled="disabled"
			:readonly="readonly"

			:show-actions="showActions"
			
			>
		<!-- Custom input UI (chip/button) -->
		<template v-if="useCustomInput && !isInline" #dp-input="p">
			<div
				class="b-dp-chip"
				:class="{
					'is-open': p.isMenuOpen,
					'no-value': !hasValue,
					'has-error': !!error,
					'is-disabled': disabled,
				}"
				@click="toggleMenuIfAllowed(p)"
				@keydown.enter.prevent="toggleMenuIfAllowed(p)"
				@focus="handleFocusIfAllowed(p)"
				@blur="p.onBlur()"
			>
				<span class="b-dp-chip__text">{{ displayValue  }}</span>
			

				<!-- DESNO: ikonice -->
				<span class="b-dp-chip__icon">
					<!-- Kad NEMA datuma -->
					<span v-if="!hasValue || readonly || disabled" class="b-dp-icon b-dp-icon--calendar">
						<Icon v-if="mode == 'date' || isMonthOnly || isYearOnly" name="calendar-a" wrapperClass="k-icon icon-sm" />
						<Icon v-if="mode == 'time'" name="time" wrapperClass="k-icon icon-sm" />
					</span>

					<span
						v-else
						class="b-dp-icon b-dp-icon--clear"
						:aria-label="clearLabel"
						@click.stop="clearValue"
					>
						<Icon name="close" wrapperClass="k-icon icon-sm" />
					</span>

				</span>

			</div>

			<!-- hidden input za wiring -->
			<input
				class="b-dp-hidden-input"
				type="text"
				:value="p.value"
				readonly
				@focus="p.onFocus()"
				@blur="p.onBlur()"
				@keydown.enter="p.onEnter($event)"
				@keydown.tab="p.onTab($event)"
				@keypress="p.onKeypress($event)"
				@paste="p.onPaste()"
			/>
		</template>

			</VueDatePicker>

		</div>
		<div v-if="typeof error === 'string' && error" class="app-select__error b-extra-small-font">
			<k-icon name="info" wrapperClass="icon-sm me-1" />
			{{ error }}
		</div>
	</div>
</template>

<script>
import {VueDatePicker} from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import Icon from '../icon/KIcon.vue';
import { resolveDatePickerLocale } from '../../../helpers/locale';
// import calendarIcon from '@icons/calendar.svg';

export default {
	name: 'KDatePicker',
	components: { VueDatePicker, Icon},

	props: {
		modelValue: { default: null },

		format: { type: String, default: 'dd.MM.yyyy' }, //format za prikaz

		// date | time | datetime | month | year
		mode: { type: String, default: 'date' },

		// popover | inline
		variant: { type: String, default: 'popover' },

		dark: { type: Boolean, default: true },
		locale: { default: null },

		placeholder: { type: String, default: null },
		clearLabel: { type: String, default: 'Obriši datum' },

		// limiti
		minDate: { default: null },
		maxDate: { default: null },
		minTime: { default: null },
		maxTime: { default: null },
		startDate: { default: null },
		startTime: { default: null },

		// UX toggles
		autoApply: { type: Boolean, default: null },     // null => pametan default
		showActions: { type: Boolean, default: null },   // null => pametan default

		// Custom input (chip)
		useCustomInput: { type: Boolean, default: true },

		// Time config (npr. minuteIncrement, seconds, 24h...)
		timeConfig: { type: Object, default: null },
		flow: { type: Object, default: null },

		// Ovo je ako ne zelimo da vidimo dane koji ne pripadaju tekucem mesecu
		hideOffsetDates: { type: Boolean, default: true },

		withTrailingDot: { type: Boolean, default: true }, // ako želiš tačku na kraju

		clearable: { type: Boolean, default: false }, //default reset ikonica - gasimo je
		disabled: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disableTeleport: { type: Boolean, default: false },

		/* da bude svetlija pozadina */
		lightBackground: {type: Boolean, default: false},

		error: { type: [String, Boolean], default: ''},
	},

	emits: ['update:modelValue', 'change'],

	computed: {
		isInline() {
			return this.variant === 'inline';
		},
		teleport() {
			return !this.isInline && !this.disableTeleport;
		},

		isTimeOnly() {
			return this.mode === 'time';
		},
		isDateTime() {
			return this.mode === 'datetime';
		},
		isMonthOnly() {
			return this.mode === 'month';
		},
		isYearOnly() {
			return this.mode === 'year';
		},

		wrapperClass() {
			return {
				'b-dp--inline': this.isInline,
				'b-dp--popover': !this.isInline,
				'b-dp--date': this.mode === 'date',
				'b-dp--month': this.isMonthOnly,
				'b-dp--year': this.isYearOnly,
				'b-dp--time': this.isTimeOnly,
				'b-dp--datetime': this.isDateTime,
				'lighter-bg': this.lightBackground,
				'b-dp--disabled': this.disabled,
			};
		},

		// dp-input slot najbolje radi kad je text-input uključen (za popover)
		useTextInput() {
			return this.useCustomInput && !this.isInline;
		},

		placeholderResolved() {
		// placeholder koristimo samo ako ne radimo custom input
			return this.useCustomInput ? null : (this.placeholder || this.defaultPlaceholder);
		},

		defaultPlaceholder() {
			if (this.isMonthOnly) return 'Odaberi mesec i godinu';
			if (this.isYearOnly) return 'Odaberi godinu';
			if (this.isTimeOnly) return 'Odaberi vreme';
			if (this.isDateTime) return 'Odaberi datum i vreme';
			return 'Odaberi datum';
		},

		resolvedAutoApply() {
			if (this.autoApply !== null) return this.autoApply;

			// date/time: obično želiš auto-apply
			// datetime: često je korisno da ostaviš confirm (ali možeš promeniti)
			if (this.isDateTime) return false;
			return true;
		},

		resolvedActionRow() {
			if (this.showActions !== null) {
				return this.showActions
				? { showSelect: true, showCancel: true, showNow: false, showPreview: true }
				: { showSelect: false, showCancel: false, showNow: false, showPreview: false };
			}

			// default: za datetime pokaži actions, za date/time sakrij
			if (this.isDateTime) {
				return { showSelect: true, showCancel: true, showNow: false, showPreview: true };
			}
			return { showSelect: false, showCancel: false, showNow: false, showPreview: false };
		},

		timeConfigResolved() {
		// KLJUČNO: enableTimePicker ovde stvarno gasi UI za time (što si provalio)
			const base = {
				enableTimePicker: this.isTimeOnly || this.isDateTime,
			};

			// Ako je mode=date, obavezno false
			if (this.mode === 'date') base.enableTimePicker = false;

			return Object.assign(base, this.timeConfig || {});
		},

		hasValue() {
			if (!this.modelValue) return false;

			// TIME: prihvati {hours, minutes} ili "HH:mm"
			if (this.isTimeOnly) return !!this.formatTimeValue(this.modelValue);

			// MONTH: ocekuje { month, year } ili Date
			if (this.isMonthOnly) return this.hasMonthPickerValue(this.modelValue);

			// YEAR: ocekuje godinu kao broj ili Date
			if (this.isYearOnly) return this.hasYearPickerValue(this.modelValue);

			return this.modelValue instanceof Date && !isNaN(this.modelValue.getTime());
		},


		displayValue() {
			if (this.isMonthOnly) {
				const value = this.formatMonthPickerValue(this.modelValue);
				return value || (this.placeholder || this.defaultPlaceholder);
			}

			if (this.isYearOnly) {
				const value = this.formatYearPickerValue(this.modelValue);
				return value || (this.placeholder || this.defaultPlaceholder);
			}

			// TIME: ne traži Date
			if (this.isTimeOnly) {
				const t = this.formatTimeValue(this.modelValue);
				return t || (this.placeholder || this.defaultPlaceholder);
			}

			// DATE / DATETIME: očekujemo Date
			if (!(this.modelValue instanceof Date) || isNaN(this.modelValue.getTime())) {
				return this.placeholder || this.defaultPlaceholder;
			}

			if (this.isDateTime) return this.formatDateTime(this.modelValue);

			return this.formatDate(this.modelValue);

		},
		
		resolvedLocale() {
			return resolveDatePickerLocale(this.locale || window.appLocale || 'rs');
		},

		resolvedStartDate() {
			if (this.startDate) {
				return this.startDate;
			}

			if (this.modelValue) {
				const parsedValue = this.resolveValueAsDate(this.modelValue);

				if (parsedValue) {
					return parsedValue;
				}
			}

			return new Date();
		},

		focusStartDateResolved() {
			return this.isMonthOnly || this.isYearOnly;
		},
	},

	methods: {
		clearValue() {
			// 1) očisti interni state biblioteke
			this.$refs.dp?.clearValue?.();

			// 2) očisti i naš model (da UI/forma bude konzistentna)
			this.emitModel(null);

			// opcionalno: zatvori menu ako je otvoren
			this.$refs.dp?.closeMenu?.();
		},
		emitModel(val) {
			this.$emit('update:modelValue', val);
			this.$emit('change', val);
		},

		toggleMenuIfAllowed(slotProps) {
			if (this.disabled || this.readonly) return;
			slotProps.toggleMenu();
		},

		handleFocusIfAllowed(slotProps) {
			if (this.disabled || this.readonly) return;
			slotProps.onFocus();
		},

		inputText(slotValue) {
			// slotValue je već formatiran string iz datepicker-a inputa;
			// ako je prazno, prikaži placeholder
			if (!slotValue) return this.placeholder || this.defaultPlaceholder;
			return slotValue;
		},

		pad2(n) { return String(n).padStart(2, '0'); },

		formatDate(d) {
			return `${this.pad2(d.getDate())}.${this.pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
		},

		formatTime(d) {
			return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`;
		},

		formatDateTime(d) {
			return `${this.formatDate(d)} ${this.formatTime(d)}`;
		},

		formatMonthPickerValue(val) {
			if (val instanceof Date && !isNaN(val.getTime())) {
				return `${this.pad2(val.getMonth() + 1)}.${val.getFullYear()}`;
			}

			if (!this.hasMonthPickerValue(val)) {
				return null;
			}

			return `${this.pad2(Number(val.month) + 1)}.${Number(val.year)}`;
		},

		hasMonthPickerValue(val) {
			if (!val || typeof val !== 'object') {
				return false;
			}

			const month = Number(val.month);
			const year = Number(val.year);

			return Number.isInteger(month) && month >= 0 && month <= 11 && Number.isInteger(year);
		},

		formatYearPickerValue(val) {
			if (val instanceof Date && !isNaN(val.getTime())) {
				return String(val.getFullYear());
			}

			if (!this.hasYearPickerValue(val)) {
				return null;
			}

			return String(Number(val));
		},

		hasYearPickerValue(val) {
			if (val instanceof Date && !isNaN(val.getTime())) {
				return true;
			}

			const year = Number(val);

			return Number.isInteger(year);
		},

		formatTimeValue(val) {
			// ako je Date (nekad se desi)
			if (val instanceof Date && !isNaN(val.getTime())) {
				return `${this.pad2(val.getHours())}:${this.pad2(val.getMinutes())}`;
			}

			// ako je objekat { hours, minutes }
			if (val && typeof val === 'object') {
				const h = Number(val.hours);
				const m = Number(val.minutes);
				if (!Number.isNaN(h) && !Number.isNaN(m)) {
					return `${this.pad2(h)}:${this.pad2(m)}`;
				}
			}

			// ako je string "HH:mm"
			if (typeof val === 'string' && /^\d{1,2}:\d{2}$/.test(val.trim())) {
				const [h, m] = val.trim().split(':');
				return `${this.pad2(Number(h))}:${this.pad2(Number(m))}`;
			}

			return null;
		},

		resolveValueAsDate(val) {
			if (val instanceof Date && !isNaN(val.getTime())) {
				return val;
			}

			if (typeof val === 'number' && Number.isInteger(val)) {
				return new Date(val, 0, 1);
			}

			if (val && typeof val === 'object') {
				const month = Number(val.month);
				const year = Number(val.year);

				if (Number.isInteger(month) && Number.isInteger(year)) {
					return new Date(year, month, 1);
				}
			}

			return null;
		},

		openEvent() {
			/* pojavljuje se daropshadow picker-a u levom gornjem uglu. Kada se otvori, dodaje shadow. Nije optimalno, doraditi kada bude bilo vremena  */
			let wrapper = document.querySelectorAll('.dp--menu-wrapper')
			wrapper.forEach(item => {
				item.classList.add('add-shadow');
			})

		},
		closedEvent() {
			
			let wrapper = document.querySelectorAll('.dp--menu-wrapper')
			wrapper.forEach(item => {
				item.classList.remove('add-shadow');
			})
		}

	},
};
</script>
