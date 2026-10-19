<template>
  <div class="avatar-container position-relative d-inline-block">

    <KTooltip v-if="hasTooltip" placement="right">
      <!-- TRIGGER -->
      <div
        class="avatar-wrapper d-flex align-items-center justify-content-center overflow-hidden rounded-circle primary-text-color fw-semibold"
        :style="avatarStyle"
        :data-size="size"
        :data-who="who"
      >
        <img
          v-if="showImage"
          :src="src"
          class="avatar-img"
          alt="avatar"
          @error="handleImageError"
        />

        <span v-else class="user-select-none avatar-initials" :style="initialsStyle">
          {{ initials }}
        </span>
      </div>

      <!-- TOOLTIP CONTENT -->
      <template #body>
        <div class="d-flex flex-column gap-6px">
          <div class="b-extra-small-font normal-text-color">{{ who }}</div>
          <div v-if="email" class="b-extra-small-font muted-text-color">{{ email }}</div>
        </div>
      </template>
    </KTooltip>

    <div v-else
      class="avatar-wrapper d-flex align-items-center justify-content-center overflow-hidden rounded-circle primary-text-color fw-semibold"
      :style="avatarStyle"
      :data-size="size"
      :data-who="who"
    >
      <img
        v-if="showImage"
        :src="src"
        class="avatar-img"
        alt="avatar"
        @error="handleImageError"
      />

      <span v-else class="user-select-none avatar-initials" :style="initialsStyle">
        {{ initials }}
      </span>
    </div>

    <!-- Close badge -->
    <div
      v-if="closable"
      class="close-badge d-flex align-items-center justify-content-center rounded-circle"
      @click="$emit('close')"
    >
      <div class="close-icon position-relative d-flex align-items-center justify-content-center">
        <k-icon name="close" wrapperClass="icon-sm" />
        <!-- <div class="close-line rotate-45"></div>
        <div class="close-line rotate-minus-45"></div> -->
      </div>
    </div>

  </div>
</template>

<script>
import KTooltip from '../tooltip/KTooltip.vue'

export default {
  name: "KAvatar",
  components: {
    KTooltip
  },
  props: {
    src: {
      type: String,
      default: ""
    },
    size: {
      type: String,
      default: "medium" // small | medium | large | photo
    },
    who: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    closable: {
      type: Boolean,
      default: false
    },
    hasTooltip: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      imageError: false
    }
  },
  computed: {
    showImage() {
      return this.src && !this.imageError
    },
    initials() {
      if (!this.who) return "?"

      const words = this.who.trim().split(" ")

      if (words.length === 1) {
        return words[0][0].toUpperCase()
      }

      return (words[0][0] + words[1][0]).toUpperCase()
    },
    avatarStyle() {
      const sizes = {
        small: 24,
        medium: 36,
        large: 48,
        photo: 150
      }

      const dimension = sizes[this.size] || 36

      return {
        width: dimension + "px",
        height: dimension + "px",
      }
    },
    initialsStyle() {
      const fontSizes = {
        small: 12,
        medium: 16,
        large: 20,
        photo: 48,
      }

      return {
        fontSize: (fontSizes[this.size] || 16) + 'px'
      }
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true
    }
  }
}
</script>

<style scoped>

</style>