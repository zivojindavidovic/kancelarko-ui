# Sidebar

`KSidebar` is the left navigation. It knows nothing about your routes or permissions: you pass the
menu as data, it renders it, highlights the active item, collapses, and turns into a drawer on
mobile. `KSidebarItem` and `KSidebarChildItem` are its rows; you rarely use them directly.

```vue
<KLayout>
    <template #sidebar>
        <KSidebar :items="menu" :module="{ icon: 'module-icons/e-obrasci', color: 'yellow-icon', label: 'e-Obrasci' }" />
    </template>
    ...
</KLayout>
```

## Menu items

```js
menu: [
    { icon: 'calendar', label: 'Calendar', color: 'yellow-icon', url: '/calendar' },
    {
        icon: 'absence', label: 'Absences', color: 'pink-icon',
        children: [
            { label: 'Requests', url: '/absences/requests' },
            { label: 'Decisions', url: '/absences/decisions', activeUrls: ['/absences/decisions/archive'] },
            {
                label: 'Bulk actions', url: 'javascript:void(0)',
                children: [{ label: 'Annual leave', url: '/absences/bulk/annual-leave' }],
            },
        ],
    },
    { separator: true },
    { icon: 'settings', label: 'Settings', color: 'blue-icon', url: '/settings', target: '_blank', visible: () => user.isAdmin },
    { icon: 'contact', label: 'Contact', color: 'blue-icon', url: 'javascript:void(0)', onClick: (e) => { e.preventDefault(); openContact() } },
    { icon: 'sign-out', label: 'Log out', color: 'blue-icon', url: '/logout' },
]
```

| Key | Type | What it does |
|---|---|---|
| `icon` | string | icon name from `src/icons` (required) |
| `label` | string | text (required) |
| `color` | string | `*-icon` colour class; also colours the active marker |
| `url` | string | link; leave out or use `javascript:void(0)` for pure parents |
| `target` | string | e.g. `_blank` |
| `active` | boolean | force the active state |
| `activeUrls` | string[] | extra paths that keep this item active (detail pages, sub-routes) |
| `visible` | boolean, function | `false` hides the item |
| `onClick` | `(event, item)` | runs before navigation; call `event.preventDefault()` to stop it |
| `children` | item[] | nested rows, three levels deep |
| `separator` | `true` | renders a divider instead of a row |

Active detection compares `url` (and `activeUrls`) with the current path: exact match or path prefix.
When the sidebar is collapsed, an item with children links to its first child.

## Where the items come from

**Laravel + Blade.** Build the array in PHP (permissions included) and pass it as JSON:

```blade
<k-sidebar :items='@json($sidebarItems)' :module='@json($module)'></k-sidebar>
```

`onClick` and `visible` cannot be functions in Blade. Decide visibility in PHP and, if you need click
handlers, wrap `KSidebar` in a small component of your own that adds them.

**From an API.** Fetch, then assign:

```js
async created() {
    const { data } = await axios.get('/api/menu')
    this.menu = data.items
}
```

**Vue Router.** Pass the route so the active item follows navigation without a reload, and push
instead of navigating:

```vue
<KSidebar :items="menu" :current-path="$route.path" @item-click="go" />
```

```js
go({ item, event }) {
    if (!item.url || item.url === 'javascript:void(0)') return
    event.preventDefault()
    this.$router.push(item.url)
}
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | array | `[]` | the menu |
| `module` | object | `null` | `{ icon, color, label }` row under the logo; hidden when null |
| `title` | string | `''` | text next to the logo |
| `logoIcon` | string | `kancelarko-logo-full` | logo in the dark theme |
| `logoIconLight` | string | `kancelarko-logo-full-light` | logo in the light theme |
| `logoUrl` | string | `/` | |
| `minimizable` | boolean | `true` | show the collapse toggle |
| `currentPath` | string | `location.pathname` | path used for active detection |
| `syncContentClass` | boolean | `true` | toggle `sidebar-minimized` on `.content` (needed when the shell is plain HTML) |

## Slots

| Slot | Scope | |
|---|---|---|
| `header` | `{ toggle, minimized }` | replaces logo + toggle |
| `logo` | `{ theme }` | replaces the logo only |
| `module` | `{ module }` | replaces the module row |
| `before-items`, `after-items` | – | extra rows |
| default | – | modals or anything that should live inside the sidebar |

## Events

| Event | Payload |
|---|---|
| `item-click` | `{ item, event }` for every row, nested ones included |
| `toggle` | `true` when collapsed |

## State

```js
import { layoutStore } from '@kancelarko/ui'

layoutStore.isSidebarMinimized   // collapsed (desktop)
layoutStore.isSidebarOpen        // drawer open (mobile)
layoutStore.toggleMinimizeSidebar()
layoutStore.toggleSidebar()
```

Below 992px the sidebar becomes a drawer; the hamburger in `KHeader` opens it. A window resize
closes the drawer and expands the sidebar.
