# KPagination

Page buttons (`1 2 3 ... 58`) with previous/next arrows, in the same style as the table pagination. Stateless: you hold the page numbers and load the data.

```vue
<KPagination :current-page="pagination.currentPage" :last-page="pagination.lastPage" @change="loadPage" />
```

In Blade: `<k-pagination :current-page="page" :last-page="lastPage" @change="loadPage"></k-pagination>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `currentPage` | number | required | the active page |
| `lastPage` | number | required | total number of pages |

## Events

| Event | Payload | When |
|---|---|---|
| `change` | number | a page button or arrow was clicked and the target page is new and valid |

Nothing is emitted for the active page, a disabled arrow, or a page outside `1..lastPage`.

## Example

Cards from a Laravel `paginate()` response:

```js
data() {
    return { items: [], pagination: { currentPage: 1, lastPage: 1 } }
},
mounted() {
    this.loadPage(1)
},
methods: {
    async loadPage(page) {
        const { data } = await axios.get('/api/texts', { params: { page, per_page: 6 } })
        this.items = data.data
        this.pagination = { currentPage: data.current_page, lastPage: data.last_page }
    },
    search() {
        this.loadPage(1)
    }
}
```

## Notes

- Renders nothing when `lastPage` is 1 or less.
- Up to 7 pages every number is shown. Above that: `1 2 3 4 5 ... 58` near the start, `1 ... 27 28 29 ... 58` in the middle, `1 ... 54 55 56 57 58` near the end.
- No `v-model`. The active page moves only after you set a new `currentPage`.
- Pass numbers, not strings: `:current-page="1"`, not `current-page="1"`.
- The active button has the class `current`; the arrows are disabled on the first and last page.
