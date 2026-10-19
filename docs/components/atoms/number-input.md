# KNumberInput

Number field with up/down arrows, a floating label and inline validation text.

```vue
<KNumberInput v-model="form.days" label="Days of leave" :min="1" :max="30" :error="errors.days" />
```

In Blade: `<k-number-input v-model="form.days" label="Days" :min="1"></k-number-input>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | number, string | `''` | `v-model`: a number, or `''` when the field is empty |
| `id` | string | auto | input id, also used by the label |
| `label` | string | `''` | floating label, hidden when empty |
| `error` | string | `''` | red border + message below the field |
| `success` | string | `''` | green border + message below the field |
| `disabled` | boolean | `false` | disables the field and the arrows |
| `readonly` | boolean | `false` | typing and arrows do nothing |
| `lightBackground` | boolean | `false` | lighter field background, for use on dark cards |
| `step` | number | `1` | change per arrow click; decimals allowed (`0.5`, `0.01`) |
| `min` | number | `null` | lower bound for typing and arrows |
| `max` | number | `null` | upper bound for typing and arrows |

Anything else (`name`, `inputmode`, `aria-*`) goes straight to the `<input>`. `type` is always `number` and `placeholder` is always empty.

Amount with decimals:

```vue
<KNumberInput v-model="form.amount" label="Amount (RSD)" :min="0" :step="0.5" />
```

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | number, or `''` when cleared | every keystroke and every arrow click |

## Notes

- A typed value outside `min`/`max` is clamped at once, while typing, not on blur.
- Arrows on an empty field start from `min` when set, otherwise from `0`.
- Holding an arrow repeats the step every 150 ms.
- With a decimal `step` the result is rounded to the step's decimals, so `0.5` never gives `1.5000001`.
- `error` wins over `success` when both are set.
- The model is `''` after the user deletes everything. Check for it before sending to your endpoint.
- No clear icon. For digits without arrows use `KTextInput` with `digitsOnly`.
