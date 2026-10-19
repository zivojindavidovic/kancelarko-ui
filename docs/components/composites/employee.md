# Employee

`KEmployeeSelect` is [`KSelect`](../atoms/select.md) with employee rows: avatar or initials, full name,
email, and search across all three. `KEmployeeCard` is the header card for one person: avatar, name,
where they sit in the organisation, optional working hours and a date on the right.

## KEmployeeSelect

```vue
<KEmployeeSelect v-model="form.approver" :options="employees" floating-label="Approver" :error="errors.approver" />
```

In Blade: `<k-employee-select v-model="form.approver" :options="employees"></k-employee-select>`.

`options` is your employee list, loaded up front. With the default field names:

```js
async created() {
    const { data } = await axios.get('/api/employees')
    this.employees = data   // [{ id, first_name, last_name, email, avatar }]
},
```

`v-model` holds the whole object (`object: true`); `:object="false"` gives just `valueProp`. Modes:
`single` (one value), `multiple` (array, the field shows a count), `tags` (array, chips with a remove button).

Your fields are named differently and you want the id only:

```vue
<KEmployeeSelect v-model="form.employeeId" :options="employees" :object="false" value-prop="employee_id"
    first-name-field="ime" last-name-field="prezime" email-field="mail" avatar-field="slika" mode="tags" />
```

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | any | `null` | `v-model`: object or value, array in `multiple` / `tags` |
| `options` | array | `[]` | employee records |
| `mode` | string | `single` | `single`, `multiple`, `tags` |
| `valueProp` | string | `id` | unique field |
| `object` | boolean | `true` | whole object in `v-model`, else `valueProp` only |
| `firstNameField` | string | `first_name` | |
| `lastNameField` | string | `last_name` | |
| `emailField` | string | `email` | shown under the name |
| `avatarField` | string | `avatar` | image URL; initials when empty |
| `trackBy` | string, array | `null` | search fields; default is first name + last name + email |
| `label` | string | `''` | option label field for `KSelect`; defaults to `firstNameField` |
| `floatingLabel` | string | `''` | |
| `placeholder` | string | `''` | |
| `searchable` | boolean | `true` | |
| `disabled` | boolean | `false` | |
| `canClear` | boolean | `true` | × to clear |
| `clearOnSearch` | boolean | `false` | clear the value when typing starts |
| `closeOnSelect` | boolean | `null` | unset: closes after a pick except in `tags` mode |
| `limit` | number | `-1` | max options shown, `-1` all |
| `hideSelected` | boolean | `true` | hide chosen options from the list |
| `noOptionsText` | string | `Nema zaposlenih.` | |
| `noResultsText` | string | `Nema rezultata.` | |
| `error` | string, boolean | `''` | message + red border; `true` is the border only |
| `classes` | object | `null` | passed to `KSelect` |

### Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | value | `v-model` |
| `change` | value | the selection changed |
| `select` | `{ option, id }` | an option was picked |
| `deselect` | `{ option, id }` | an option was removed |
| `search-change` | string | typing in the search field |
| `open`, `close` | – | dropdown opened / closed |
| `clear` | – | × clicked |

### Slots

| Slot | Scope | |
|---|---|---|
| `option` | `{ option, isSelected }` | one row in the list; `isSelected(option)` is a function |
| `singlelabel` | `{ value }` | the chosen employee in `single` mode |
| `tag` | `{ option, handleTagRemove, disabled }` | one chip in `tags` mode |

### Notes

- Setting `trackBy` replaces all three search fields, it does not add to them.
- Initials are the first letters of the first- and last-name fields.
- Options must be loaded before use. For search-as-you-type against your endpoint use `KSelectAsync`.

## KEmployeeCard

```vue
<KEmployeeCard :employee="employee" date-label="22.04.2026" show-work-time :work-times="employee.workTimes" border-bottom />
```

```js
employee: {
    fullName: 'Jelena Ilić',
    avatar: '/storage/avatars/12.jpg',      // empty → initials
    wpPath: 'Paragraf, Sales, Manager',     // company, sector(s), position
    workTimes: [
        { od: '2026-04-22 08:00:00', do: '2026-04-22 16:00:00', isDayOff: false, is_unplanned: false },
    ],
},
```

The card reads three fields of `employee`: `fullName` (the name, and the initials for the avatar),
`avatar` (image URL) and `wpPath` (comma-separated path; the first part gets the company icon, the last
the person icon, the rest the sector icon; the row is skipped when missing). Other fields are ignored.
A `null` employee renders nothing.

`workTimes` items:

| Key | Type | What it does |
|---|---|---|
| `od`, `do` | string | start and end, anything `new Date()` parses; printed as `HH:mm` |
| `od1`, `do1` | string | optional second interval, printed in brackets |
| `isDayOff` | boolean | prints "Slobodan dan" instead of the times |
| `is_unplanned` | boolean | red icon with a "Neplanirano radno vreme" tooltip |

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `employee` | object | – | fields above; nothing renders without it |
| `workTimes` | array | `{}` | items above; declared as object, read as an array, pass an array |
| `showWorkTime` | boolean | `false` | working-hours row |
| `showDate` | boolean | `true` | right block |
| `dateLabel` | string | `null` | text in the right block |
| `borderBottom` | boolean | `false` | bottom border, for use as a header |
| `onlyUnplannedPunches` | boolean | `false` | no red icon or tooltip for unplanned items (the list already holds only those) |

### Slots

| Slot | Replaces |
|---|---|
| `name` | the name |
| `hierarchy` | the company / sector / position row |
| `worktime` | the working-hours row (with `showWorkTime`) |
| `right` | the right block (with `showDate`) |

None of them passes scope; use your own data.

### Notes

- With `showWorkTime` on and an empty list the row reads "Nema organizaciju radnog vremena".
- `wpPath` is split on commas, so unit names must not contain one.
- The avatar is `KAvatar` size `large` (48px) and falls back to initials from `fullName`.
