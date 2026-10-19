# KRadio

One option of a radio group. Each option is its own `KRadio`; options in a group share `name` and `v-model`.

```vue
<KRadio v-model="form.gender" id="gender-m" name="gender" value="M" label="Male" />
<KRadio v-model="form.gender" id="gender-f" name="gender" value="F" label="Female" />
```

In Blade: `<k-radio v-model="form.gender" id="gender-m" name="gender" value="M" label="Male"></k-radio>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | string, number, boolean, object | `null` | `v-model`, the selected value of the whole group |
| `value` | string, number, boolean, object | required | what this option stands for |
| `id` | string | required | input id, used by the label; unique per page |
| `name` | string | required | group name, the same for every option in the group |
| `label` | string | `''` | text next to the button, hidden when empty |
| `disabled` | boolean | `false` | |
| `wrapperClass` | string, array, object | `''` | extra classes on the `.form-check` wrapper |
| `labelClass` | string, array, object | `''` | extra classes on the `<label>` |
| `inputClass` | string, array, object | `''` | extra classes on the `<input>` |
| `lightBackground` | boolean | `false` | lighter button background, for use on dark cards |

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | this option's `value` | this option was selected |
| `change` | `{ value, event }` | this option was selected, right after `update:modelValue` |

## Example

Options from a list:

```vue
<KRadio
    v-for="type in contractTypes"
    :key="type.id"
    v-model="form.contractType"
    :id="'contract-' + type.id"
    name="contract-type"
    :value="type.id"
    :label="type.name"
/>
```

```js
data() {
    return {
        form: { contractType: null },
        contractTypes: [{ id: 1, name: 'Permanent' }, { id: 2, name: 'Fixed-term' }],
    }
}
```

## Notes

- Without a shared `name` the browser does not group the buttons and more than one can look selected.
- Comparison is strict: `1` and `'1'` differ. Bind numbers with `:value="1"` and start the model as a number or `null`.
- Object values compare by reference. Use the object's id instead.
- A radio cannot be unselected by clicking. To clear the group, set the model to `null`.
- Other attributes (`class`, `aria-*`, `data-*`) land on the `.form-check` wrapper. Use `inputClass` for the `<input>`.
- No `error` prop. Render the message yourself below the group.
- Inline options: `wrapper-class="mb-0"` on each, inside a `d-flex gap-4`.
