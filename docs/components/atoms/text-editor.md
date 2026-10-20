# KTextEditor

Rich text editor on top of TinyMCE. The model is HTML.

```vue
<KTextEditor v-model="form.body" placeholder="Announcement text" :height="300" />
```

In Blade: `<k-text-editor v-model="form.body"></k-text-editor>`.

## Setup

TinyMCE is not bundled; it is loaded from `/tinymce/tinymce.min.js` in your public folder. Every
`npm install` of `@zivojindavidovic/ui` copies TinyMCE and the Kancelarko icon pack to `public/tinymce`,
so there is nothing to run. Keep `public/tinymce` out of git.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | string | `''` | `v-model`, HTML |
| `placeholder` | string | `''` | grey text while empty |
| `height` | number, string | `400` | px as a number, or any CSS value |
| `disabled` | boolean | `false` | read-only editor |
| `config` | object | `{}` | TinyMCE init options, merged over the defaults; your keys win |
| `scriptSrc` | string | `/tinymce/tinymce.min.js` | where `tinymce.min.js` lives |
| `icons` | string | `kancelarko` | icon pack name, a folder in `public/tinymce/icons/` |
| `licenseKey` | string | `gpl` | TinyMCE licence key |

Defaults you get without `config`: toolbar `undo redo | bold italic underline | bullist numlist | link image table | code`,
plugins `lists link table image code media`, no menubar, no resize handle, no branding, `paste_data_images: false`.
The text colour follows `data-theme` and updates when the theme changes.

## Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | string | the content changed |

## Example

Smaller editor with a reduced toolbar:

```vue
<KTextEditor v-model="form.note" :height="200" :config="{ toolbar: 'bold italic | bullist numlist', plugins: 'lists' }" />
```

## Notes

- Editor missing and the console complains about `tinymce.min.js`: the copy script was not run or `scriptSrc` is wrong.
- The model is raw HTML and the code button lets the user type anything. Sanitise on the server before storing or rendering.
- `config` is read once at init. To change it at runtime, re-create the editor with a `:key`.
- Passing `content_style` in `config` replaces the default one, and with it the theme-aware text colour.
- An icon missing from the `kancelarko` pack falls back to TinyMCE's default icon.
