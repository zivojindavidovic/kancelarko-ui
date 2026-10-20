# KDatePicker

Date, time, date-time, month or year picker on top of `@vuepic/vue-datepicker`. The value shows in
a chip with a calendar icon and a × to clear; the calendar opens in a popover or stays inline.

```vue
<KDatePicker v-model="form.from" placeholder="From" :max-date="form.to" :error="errors.from" />
```

In Blade: `<k-date-picker v-model="form.from" mode="datetime"></k-date-picker>`.

## Mode and value

| `mode` | Chip shows | `v-model` holds |
|---|---|---|
| `date` | `25.03.2026` | Date, or `null` |
| `datetime` | `25.03.2026 14:30` | Date with time |
| `time` | `14:30` | `{ hours, minutes }` (the library adds `seconds`) |
| `month` | `03.2026` | `{ month, year }`, `month` is 0-11 |
| `year` | `2026` | number |

Looser initial values also display (`"14:30"` or a Date for `time`, a Date for `month` and `year`),
but what the component emits is always the shape above.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | see above | `null` | `v-model` |
| `mode` | string | `date` | `date`, `time`, `datetime`, `month`, `year` |
| `variant` | string | `popover` | `inline` keeps the calendar open in the page |
| `placeholder` | string | per mode | `Odaberi datum`, `Odaberi vreme`, `Odaberi datum i vreme`, `Odaberi mesec i godinu`, `Odaberi godinu` |
| `locale` | string | `null` | `rs`, `ba`, `cg`, `rs_cyr`, `ba_cyr`, `cg_cyr`, `hr`, `en`; `null` reads `window.appLocale`, unknown falls back to `rs` |
| `format` | string | `dd.MM.yyyy` | library input format; only matters with `:use-custom-input="false"` |
| `minDate`, `maxDate` | Date | `null` | selectable range |
| `minTime`, `maxTime` | object | `null` | `{ hours, minutes }` |
| `startDate` | Date | `null` | month opened first when there is no value; today otherwise |
| `startTime` | object | `null` | time offered before a pick, `{ hours: 9, minutes: 0 }` |
| `autoApply` | boolean | `null` | apply on click, no confirm button; `null` means yes except for `datetime` |
| `showActions` | boolean | `null` | select/cancel row under the calendar; `null` means only for `datetime` |
| `timeConfig` | object | `null` | merged into the library's time config, e.g. `{ minutesIncrement: 15, enableSeconds: true }` |
| `flow` | object | `null` | step order, e.g. `{ steps: ['calendar', 'time'] }` |
| `hideOffsetDates` | boolean | `true` | hide days from the neighbouring months |
| `useCustomInput` | boolean | `true` | the chip; `false` renders the library's text input |
| `clearable` | boolean | `false` | the library's own clear icon (text input only) |
| `clearLabel` | string | `Obriši datum` | aria-label of the chip × |
| `disabled` | boolean | `false` | |
| `readonly` | boolean | `false` | value visible, calendar does not open |
| `disableTeleport` | boolean | `false` | keep the popover inside the parent instead of `<body>` |
| `dark` | boolean | `true` | library dark skin |
| `lightBackground` | boolean | `false` | lighter chip background, for use on dark cards |
| `error` | string, boolean | `''` | message below the field; `true` for a red border only |
| `withTrailingDot` | boolean | `true` | unused |

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue`, `change` | value or `null` | picked, confirmed or cleared |

## Example

Month picker that fills two read-only date fields:

```vue
<KDatePicker v-model="month" mode="month" @change="fillRange" />
<KDatePicker v-model="form.from" readonly />
<KDatePicker v-model="form.to" readonly />
```

```js
methods: {
    fillRange(m) {
        if (!m) { this.form.from = this.form.to = null; return }
        this.form.from = new Date(m.year, m.month, 1)
        this.form.to = new Date(m.year, m.month + 1, 0)
    }
}
```

## Notes

- The model is a real Date, not a string. Convert before posting (`toSqlDate`, `toSqlDateTimeFormat` from `@zivojindavidovic/ui`) and parse what your endpoint returns with `toJSDate`.
- The chip always formats as `dd.MM.yyyy`, `dd.MM.yyyy HH:mm`, `HH:mm`, `MM.yyyy` or `yyyy`; `format` does not change it.
- `datetime` waits for the select button. For instant apply pass `:auto-apply="true" :show-actions="false"`.
- The × is hidden when `readonly` or `disabled`.
- If the popover gets clipped inside a modal or a scrolling panel, try `disable-teleport`.
- Set `window.appLocale` once in your app entry; the picker and `KCalendar` both read it.
