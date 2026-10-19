# KTextInput

Single-line text field with a floating label, a clear (×) icon and inline validation text.

```vue
<KTextInput v-model="form.email" label="Email" type="email" :error="errors.email" />
```

In Blade: `<k-text-input v-model="form.email" label="Email"></k-text-input>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | string, number | `''` | `v-model` |
| `id` | string | auto | input id, also used by the label |
| `label` | string | `''` | floating label, hidden when empty |
| `error` | string | `''` | red border + message below the field |
| `highlightError` | boolean | `false` | red border without a message |
| `success` | string | `''` | green border + message below the field |
| `disabled` | boolean | `false` | |
| `readonly` | boolean | `false` | |
| `digitsOnly` | boolean | `false` | only `0-9` get through (typing and paste) |
| `phoneCharactersOnly` | boolean | `false` | allows `0-9 + - / * # ( )`; ignored when `digitsOnly` is on |
| `lightBackground` | boolean | `false` | lighter field background, for use on dark cards |

Anything else (`type`, `name`, `autocomplete`, `maxlength`, `inputmode`, `aria-*`) goes straight to the `<input>`.

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | string | every keystroke |
| `clear` | – | the × icon was clicked (model is set to `''` first) |

## Notes

- The × icon shows only when there is a value and the field is neither disabled nor readonly.
- `error` wins over `success` when both are set.
- Keep `placeholder` empty; the floating label relies on it.
