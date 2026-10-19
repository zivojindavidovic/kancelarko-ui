/* Zajednički test podaci za playground (App.vue) i mock backend (main.js). */
export const employees = [
    { id: 1, name: 'Petar Petrović', email: 'petar.petrovic@paragraf.rs', department: 'Razvoj', hiredAt: '01.03.2019', active: true },
    { id: 2, name: 'Jovana Jovanović', email: 'jovana.jovanovic@paragraf.rs', department: 'Razvoj', hiredAt: '15.09.2021', active: true },
    { id: 3, name: 'Marko Marković', email: 'marko.markovic@paragraf.rs', department: 'Prodaja', hiredAt: '10.01.2018', active: false },
    { id: 4, name: 'Ana Anić', email: 'ana.anic@paragraf.rs', department: 'Pravna služba', hiredAt: '22.06.2020', active: true },
    { id: 5, name: 'Milan Milanović', email: 'milan.milanovic@paragraf.rs', department: 'Računovodstvo', hiredAt: '03.11.2017', active: true },
    { id: 6, name: 'Ivana Ivanović', email: 'ivana.ivanovic@paragraf.rs', department: 'HR', hiredAt: '19.02.2023', active: true },
    { id: 7, name: 'Nikola Nikolić', email: 'nikola.nikolic@paragraf.rs', department: 'Prodaja', hiredAt: '07.07.2022', active: false },
    { id: 8, name: 'Tamara Tamarić', email: 'tamara.tamaric@paragraf.rs', department: 'Marketing', hiredAt: '30.04.2024', active: true },
]

export const departments = [...new Set(employees.map((e) => e.department))].map((d) => ({ value: d, label: d }))

export const employeeOptions = employees.map((e) => {
    const [first_name, last_name] = e.name.split(' ')

    return { id: e.id, first_name, last_name, email: e.email, avatar: '' }
})

/**
 * Mini "backend" za playground: odgovara na POST /demo/... pozive (KDataTablePrint).
 * U pravom projektu ovo radi tvoj Laravel endpoint.
 */
export function demoResponse(config) {
    const url = String(config.url || '')
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {})

    if (url.startsWith('/demo/employees/print')) {
        const q = String(body?.search?.value || '').toLowerCase()
        const rows = employees.filter((e) => !q || [e.name, e.email, e.department].some((v) => v.toLowerCase().includes(q)))

        return { data: rows }
    }

    return { data: [] }
}
