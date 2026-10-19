# KCheckbox

Checkbox with a label. The model is a boolean, an array (one box per value) or any pair of values via `trueValue`/`falseValue`.

```vue
<KCheckbox v-model="form.active" id="active" label="Active" />
```

In Blade: `<k-checkbox v-model="form.active" id="active" label="Active"></k-checkbox>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | boolean, array, string, number, object | `false` | `v-model` |
| `id` | string | required | input id, used by the label; unique per page |
| `label` | string | `''` | text next to the box, hidden when empty |
| `disabled` | boolean | `false` | |
| `value` | string, number, boolean, object | `true` | what this box adds to or removes from an array model |
| `trueValue` | string, number, boolean, object | `true` | model value when checked |
| `falseValue` | string, number, boolean, object | `false` | model value when unchecked |
| `name` | string | `''` | `name` attribute, for plain form submits |
| `wrapperClass` | string, array, object | `''` | extra classes on the `.form-check` wrapper |
| `lightBackground` | boolean | `false` | lighter box background, for use on dark cards |

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | boolean, array, or `trueValue`/`falseValue` | every toggle |
| `change` | `{ checked, value, modelValue, event }` | every toggle, right after `update:modelValue` |

## Models

Array: one box per value, each with its own `value`. The box adds or removes that value and leaves the rest alone.

```vue
<KCheckbox v-model="form.days" id="day-mon" value="mon" label="Monday" />
<KCheckbox v-model="form.days" id="day-tue" value="tue" label="Tuesday" />
```

```js
data() {
    return { form: { days: [] } }   // ['mon', 'tue'] once both are checked
}
```

Custom pair, when your endpoint expects something other than booleans:

```vue
<KCheckbox v-model="form.consent" id="consent" label="I agree" true-value="DA" false-value="NE" />
<KCheckbox v-model="form.active" id="active" label="Active" :true-value="1" :false-value="0" />
```

## Notes

- Comparison is strict: `1` and `'1'` differ. Bind numbers with `:value="1"` / `:true-value="1"`.
- Object values compare by reference. Prefer ids.
- No `error` prop. Render the message yourself below the box.
- Other attributes (`class`, `aria-*`, `data-*`) land on the `.form-check` wrapper, not on the `<input>`.
- `KSwitch` has the same API and only looks different. For one of many use `KRadio`.
