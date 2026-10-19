# Header

`KHeader` is the top bar: hamburger on mobile, a row of action icons, the avatar. Dropdown panels
under the icons are `KHeaderModal`; `KNotificationRow` is a ready-made row for a notifications
panel. Like the sidebar, nothing here calls a backend: you pass the actions, the user and the
panel contents.

```vue
<KHeader :actions="actions" :user="user">
    <KHeaderModal id="notifications-modal" title="Notifications">
        <KNotificationRow v-for="n in notifications" :key="n.id" v-bind="n" @row-click="markRead(n)" />
    </KHeaderModal>
</KHeader>
```

Blade: `<k-header :actions='@json($actions)' :user='@json($user)'> ... </k-header>`.

## Actions

```js
actions: [
    { id: 'gold', icon: 'kancelarko-gold', tooltip: 'Gold', href: 'https://kancelarko.rs/gold-paket', target: '_blank' },
    { id: 'notifications', icon: () => unread ? 'notification-active' : 'notification', tooltip: 'Notifications', modalId: 'notifications-modal' },
    { id: 'mail', icon: 'mail', tooltip: 'Messages', onClick: (event, action, api) => this.openMessages() },
    { id: 'docs', icon: 'instructions', tooltip: 'Help', disabled: !user.canSeeHelp },
]
```

| Key | Type | What it does |
|---|---|---|
| `id` | string | key; also handy in `action-click` |
| `icon` | string, function | icon name, or a function returning one (badge states) |
| `tooltip` | string | shown under the icon |
| `href`, `target` | string | renders a real `<a>`; `_blank` adds `rel="noopener"` |
| `modalId` | string | opens the `KHeaderModal` with that id below the icon |
| `modalOffset` | number | extra vertical gap in px, may be negative |
| `onClick` | `(event, action, api)` | your handler; `api` is the slot API below |
| `disabled` | boolean | grey, not clickable |
| `visible` | boolean, function | `false` hides it |
| `class` | any | extra classes |

Clicking an icon whose panel is open closes it. A click outside, a window resize, or opening
another panel closes the current one.

## KHeader props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `actions` | array | `[]` | see above |
| `user` | object | `{}` | `{ fullName, email, avatar }` for the avatar |
| `showAvatar` | boolean | `true` | |
| `accountModalId` | string | `account-modal` | panel opened by the avatar; emits `avatar-click` only when no such id exists |
| `accountModalOffset` | number | `-10` | |

Slots `actions-before`, `actions` (extra icons), `avatar` (`{ user }`) and the default slot (put
`KHeaderModal`s there) all receive `{ triggerModal(el, id, offset), closeModal(id),
closeHeaderModals(), activeModalId }`.

Events: `action-click` `{ action, event }`, `avatar-click` `event`, `modal-open` and
`modal-close` with the modal id. `modal-open` is a good place to refresh a panel's data.

## KHeaderModal

A positioned panel. Give it an `id`, reference that id from an action, put rows inside.

| Prop | Type | Default | What it does |
|---|---|---|---|
| `id` | string | required | matched against `modalId` / `accountModalId` |
| `title` | string | `''` | header text |
| `size` | `sm`, `md`, `lg` | `lg` | 300 / 350 / 500 px |
| `menu` | boolean | `false` | account-style variant with sub-menus |
| `wrapContent` | boolean | `true` | wrap the default slot in `.header-content` (scroll + padding) |
| `contentClass`, `modalClass` | any | `''` | |
| `teleport` | boolean | `true` | render in `<body>` |

Slots: `header` (replaces the title, e.g. avatar + name for the account panel), `menu` (tabs and a
right-side action, markup `.header-tabs` / `.header-action`), default.

Rows use this markup: `.header-content-row > .header-content-icon + .header-content-content`.

## KNotificationRow

| Prop | Type | Default |
|---|---|---|
| `icon` | string | `notification-active` |
| `title` | string | `Notifikacija` |
| `textHtml` | string | `''` (sanitise it yourself if it comes from users) |
| `time` | string | `''` |
| `unread` | boolean | `false` |
| `linkUrl` | string | `''`; shows the link icon when set |

Events: `row-click`, `open-link`.

## Panel with server data

```vue
<KHeader :actions="actions" :user="user" @modal-open="onOpen">
    <KHeaderModal id="notifications-modal" title="Notifications">
        <template #menu>
            <div class="header-tabs">
                <ul class="nav nav-tabs">
                    <li class="nav-item"><button class="nav-link" :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button></li>
                    <li class="nav-item"><button class="nav-link" :class="{ active: tab === 'unread' }" @click="tab = 'unread'">Unread</button></li>
                </ul>
            </div>
            <div class="header-action"><button class="bg-transparent border-0 p-0 b-small-font text-reset" @click="markAll">Mark all read</button></div>
        </template>

        <KNotificationRow v-for="n in visible" :key="n.id" :title="n.title" :text-html="n.text" :time="n.time" :unread="n.unread" :icon="n.icon" @row-click="markRead(n)" />
        <div v-if="!visible.length" class="px-4 pt-3 muted-text-color">Nothing new.</div>
    </KHeaderModal>
</KHeader>
```

```js
methods: {
    async onOpen(id) {
        if (id !== 'notifications-modal') return
        const { data } = await axios.get('/api/notifications')
        this.notifications = data
    },
}
```

An account panel with sub-menus (role switching and the like) is not in the library;
build it with `KHeaderModal menu :wrap-content="false"` and your own rows.
