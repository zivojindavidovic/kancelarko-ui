# @zivojindavidovic/ui

Vue 3 components, the Kancelarko page shell (sidebar, header, page section) and the dark/light
theme, as one npm package. Install it, register the plugin, and a new project looks
and behaves like the rest of Kancelarko.

Component docs are in [`docs/`](docs/components): one page per component folder.

## Install

```bash
npm install @zivojindavidovic/ui@1.4.2                                   # from the registry
npm install git+https://github.com/zivojindavidovic/kancelarko-ui.git#v1.4.2   # straight from git
npm install ../kancelarko-ui                                       # local checkout
```

`vue` 3.5+ must be in the project. Everything else (Bootstrap, multiselect, datepicker, TinyMCE,
DataTables, FullCalendar, toastify, sweetalert2, dayjs) comes with the package.

Installing from git runs the package's `npm run build`; so does `npm publish`. For a local path
install run it yourself so `dist/` exists. Nothing else to run: the plugin below is all the setup.

## Setup

```js
import { createApp } from 'vue'
import KancelarkoUI from '@zivojindavidovic/ui'
import '@zivojindavidovic/ui/style.css'      // Bootstrap 5 + theme + components + font + icons

createApp(App)
    .use(KancelarkoUI, {
        components: true,     // register every component globally (default)
        legacyNames: false,   // also register the old App* component names as aliases
        theme: 'dark',        // set data-theme on <html> right away
        persistTheme: false,  // remember the theme in localStorage
    })
    .mount('#app')
```

The plugin registers `<k-icon>` and every `K*` component, installs vue3-toastify and floating-vue,
and adds `this.$toast` / `this.$alert` (`inject('toast')`, `inject('alert')` in the Composition API).

Components are `<KTextInput>` in `.vue` files and `<k-text-input>` in Blade. With `components:
false` import what you use: `import { KTextInput, KSelect, FilterMixin } from '@zivojindavidovic/ui'`.

Older pages use `AppTextInput`, `AppSelect`... Turn on `legacyNames: true` until you rename them (`sed -i 's/App\([A-Z]\)/K\1/g' *.vue`).

### HTML skeleton

```html
<html data-theme="dark" class="k-scrollbar">
<head>
    <meta name="csrf-token" content="...">           <!-- Laravel: DataTables and axios read it -->
    <script>window.appLocale = "rs";</script>         <!-- rs, rs_cyr, hr, ba, cg, en -->
</head>
<body><div id="app"></div></body>
</html>
```

`k-scrollbar` styles the scrollbar, `appLocale` sets the datepicker and calendar language.

### A page

```vue
<KLayout>
    <template #sidebar><KSidebar :items="menu" /></template>
    <template #header><KHeader :actions="actions" :user="user" /></template>

    <KPageSection title="Benefits" icon="icons-3d/benefits">
        <KTextInput v-model="form.name" label="Name" />
        <KSelect v-model="form.city" :options="cities" floating-label="City" />
        <KDataTable :columns="columns" :ajax="ajax" />
    </KPageSection>
</KLayout>
```

Menu items, header actions, Blade and Vue Router setups: [page](docs/components/composites/page.md),
[sidebar](docs/components/composites/sidebar.md), [header](docs/components/composites/header.md).

### TinyMCE

`KTextEditor` loads `/tinymce/tinymce.min.js`, so TinyMCE and the Kancelarko icon pack have to sit
in the project's `public/` folder. Every `npm install` of this package copies them to
`public/tinymce` by itself; there is nothing to run. Add `public/tinymce` to `.gitignore`.

### Own SCSS pipeline

Skip `style.css` when the project already ships Bootstrap:

```scss
@import 'bootstrap/scss/bootstrap';
@import '@zivojindavidovic/ui/scss/kancelarko';    // theme + components, no Bootstrap
```

Partials: `@zivojindavidovic/ui/scss/themes` (all theme variables), `@zivojindavidovic/ui/scss/components`
(all styles), or one component's files from its folder, e.g.
`@zivojindavidovic/ui/src/components/atoms/text-input/text-input`.

## Theme

Every colour is a CSS variable declared twice, for dark and light. `data-theme` picks the set:

```html
<html data-theme="dark">   <!-- default when the attribute is missing -->
<html data-theme="light">
```

The attribute works on `<html>`, `<body>` or any wrapper. Change it in one place and everything
follows: sidebar, header, sections, inputs, tables, modals, toasts, the sidebar logo, even the text
inside TinyMCE. Dark is dark translucent panels with light text; light is light grey panels with
dark text. Both use blue as the accent and have their own body background image.

```js
import { setTheme, toggleTheme, getTheme, initTheme, onThemeChange } from '@zivojindavidovic/ui'

setTheme('light')                               // on <html>
setTheme('light', { target: document.body })
toggleTheme({ persist: true })                  // dark <-> light, saved to localStorage
getTheme()                                      // 'dark' | 'light'
initTheme({ persist: true, fallback: 'dark' })  // on boot, restores the saved theme
onThemeChange((theme) => { ... })
```

Plain DOM works too: `document.documentElement.setAttribute('data-theme', 'light')`. If the theme
is stored per user, render `<html data-theme="{{ $user->theme }}">` and call `setTheme()` plus your
API on change.

Background image per theme:

```css
[data-theme="dark"]  { --body-background-image: url('/img/dark.webp'); }
[data-theme="light"] { --body-background-image: url('/img/light.png'); }
```

Classes that follow the theme, so you never hardcode a colour:

- text: `normal-text-color`, `muted-text-color`, `primary-text-color`, `red-text-color`
- backgrounds: `gray-bg`, `gray-dark-bg`, `gray-10-bg`, `primary-bg-opacity-40`, `section-bg-theme`, `section-bg-theme-darker`
- borders: `border-k-bottom`, `border-color-gray-50`, `border-radius-10`, `border-radius-30`
- type: `h1`–`h4`, `b-big-font`, `b-medium-font`, `b-small-font`, `b-extra-small-font`, `b-labels`
- spacing in 4px steps: `margin-top-4`, `padding-x-6`, `gap-k-3`

Your own theme-dependent value goes in both blocks:

```scss
:root[data-theme="light"], [data-theme="light"]       { --my-card-bg: #fff; }
:root, :root[data-theme="dark"], [data-theme="dark"]  { --my-card-bg: #1E1E1E; }

.my-card { background: var(--my-card-bg); color: var(--normal-text-color); }
```

## Icons

SVG files in `src/icons`, rendered by `<KIcon>` / `<k-icon>`, always registered.

```vue
<KIcon name="calendar" wrapperClass="icon-md" />
<KIcon name="circle-icons/pdf" wrapperClass="icon-lg" />
<KIcon name="close" :wrapperClass="['icon-sm', 'red-icon']" />
```

`name` is the file path inside `src/icons` without `.svg`. An unknown name renders nothing. Icons
load lazily, so only the ones a page uses end up in the bundle. Old spellings with underscores
(`icons_3d/benefits`, `kancelarko_logo_full`) still resolve, in `<KIcon>` and in toast icons.

Sizes: `icon-sm` 16px, `icon-md` 24px, `icon-lg` 48px, `icon-xl` 92×66px.

Colours (icons use `currentColor`): `yellow-icon`, `orange-icon`, `violet-icon`, `light-violet-icon`,
`lilac-icon`, `light-blue-icon`, `blue-icon`, `dark-blue-icon`, `pink-icon`, `cherry-red-icon`,
`red-icon`, `green-icon`, `kiwi-icon`, `mint-icon`, `peach-icon`, `gray-10-icon` … `gray-90-icon`,
`primary-color`. `clickable-icon` adds a pointer cursor, `icon-hover` dims on hover.

| Folder | Content |
|---|---|
| root | line icons for menus, buttons, inputs |
| `circle-icons/` | round notification icons (`birthday`, `holiday-request`, `invoice`, `pdf`...) |
| `alert-icons/` | large icons for alerts and upload (`info`, `success`, `warning`, `error`, `file`) |
| `icons-3d/` | 3D page-title icons (`benefits`, `contract`, `settings`, `user-hub`...) |
| `module-icons/` | Kancelarko module icons (`e-obrasci`, `e-otpremnice`, `troskovnik`...) |
| `email-icons/` | for emails |

To add one: drop `name.svg` into `src/icons` (use `currentColor` so it follows the theme), rebuild.

## Components

Atoms:
[icon](docs/components/atoms/icon.md) ·
[text-input](docs/components/atoms/text-input.md) ·
[textarea](docs/components/atoms/textarea.md) ·
[number-input](docs/components/atoms/number-input.md) ·
[checkbox](docs/components/atoms/checkbox.md) ·
[radio](docs/components/atoms/radio.md) ·
[switch](docs/components/atoms/switch.md) ·
[select](docs/components/atoms/select.md) ·
[date-picker](docs/components/atoms/date-picker.md) ·
[text-editor](docs/components/atoms/text-editor.md) ·
[tooltip](docs/components/atoms/tooltip.md) ·
[avatar](docs/components/atoms/avatar.md) ·
[info-box](docs/components/atoms/info-box.md) ·
[pagination](docs/components/atoms/pagination.md) ·
[context-menu](docs/components/atoms/context-menu.md) ·
[data-card](docs/components/atoms/data-card.md)

Composites:
[page](docs/components/composites/page.md) ·
[sidebar](docs/components/composites/sidebar.md) ·
[header](docs/components/composites/header.md) ·
[datatable](docs/components/composites/datatable.md) ·
[filters](docs/components/composites/filters.md) ·
[calendar](docs/components/composites/calendar.md) ·
[tree](docs/components/composites/tree.md) ·
[upload](docs/components/composites/upload.md) ·
[employee](docs/components/composites/employee.md)

Plugins: [toast](docs/plugins/toast.md) · [alert](docs/plugins/alert.md)

## Repo layout

```
src/
  components/
    atoms/<name>/          KX.vue + _x.scss + _x.theme.scss
    composites/<feature>/  components built from atoms, with their SCSS and JS
    index.js               exports every component
  plugins/toast/  plugins/alert/     $toast and $alert: js + plugin + scss
  helpers/                 date, locale, locale-mixin, file-download, theme, tinymce-icons (TinyMCE icon pack)
  scss/                    app.scss (bootstrap + all), kancelarko.scss (no bootstrap),
                           generated _themes.scss / _components.scss, vars, fonts, themes, elements, utilities
  icons/ images/ fonts/
scripts/postinstall.js         copies TinyMCE + icon pack into the project's public/ on install
dev/                           playground (index.html -> dev/main.js -> dev/App.vue)
docs/                          component docs
```

Naming: `.vue` files are PascalCase and equal the component name; everything else is kebab-case.
A component's styles live next to it (`_x.scss` + `_x.theme.scss`) and are listed in
`src/scss/_components.scss` and `src/scss/_themes.scss`, which fix the load order.
`scss/elements/` holds Bootstrap restyles without a Vue component (buttons, pills, modal, table,
nav-tabs, dropdown, scrollbar, spinners, app-card).

## Development

```bash
npm install                   # also drops TinyMCE into public/tinymce for the playground
npm run dev                   # playground with every component; ?theme=light forces a theme
npm run build                 # dist/kancelarko-ui.js + dist/kancelarko-ui.css (+ fonts/images in dist/assets)
npm run build:playground
```

## Publishing

The package goes to the npm registry as `@zivojindavidovic/ui`. `dist/` is not in git: the
`prepare` script builds it during `npm publish`, so a release is a version bump, a tag and one
publish command.

### One-time setup

1. The package lives under the personal scope `@zivojindavidovic`, so only that npmjs.com account
   can publish it. A scope has to exist as a user or an organisation, otherwise publishing fails with
   `404 Scope not found`; to hand the package to a company scope later, create the organisation at
   [npmjs.com/org/create](https://www.npmjs.com/org/create) (free for public packages), rename the
   package and publish it there.
2. Log in from the terminal and turn on 2FA. The registry refuses to publish without it
   (`E403 ... Two-factor authentication ... is required to publish packages`):

```bash
npm login
npm whoami                                  # prints your username when the login worked
```

   2FA is easiest on the site: avatar → Account → Two-Factor Authentication → Enable 2FA → security
   key. The site offers only that method, but a phone works as the key: the browser shows a QR code,
   the phone scans it and keeps the passkey, no USB key needed. The CLI then opens the browser
   whenever a second factor is required, there is nothing to type. The alternative,
   `npm profile enable-2fa auth-and-writes`, sets up an authenticator app (QR code in the terminal)
   but first waits for a one-time code sent by e-mail, which can take a while to arrive. Either way,
   save the recovery codes away from the computer and check with `npm profile get`
   ("two-factor auth: auth-and-writes"). For CI use a granular access token with "Bypass 2FA"
   instead (Access Tokens → Generate New Token → Granular), never a personal login.

### Release

```bash
git checkout master && git pull
git status                    # must be clean: npm version refuses a dirty tree

npm install
npm run build                 # has to pass; npm run dev for a last look at the playground

npm version patch             # 1.4.2 -> 1.4.3  fixes only
npm version minor             # 1.4.2 -> 1.5.0  new component, prop, icon, CSS variable
npm version major             # 1.4.2 -> 2.0.0  breaking: renamed/removed prop or component, changed variable, dropped Vue version
```

`npm version` writes the number into `package.json` and `package-lock.json`, commits it and tags
`vX.Y.Z`. That tag is what `npm install git+https://...#vX.Y.Z` points at, so the tag and the
registry version always match.

Check what will be uploaded, then publish:

```bash
npm pack --dry-run            # lists the files: dist, src, scripts, docs, README.md (the `files` field)
npm publish --access public   # builds dist/ (prepare) and uploads; add --otp=123456 when asked for the 2FA code
git push && git push --tags
```

Scoped packages are private by default, which needs a paid organisation. `--access public` on the
first publish makes the package public; after that the flag is remembered. To stop typing it, add
to `package.json`:

```json
"publishConfig": { "access": "public" }
```

Verify with `npm view @zivojindavidovic/ui version` and update a project: `npm install @zivojindavidovic/ui@X.Y.Z`
(its `postinstall` refreshes `public/tinymce` on its own).

### Fixing a bad release

A version number can never be reused, so publish a new patch instead of overwriting. Within 72 hours
`npm unpublish @zivojindavidovic/ui@X.Y.Z` removes a version; later use
`npm deprecate @zivojindavidovic/ui@X.Y.Z "use X.Y.Z+1"`, which warns on install but keeps it available.

### Without the public registry

The package does not have to be on npmjs.com at all: `npm install git+https://...#vX.Y.Z` installs
a tagged commit and builds it on the way (see Install), so tagging with `npm version` plus
`git push --tags` is a complete release. For a private registry (Verdaccio, GitHub Packages, Nexus)
set `publishConfig.registry` in `package.json` and log in to it with `npm login --registry <url>`;
GitHub Packages additionally requires the scope to equal the GitHub organisation name.
