# Alert ($alert)

Modal over the whole page (SweetAlert2) with a title, a message and an icon. For messages the user has to see, and for "are you sure" questions before destructive actions.

```js
this.$alert.error('Error', 'Server is not available. Try again.', { showConfirmButton: true, confirmButtonText: 'OK' })

const res = await this.$alert.confirm({ title: 'Delete employee?', text: 'This cannot be undone.', confirmText: 'Delete' })
if (res.isConfirmed) await axios.delete(`/api/employees/${id}`)
```

The same object is available anywhere as `import { alert } from '@zivojindavidovic/ui'` and in the Composition API as `inject('alert')`. There is no Blade tag; call it from a component's methods.

## Methods

| Method | What it does |
|---|---|
| `info(title, text, options)` | modal with the info icon |
| `success(title, text, options)` | success icon |
| `warning(title, text, options)` | warning icon |
| `error(title, text, options)` | error icon |
| `confirm(payload, options)` | question with confirm and cancel buttons, warning icon, focus on cancel, no X |
| `open(options)` | raw `Swal.fire` with the library defaults; pass `icon` or `iconHtml` yourself |
| `close()` | closes the open modal |
| `setIcons({ info, success, warning, error, question })` | replaces the icons per type: an inline `<svg>` string or an image URL |

All but `close` and `setIcons` return the SweetAlert2 promise: `{ isConfirmed, isDenied, isDismissed, value }`.

## Confirm payload

| Field | Default | What it does |
|---|---|---|
| `title` | `Da li si siguran?` | |
| `text` | `''` | plain text message |
| `confirmText` | `Potvrdi` | confirm button label |
| `cancelText` | `Otkaži` | cancel button label |
| `showCancelButton` | `true` | |

## Options

`options` is the SweetAlert2 options object plus `allowHtml` and `html`. Library defaults:

| Option | Default | What it does |
|---|---|---|
| `showConfirmButton` | `false`, `true` in `confirm` | |
| `showCloseButton` | `true`, `false` in `confirm` and cannot be turned on there | X in the corner |
| `allowHtml` | `false` | render `html` (or `text` when `html` is missing) as HTML |
| `html` | – | HTML message; used only with `allowHtml: true` |
| `customClass` | design-system classes | merged key by key with the defaults (`popup: 'app-swal'`, `confirmButton: 'btn btn-primary btn-sm alert-button'`, ...) |
| `heightAuto` | `false` | |
| `buttonsStyling` | `false` | |
| `reverseButtons` | `true` | |

Anything else SweetAlert2 accepts (`allowOutsideClick`, `timer`, `input`, `focusCancel`) passes through.

```js
this.$alert.info('Help', null, {
    allowHtml: true,
    html: 'The manual is on <a href="/help" target="_blank">this page</a>.',
    showConfirmButton: true,
    confirmButtonText: 'Got it',
})
```

## Notes

- `info/success/warning/error` have no button by default; the user closes them with the X. Add `showConfirmButton: true` for an OK button.
- `confirm`: outside click or Escape resolves with `isDismissed: true`, so check `isConfirmed`, not the absence of a cancel.
- Messages are plain text. HTML goes only through `allowHtml: true` plus `html` in `options`, also for `confirm` (second argument, not the payload). Never pass user input there.
- Buttons use `btn btn-primary btn-sm` and `btn btn-outline-primary btn-sm`, so they follow `data-theme` like the rest of the app.
- `app.use(KancelarkoUI)` installs the plugin; do not add SweetAlert2 again.
- For dialogs with a form use a Vue modal, not Alert.
