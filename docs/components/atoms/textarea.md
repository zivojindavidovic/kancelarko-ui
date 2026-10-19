# KTextarea

Multi-line text field that grows with its content, with a floating label, a clear (×) icon and inline error text.

```vue
<KTextarea v-model="form.note" label="Note" maxlength="500" :error="errors.note" />
```

In Blade: `<k-textarea v-model="form.note" label="Note"></k-textarea>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | string, number | `''` | `v-model` |
| `id` | string | auto | textarea id, also used by the label |
| `label` | string | `''` | floating label, hidden when empty |
| `error` | string | `''` | red border + message below the field |
| `disabled` | boolean | `false` | |
| `readonly` | boolean | `false` | |
| `autoresizeMin` | number | `48` | starting height in px, one line like `KTextInput` |
| `autoresizeMax` | number | `220` | height in px at which the field stops growing and scrolls |
| `placeholder` | string | `''` | keep empty; the floating label relies on it |

Anything else (`name`, `maxlength`, `autocomplete`, `aria-*`) goes straight to the `<textarea>`.

A taller field for long text:

```vue
<KTextarea v-model="form.description" label="Job description" :autoresize-min="96" :autoresize-max="400" />
```

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | string | every keystroke |
| `clear` | – | the × icon was clicked (model is set to `''` first) |

## Notes

- Height is recalculated on input, when the model changes from outside (form reset) and when the field's width changes. Nothing to call.
- The height is written as an inline style on the element. A CSS `height` with `!important` stops the growth.
- The × icon shows only when there is a value and the field is neither disabled nor readonly.
- No `success` or `highlightError` prop, only `error`.
- One line of text: `KTextInput`. Formatted text: `KTextEditor`.
