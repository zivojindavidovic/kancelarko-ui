<template>
    <div
        v-if="lastPage > 1"
        class="app-pagination"
    >
        <button
            type="button"
            class="app-pagination__button app-pagination__button--previous"
            :disabled="currentPage <= 1"
            @click="emitPageChange(currentPage - 1)"
        ></button>

        <template
            v-for="(pageItem, pageItemIndex) in pageItems"
            :key="`${pageItem}-${pageItemIndex}`"
        >
            <span
                v-if="pageItem === ELLIPSIS"
                class="app-pagination__ellipsis"
            >
                ...
            </span>

            <button
                v-else
                type="button"
                class="app-pagination__button"
                :class="{ current: pageItem === currentPage }"
                @click="emitPageChange(pageItem)"
            >
                {{ pageItem }}
            </button>
        </template>

        <button
            type="button"
            class="app-pagination__button app-pagination__button--next"
            :disabled="currentPage >= lastPage"
            @click="emitPageChange(currentPage + 1)"
        ></button>
    </div>
</template>

<script>
const ELLIPSIS = 'ellipsis';

export default {
    name: 'KPagination',

    props: {
        currentPage: {
            type: Number,
            required: true
        },
        lastPage: {
            type: Number,
            required: true
        }
    },

    emits: ['change'],

    data() {
        return {
            ELLIPSIS
        };
    },

    computed: {
        pageItems() {
            const currentPage = Number(this.currentPage || 1);
            const lastPage = Number(this.lastPage || 1);

            if (lastPage <= 7) {
                return Array.from({ length: lastPage }, (_, index) => index + 1);
            }

            if (currentPage <= 4) {
                return [1, 2, 3, 4, 5, ELLIPSIS, lastPage];
            }

            if (currentPage >= lastPage - 3) {
                return [
                    1,
                    ELLIPSIS,
                    lastPage - 4,
                    lastPage - 3,
                    lastPage - 2,
                    lastPage - 1,
                    lastPage,
                ];
            }

            return [
                1,
                ELLIPSIS,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                ELLIPSIS,
                lastPage,
            ];
        }
    },

    methods: {
        emitPageChange(page) {
            if (page < 1 || page > this.lastPage || page === this.currentPage) {
                return;
            }

            this.$emit('change', page);
        }
    }
};
</script>
