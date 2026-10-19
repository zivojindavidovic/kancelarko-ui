# KAvatar

Round user picture. Shows the image from `src` and falls back to initials from `who` when there is
no image or it fails to load.

```vue
<KAvatar :who="employee.fullName" :src="employee.avatar" size="large" />
```

In Blade: `<k-avatar who="{{ $employee->full_name }}" src="{{ $employee->avatar }}"></k-avatar>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `src` | string | `''` | image URL; any path the browser can load |
| `who` | string | `''` | full name; initials come from the first two words, `?` when empty |
| `size` | string | `medium` | `small` 24px, `medium` 36px, `large` 48px, `photo` 150px; unknown acts as `medium` |
| `email` | string | `''` | second line in the tooltip |
| `hasTooltip` | boolean | `false` | tooltip on hover with `who` and `email`, placed right |
| `closable` | boolean | `false` | small × badge in the corner |

## Events

| Event | Payload | When |
|---|---|---|
| `close` | – | the × badge was clicked |

## Example

Selected people with removal:

```vue
<div class="d-flex gap-2">
    <KAvatar v-for="p in selected" :key="p.id" :who="p.fullName" :src="p.avatar" size="small" closable @close="remove(p.id)" />
</div>
```

```js
methods: {
    remove(id) {
        this.selected = this.selected.filter(p => p.id !== id)
    }
}
```

## Notes

- A broken image (404, bad URL) switches to initials on its own. The switch sticks: a later change of `src` on the same instance stays on initials.
- Without `hasTooltip` there is no tooltip, even when `email` is set.
- The wrapper is `inline-block`, so a `d-flex gap-2` parent lines avatars up.
- Background and initials colour follow the theme.
