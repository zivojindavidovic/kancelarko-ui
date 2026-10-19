# KTooltip

Popover with a short explanation, on top of `floating-vue`. Simple (just `text`) or rich (`title` plus
`body` text or a `body` slot).

```vue
<KTooltip text="Delete employee">
    <k-icon name="delete" wrapperClass="icon-sm clickable-icon" />
</KTooltip>
```

In Blade: `<k-tooltip text="Delete employee">...</k-tooltip>`.

The element inside is the trigger. As soon as `title`, `body` or a `body` slot is present the tooltip
is rich and `text` is ignored.

## Mode

| `mode` | Opens | Closes |
|---|---|---|
| `hover` | hover or keyboard focus | mouse leaves |
| `click` | click on the trigger | click again |
| `manual` | you set `v-model` to `true`; a trigger click toggles it too | you set `v-model` to `false` |

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `text` | string | `''` | simple tooltip content |
| `title` | string | `''` | rich tooltip heading |
| `body` | string | `''` | rich tooltip text; the `body` slot wins over it |
| `mode` | string | `hover` | `hover`, `click`, `manual` |
| `modelValue` | boolean | `false` | `v-model`, open state in `manual` mode only |
| `placement` | string | `top` | `top`, `bottom`, `left`, `right`, also `top-start`, `bottom-end`... |
| `autoHide` | boolean | `null` | close on outside click; `null` means yes for `hover`, no for `click` |
| `disabled` | boolean | `false` | never shows |
| `distance` | number | `8` | gap from the trigger, px |
| `skidding` | number | `0` | sideways offset, px |
| `delay` | number, object | `{ show: 0, hide: 0 }` | ms |
| `popperClass` | string, array, object | `app-tooltip` | class on the popover |
| `wrap` | boolean | `true` | wrap the trigger in a focusable `<span class="d-flex">` |

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | boolean | `manual` mode, trigger clicked |
| `open`, `close` | – | `manual` mode, a trigger click opened or closed it |
| `toggle` | boolean in `manual`, nothing in `click` | trigger clicked |

## Slots

| Slot | Scope | What it does |
|---|---|---|
| default | – | the trigger |
| `body` | – | rich content with your own HTML |

## Example

Manual mode, opened when your endpoint rejects the form:

```vue
<KTooltip mode="manual" v-model="showError" title="Error" :body="errorMessage">
    <button class="btn btn-primary" @click="save">Save</button>
</KTooltip>
```

```js
async save() {
    try {
        await axios.post('/api/save', this.form)
    } catch (e) {
        this.errorMessage = e.response?.data?.message ?? 'Something went wrong.'
        this.showError = true
    }
}
```

## Notes

- `text` and `body` render as plain text. Use the `body` slot for HTML.
- `:wrap="false"` drops the span and with it keyboard opening and the `manual` click toggle.
- A custom `popperClass` replaces the default styling. Keep it with `:popper-class="['app-tooltip', 'my-class']"`.
- With none of `text`, `title`, `body` or the slot set you get an empty box.
