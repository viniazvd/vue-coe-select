<template>
  <div :class="[ 'container', { '-has-error': !!validation } ]">
    <label
      class="label"
      v-if="label">
      {{ label }}
      <span
        class="required"
        v-if="required">
        *
      </span>
    </label>

    <slot />

    <p class="validation" v-if="validationMessage">
      <span class="text">{{ validationMessage }}</span>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    required: Boolean,
    validation: {
      type: [String, Boolean],
      required: false
    }
  },
  computed: {
    validationMessage () {
      if (typeof this.validation === 'string') return this.validation
      else return false
    }
  }
}
</script>

<style lang="scss">
$c-input-error-color: #ff7986 !default;

.container {
  & > .label,
  & > .validation {
    flex: 100%;
    width: 100%;
    display: block;
  }

  & > .label {
    color: black;
    text-transform: uppercase;
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 9px;
  }

  & > .validation {
    display: flex;
    padding-top: 5px;
    align-items: center;
    color: $c-input-error-color;
    position: absolute;

    & > .text {
      font-size: 12px;
      padding-left: 5px;
      white-space: nowrap;
    }
  }
}
</style>
