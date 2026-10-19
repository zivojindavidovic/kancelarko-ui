<template>
    <section class="demo-block" :id="anchor">
        <div class="demo-block__head">
            <span class="demo-block__file"><code>{{ name }}</code></span>
            <span class="demo-block__path">src/components/{{ path }}</span>
            <span v-if="note" class="demo-block__note">{{ note }}</span>
        </div>
        <div class="demo-block__body">
            <slot />
        </div>
    </section>
</template>

<script>
/* Playground helper: ispisuje tačan naziv fajla komponente pre njenog prikaza. */
export default {
    name: 'DemoBlock',

    props: {
        name: { type: String, required: true },   // npr. 'KTextInput.vue'
        path: { type: String, required: true },   // npr. 'atoms/text-input/KTextInput.vue'
        note: { type: String, default: '' },
    },

    computed: {
        anchor() {
            return 'demo-' + this.name.replace(/\.vue$/, '')
        },
    },
}
</script>

<style>
.demo-block { margin-bottom: 40px; scroll-margin-top: 90px; }
.demo-block__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--gray-50-50-border); }
.demo-block__file code { font-size: 18px; font-weight: 500; color: var(--primary); background: transparent; padding: 0; }
.demo-block__path { font-size: 12px; color: var(--muted-text-color); }
.demo-block__note { width: 100%; font-size: 14px; color: var(--muted-text-color); }
.demo-toc { columns: 3; column-gap: 24px; }
.demo-toc a { display: block; font-size: 14px; color: var(--muted-text-color); text-decoration: none; padding: 2px 0; }
.demo-toc a:hover { color: var(--primary); }
.demo-inline-modal { position: static !important; transform: none !important; max-width: 100% !important; box-shadow: none !important; padding: 8px 0 !important; opacity: 1 !important; visibility: visible !important; transition: none !important; }
.demo-inline-modal .header-modal-main, .demo-inline-modal .header-content { opacity: 1 !important; transform: none !important; transition: none !important; }
.demo-inline-sidebar { position: static !important; transform: none !important; width: 256px !important; }
@media (max-width: 992px) { .demo-toc { columns: 2; } }
@media (max-width: 576px) { .demo-toc { columns: 1; } }
</style>
