# Toast ($toast)

Short message in the top-right corner that closes itself (vue3-toastify). Plain text for feedback, or a notification with title, icon and link.

```js
this.$toast.success('Saved.')
this.$toast.error(e.response?.data?.message ?? 'Save failed.', { autoClose: 6000 })
this.$toast('Plain message')
```

The same object is available anywhere as `import { customToast } from '@kancelarko/ui'` and in the Composition API as `inject('toast')`. There is no Blade tag; call it from a component's methods.

## Methods

| Method | Arguments | What it does |
|---|---|---|
| `$toast(payload, options)` | string or notification object | string: plain toast; object: same as `notification()` |
| `show(payload, options)`, `showToast(payload, options)` | same | aliases of the call above |
| `success`, `info`, `warning`, `error` | `(text, options)` | coloured toast; HTML in `text` is stripped |
| `notification(payload, options)` | notification object | title, body, icon; see below |
| `html({ titleHtml, bodyHtml, icon, autoClose }, options)` | object | title and body as HTML, same sanitising as `notification` |
| `getNotifyObject()` | – | empty notification object to fill in; exists only on `customToast`, not on `$toast` |

Every method returns the vue3-toastify toast id.

## Options

`options` goes to vue3-toastify on top of these defaults:

| Option | Default | What it does |
|---|---|---|
| `autoClose` | `3000` | ms until it closes; `false` keeps it open |
| `position` | `top-right` | |
| `theme` | `dark` | |
| `closeOnClick` | `false` | |

Anything else vue3-toastify accepts (`pauseOnHover`, `hideProgressBar`, `onClose`) passes through.

## Notification payload

| Field | Default | What it does |
|---|---|---|
| `title.text` | `''` | plain text, cut at 80 characters; empty falls back to `Nova notifikacija` |
| `title.isLink` | `false` | render the title as a link |
| `title.url` | `#` | link target; only `http`, `https` and relative paths survive, anything else becomes `#` |
| `body` | `''` | message, limited HTML allowed |
| `icon` | `null` | built-in icon name or an image URL |
| `autoClose` | `3000` | ms; read from the payload, not from `options` |

Built-in icons: `circle-icons/birthday`, `circle-icons/contract-expiring`, `circle-icons/e-delovodnik`, `circle-icons/e-invoice`, `circle-icons/e-postar`, `circle-icons/holiday-request`, `circle-icons/info`, `circle-icons/invoice`, `circle-icons/jubilej`, `circle-icons/kadrovik`, `circle-icons/privilegije`, `circle-icons/slava`, `circle-icons/working-hours`, `circle-icons/actions`, `circle-icons/pdf`, `obligation`, `folder`, `time`, `notification-active`. Any other string is used as `<img src>`.

```js
import { customToast } from '@kancelarko/ui'

const notify = customToast.getNotifyObject()
notify.title.text = 'New leave request'
notify.title.isLink = true
notify.title.url = '/requests/15'
notify.body = 'Petar Petrović asks for <b>5 days</b> of annual leave.'
notify.icon = 'circle-icons/holiday-request'
notify.autoClose = 8000

this.$toast(notify)
```

## Notes

- `body`, `titleHtml` and `bodyHtml` go through DOMPurify. Allowed tags: `p br b strong i em ul ol li span a`; allowed attributes: `class href title target rel`. Links get `target="_blank"` and `rel="noopener noreferrer"`; an unsafe `href` becomes `#`.
- `success/info/warning/error` show plain text only. Use `notification` or `html` for markup.
- The payload also accepts a raw backend notification: `notificationTitle` or `titleText` for the title, and `textHtml`, `notificationText`, `textSrbLat`, `textSrbCir` or `textEng` for the body, in that order.
- Colours follow `data-theme`; `theme: 'dark'` is the vue3-toastify option and does not need changing.
- `app.use(KancelarkoUI)` installs vue3-toastify and its CSS; pass its options as `toastify: {}` there and do not install it again.
- Do not call `toast()` from vue3-toastify directly; go through `$toast` or `customToast` so every message gets the defaults.
