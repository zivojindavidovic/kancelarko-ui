# KSwitch

Toggle switch. Same API as `KCheckbox`, different look. Use it for settings that take effect on their own.

```vue
<KSwitch v-model="settings.emailNotifications" id="email-notifications" label="Email notifications" @change="save" />
```

```js
methods: {
    async save({ checked }) {
        await axios.post('/your-endpoint/settings', { email_notifications: checked })
        this.$toast.success('Saved')
    },
},
```

In Blade: `<k-switch v-model="form.active" id="active" label="Active"></k-switch>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | boolean, array, string, number, object | `false` | `v-model` |
| `id` | string | required | input id, used by the label; unique per page |
| `label` | string | `''` | text next to the switch, hidden when empty |
| `disabled` | boolean | `false` | |
| `value` | string, number, boolean, object | `true` | what this switch adds to or removes from an array model |
| `trueValue` | string, number, boolean, object | `true` | model value when on |
| `falseValue` | string, number, boolean, object | `false` | model value when off |
| `name` | string | `''` | `name` attribute, for plain form submits |
| `wrapperClass` | string, array, object | `''` | extra classes on the `.form-check.form-switch` wrapper |

A `1`/`0` model that only some users may change:

```vue
<KSwitch v-model="form.active" id="active" label="Active" :true-value="1" :false-value="0" :disabled="!canEdit" />
```

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | boolean, array, or `trueValue`/`falseValue` | every toggle |
| `change` | `{ checked, value, modelValue, event }` | every toggle, right after `update:modelValue` |

## Notes

- Array and `trueValue`/`falseValue` models work as in [KCheckbox](checkbox.md).
- Unlike `KCheckbox` there is no `lightBackground` prop.
- Comparison is strict: `1` and `'1'` differ. Bind numbers with `:true-value="1"`.
- No `error` prop.
- Other attributes (`class`, `aria-*`, `data-*`) land on the wrapper, not on the `<input>`.
