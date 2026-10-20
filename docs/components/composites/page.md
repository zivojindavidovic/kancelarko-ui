# Page shell

`KLayout` places the sidebar on the left and header + content on the right. `KPageSection` is the
rounded card a page lives in: title with a 3D icon, buttons on the right, content below.

```vue
<KLayout>
    <template #sidebar><KSidebar :items="menu" /></template>
    <template #header><KHeader :actions="actions" :user="user" /></template>

    <KPageSection title="Benefits" icon="icons-3d/benefits">
        <template #actions>
            <div class="main-section-header-button"><button class="btn btn-primary btn-sm">Add</button></div>
        </template>
        ...
    </KPageSection>
</KLayout>
```

## KLayout

| Slot | Content |
|---|---|
| `sidebar` | `KSidebar` |
| `header` | `KHeader` |
| default | the page |
| `footer` | below everything |

Prop `wrapperClass` adds classes to the outer element. The layout reads `layoutStore` and adds
`sidebar-minimized` to `.content` when the sidebar collapses.

## KPageSection

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | string | `''` | |
| `icon` | string | `''` | e.g. `icons-3d/contract` |
| `iconSize` | string | `icon-lg` | |
| `themed` | boolean | `true` | translucent background that follows the theme |
| `wrapperClass`, `sectionClass` | any | `''` | outer / content classes |

Slots: `header` (replaces the title), `actions` (wrap each button in `.main-section-header-button`),
default. Use `.main-section-title` for sub-headings inside.

## Laravel + Blade

Vue compiles templates in the browser here, so the bundler build of Vue is required:

```js
// vite.config.js
resolve: { alias: { vue: 'vue/dist/vue.esm-bundler.js' } }
```

```blade
<html data-theme="{{ session('theme', 'dark') }}" class="k-scrollbar">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script>window.appLocale = "{{ app()->getLocale() }}";</script>
    @vite(['resources/js/app.js'])
</head>
<body>
<div id="app">
    <k-layout>
        <template #sidebar>
            <k-sidebar :items='@json($sidebarItems)' :module='@json($module)'></k-sidebar>
        </template>
        <template #header>
            <k-header :actions='@json($headerActions)' :user='@json($user)'>
                <k-header-modal id="account-modal" size="md">
                    <div class="header-content-row">
                        <div class="header-content-icon"><span class="icon-md primary-color"><k-icon name="sign-out"></k-icon></span></div>
                        <div class="header-content-content"><a class="link" href="/logout">Log out</a></div>
                    </div>
                </k-header-modal>
            </k-header>
        </template>
        @yield('content')
    </k-layout>
</div>
</body>
</html>
```

Use kebab-case tags and close every tag; HTML has no self-closing custom elements. Menu items and
actions come from PHP as JSON (decide visibility there), see [sidebar.md](sidebar.md) and
[header.md](header.md).

## Vue Router

```vue
<KLayout>
    <template #sidebar><KSidebar :items="menu" :current-path="$route.path" @item-click="go" /></template>
    <template #header><KHeader :actions="actions" :user="user" /></template>
    <router-view />
</KLayout>
```

`current-path` keeps the active item in sync without reloads; `go` calls `router.push` (see
sidebar.md).

## Without KLayout

Keep this structure and the styles still work:

```html
<div class="container-fluid main-section-wrapper">
    <k-sidebar ...></k-sidebar>
    <div class="content">
        <div class="content-wrapper">
            <k-header ...></k-header>
            <div class="main"> ... </div>
        </div>
    </div>
</div>
```

`KSidebar` toggles `sidebar-minimized` on `.content` by itself (`syncContentClass`).

## When something is off

| Symptom | Fix |
|---|---|
| blank page, console says runtime compilation is not supported | add the `vue` alias above |
| components render unstyled | `import '@zivojindavidovic/ui/style.css'` |
| `Failed to resolve component: k-sidebar` | `app.use(KancelarkoUI)` before `mount`; kebab-case in Blade |
| buttons look different in two places | Bootstrap loaded twice; keep `style.css` or your own Bootstrap + `@zivojindavidovic/ui/scss/kancelarko`, not both |
| content does not follow the collapsed sidebar | structure is not `.main-section-wrapper > .sidebar + .content` |
| active menu item not highlighted | `url` differs from the browser path; add `activeUrls` |
| panel opens in the wrong place | the `KHeaderModal` is outside `KHeader`'s default slot or its `id` differs from `modalId` |
| 404 on `/tinymce/tinymce.min.js` | `public/tinymce` is missing: run `npm install` again (the package copies it on install) |
| datepicker in English | set `window.appLocale` before `app.js` |
| reactivity broken, two Vue copies | `npm ls vue` must show one |
