import DataTablesCore from 'datatables.net'

const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

if (csrf) {
    DataTablesCore.defaults.ajax = {
        ...DataTablesCore.defaults.ajax,
        headers: {
            'X-CSRF-TOKEN': csrf
        }
    }
}

export default DataTablesCore
