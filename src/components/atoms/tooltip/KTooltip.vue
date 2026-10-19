<template>
    <VTooltip
        :placement="placement"
        :triggers="computedTriggers"
        :shown="isManual ? isOpen : undefined"
        :autoHide="computedAutoHide"
        :distance="distance"
        :delay="delay"
        :skidding="skidding"
        :disabled="disabled"
        :popperClass="popperClass"
    >
        <!-- TRIGGER -->
        <span
            class="app-tooltip-trigger d-flex"
            @click="onTriggerClick"
            @keydown.enter.prevent="onTriggerClick"
            @keydown.space.prevent="onTriggerClick"
            tabindex="0"
            role="button"
            v-if="wrap"
        >
            <slot />
        </span>

        <!-- ako ne želiš wrapper oko slota -->
        <template v-else>
            <slot />
        </template>

        <!-- CONTENT -->
        <template #popper>
            <!-- SIMPLE: samo tekst -->
            <template v-if="isSimple">
                <div class="app-tooltip-text">{{ text }}</div>
            </template>

            <!-- RICH: title + body ili slot -->
            <template v-else>
                <div v-if="title" class="app-tooltip-title">{{ title }}</div>

                <div class="app-tooltip-body">
                    <!-- prioritet: slot body -->
                    <slot name="body">
                        <!-- fallback: body string -->
                        <span v-if="body">{{ body }}</span>
                    </slot>
                </div>
            </template>
        </template>
    </VTooltip>
</template>

<script>
import { Tooltip as VTooltip } from 'floating-vue'

export default {
    name: "KTooltip",
    components: {
        VTooltip
    }, 
    props: {
        /* SIMPLE tooltip */
        text: { type: String, default: "" },

        /* RICH tooltip (strings) */
        title: { type: String, default: "" },
        body: { type: String, default: "" },

        /* behavior */
        mode: {
            type: String,
            default: "hover", // "hover" | "click" | "manual"
            validator: (v) => ["hover", "click", "manual"].includes(v),
        },
        modelValue: { type: Boolean, default: false }, // koristi se samo u manual modu

        /* floating-vue options */
        placement: { type: String, default: "top" },
        autoHide: { type: Boolean, default: null }, // null = auto based on mode
        disabled: { type: Boolean, default: false },

        // sitne finese (po želji)
        distance: { type: Number, default: 8 },
        skidding: { type: Number, default: 0 },
        delay: {
            type: [Number, Object],
            default: () => ({ show: 0, hide: 0 }),
        },

        /* styling hooks */
        popperClass: { type: [String, Array, Object], default: "app-tooltip" },

        /* da li da wrapperujemo trigger u span (radi click/keyboard i stabilnog event target-a) */
        wrap: { type: Boolean, default: true },
    },

    emits: ["update:modelValue", "open", "close", "toggle"],

    computed: {
        isSimple() {
            // simple je kad postoji text i nema rich sadržaja/slota
            // (slot body proveravamo preko $slots)
            const hasRichSlot = !!this.$slots.body;
            return !!this.text && !this.title && !this.body && !hasRichSlot;
        },

        isManual() {
            return this.mode === "manual";
        },

        isOpen() {
            // u manual modu kontrola ide preko modelValue
            return this.modelValue;
        },

        computedTriggers() {
            // manual: ništa automatski
            if (this.mode === "manual") return [];
            if (this.mode === "click") return ["click"];
            return ["hover", "focus"];
        },

        computedAutoHide() {
            // za klik mod je praktično da ne auto-hide dok ti ne klikneš opet,
            // ali ostavljamo da možeš override kroz prop autoHide
            if (this.autoHide !== null) return this.autoHide;
            return this.mode === "click" ? false : true;
        },
    },

    methods: {
        onTriggerClick() {
        if (this.disabled) return;

        // u click modu, VTooltip već radi click trigger,
        // ali je korisno da emitujemo toggle (za debug ili analytics)
        if (this.mode === "click") {
            this.$emit("toggle");
            return;
        }

        if (this.mode === "manual") {
            const next = !this.modelValue;
            this.$emit("update:modelValue", next);
            this.$emit(next ? "open" : "close");
            this.$emit("toggle", next);
        }
        },
    },
};

/* 

1) Simple (80%)
<KTooltip text="Običan tooltip tekst">
  <button class="btn btn-danger">Tooltip</button>
</KTooltip>

2) Rich (title + body string)
<KTooltip title="Naslov" body="Ovo je telo poruke">
  <i class="bi bi-info-circle"></i>
</KTooltip>

3) Rich + custom stil (slot body)
<KTooltip title="Validacija">
  <i class="bi bi-exclamation-circle"></i>

  <template #body>
    Polje je <span class="text-danger">obavezno</span><br />
    Minimum 8 karaktera.
  </template>
</KTooltip>

4) Click mode (da ostane otvoren)
<KTooltip mode="click" title="Naslov" body="Klik da ostane otvoren">
  <button class="btn btn-outline-secondary">Klik</button>
</KTooltip>

5) Manual mode (ti kontrolišeš otvaranje)
<KTooltip mode="manual" v-model="tipOpen" title="Naslov" body="Manual kontrola">
  <button class="btn btn-outline-secondary">Toggle</button>
</KTooltip>


*/
</script>

