<template>
    <div class="gray-dark-bg border-radius-10 padding-4 w-100">
        <div
            v-if="$slots.actions && actionsPosition === 'top'"
            class="d-flex justify-content-end gap-x-4 margin-bottom-4"
        >
            <slot name="actions" />
        </div>

        <slot v-if="$slots.default" />

        <div v-else class="d-flex gap-x-4">
            <div class="flex-grow-1">
                <div
                    v-for="(row, rowIndex) in rows"
                    :key="row.key"
                    class="row g-3 padding-y-2"
                    :class="{ 'border-k-bottom border-color-divider': rowIndex < rows.length - 1 }"
                >
                    <span class="col b-small-font normal-text-color">
                        <slot name="label" :row="row">
                            {{ row.label }}
                        </slot>
                    </span>
                    <span class="col-auto b-small-font muted-text-color text-end text-break padding-left-6">
                        <slot name="value" :row="row">
                            {{ row.value ?? '' }}
                        </slot>
                    </span>
                    <div v-if="actionsPosition === 'row'" class="col-auto d-flex align-items-center gap-x-4">
                        <slot name="row-actions" :row="row" />
                    </div>
                </div>
            </div>

            <div
                v-if="$slots.actions && actionsPosition === 'inline'"
                class="d-flex align-items-start gap-x-4 flex-shrink-0"
            >
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KDataCard',

    props: {
        rows: {
            type: Array,
            default: () => []
        },
        actionsPosition: {
            type: String,
            default: 'top',
            validator: value => ['top', 'inline', 'row'].includes(value)
        }
    }
};
</script>
