<template>
    <div :class="boxClass">
        <div :class="contentClass">
            <span :class="iconClass">
                <k-icon :name="iconName" :wrapperClass="iconWrapperClass" />
            </span>

            <span class="flex-grow-1">
                <slot />
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KInfoBox',

    props: {
        iconName: {
            type: String,
            default: 'info'
        },
        boxClass: {
            type: [String, Array, Object],
            default: 'gray-dark-bg border-radius-10 p-3'
        },
        contentClass: {
            type: [String, Array, Object],
            default: 'b-small-font muted-text-color d-flex align-items-start gap-2 flex-nowrap'
        },
        iconClass: {
            type: [String, Array, Object],
            default: 'icon-sm muted-text-color d-inline-flex flex-shrink-0'
        },
        iconWrapperClass: {
            type: [String, Array, Object],
            default: 'icon-sm'
        }
    }
};
</script>
