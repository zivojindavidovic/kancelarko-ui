<template>
    <slot name="trigger" :print="print" :preparing="isPreparing">
        <button
            type="button"
            :class="buttonClass"
            :disabled="isPreparing"
            @click="print"
        >
            {{ isPreparing ? preparingLabel : printLabel }}
        </button>
    </slot>

    <Teleport to="body">
        <section
            class="app-data-table-print-section"
            :class="{ 'app-data-table-print-section-active': isPrintActive }"
        >
            <h1>{{ title }}</h1>

            <div v-if="metadata.length" class="app-data-table-print-meta">
                <template v-for="item in metadata" :key="item.key">
                    <div v-if="isMetadataVisible(item)">
                        <label
                            v-if="item.type === 'checkbox'"
                            class="app-data-table-print-checkbox"
                        >
                            <input type="checkbox" :checked="Boolean(item.checked)" disabled>
                            {{ resolveMetadataValue(item) }}
                        </label>

                        <slot
                            v-else
                            :name="`meta-${item.key}`"
                            :item="item"
                            :rows="rows"
                            :value="resolveMetadataValue(item)"
                        >
                            <strong v-if="item.label">{{ item.label }}</strong>
                            {{ resolveMetadataValue(item) }}
                        </slot>
                    </div>
                </template>
            </div>

            <table>
                <thead>
                    <tr>
                        <th v-for="column in columns" :key="column.key">
                            {{ column.label }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows" :key="resolveRowKey(row, index)">
                        <td v-for="column in columns" :key="column.key">
                            <slot
                                :name="`cell-${column.key}`"
                                :row="row"
                                :column="column"
                                :value="resolveCellValue(row, column)"
                            >
                                {{ resolveCellValue(row, column) }}
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </Teleport>
</template>

<script>
import axios from 'axios';
export default {
    name: 'KDataTablePrint',

    props: {
        title: {
            type: String,
            required: true
        },
        printLabel: {
            type: String,
            required: true
        },
        preparingLabel: {
            type: String,
            required: true
        },
        buttonClass: {
            type: [String, Array, Object],
            default: 'btn btn-outline-primary border-0'
        },
        columns: {
            type: Array,
            required: true
        },
        metadata: {
            type: Array,
            default: () => []
        },
        rowKey: {
            type: [String, Function],
            default: 'id'
        },
        requestUrl: {
            type: String,
            required: true
        },
        requestColumns: {
            type: Array,
            required: true
        },
        requestFilters: {
            type: Object,
            default: () => ({})
        },
        extraRequestData: {
            type: Object,
            default: () => ({})
        },
        search: {
            type: String,
            default: ''
        },
        getDataTable: {
            type: Function,
            default: null
        },
        defaultOrder: {
            type: Array,
            default: () => [[0, 'asc']]
        },
        requestLength: {
            type: Number,
            default: 9999
        },
        noDataMessage: {
            type: String,
            required: true
        },
        errorMessage: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            isPreparing: false,
            isPrintActive: false,
            rows: []
        };
    },

    beforeUnmount() {
        window.removeEventListener('afterprint', this.handleAfterPrint);
    },

    methods: {
        async print() {
            if (this.isPreparing) {
                return;
            }

            this.isPreparing = true;

            try {
                const response = await axios.post(
                    this.requestUrl,
                    this.buildRequestData()
                );

                this.rows = Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

                if (this.rows.length === 0) {
                    this.$alert.error(this.noDataMessage);
                    return;
                }

                this.isPrintActive = true;
                await this.$nextTick();
                window.removeEventListener('afterprint', this.handleAfterPrint);
                window.addEventListener('afterprint', this.handleAfterPrint, { once: true });
                window.print();
            } catch (error) {
                this.isPrintActive = false;
                window.removeEventListener('afterprint', this.handleAfterPrint);
                this.$alert.error(
                    error.response?.data?.message ?? this.errorMessage
                );
            } finally {
                this.isPreparing = false;
            }
        },
        handleAfterPrint() {
            this.isPrintActive = false;
        },
        buildRequestData() {
            const dataTable = this.getDataTable?.();
            const currentOrder = dataTable?.order?.() ?? this.defaultOrder;
            const order = Array.from(currentOrder).map(([column, direction]) => ({
                column,
                dir: direction
            }));

            return {
                draw: 1,
                start: 0,
                length: this.requestLength,
                search: {
                    value: this.search.trim()
                },
                order,
                columns: this.requestColumns.map(column => ({
                    data: column.data,
                    name: column.name
                })),
                filters: this.requestFilters,
                ...this.extraRequestData
            };
        },
        isMetadataVisible(item) {
            return item.visible === undefined || Boolean(item.visible);
        },
        resolveMetadataValue(item) {
            return typeof item.value === 'function'
                ? item.value(this.rows)
                : item.value;
        },
        resolveCellValue(row, column) {
            if (typeof column.formatter === 'function') {
                return column.formatter(row);
            }

            return row[column.key] ?? column.fallback ?? '/';
        },
        resolveRowKey(row, index) {
            const value = typeof this.rowKey === 'function'
                ? this.rowKey(row, index)
                : row[this.rowKey];

            return value ?? index;
        }
    }
};
</script>
