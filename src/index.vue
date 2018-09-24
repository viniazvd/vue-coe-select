<template>
  <div :class="containerClasses">
    <div class="inner">
      <label v-if="label" class="label">
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>

      <div
        class="input"
        :tabindex="tabindex"
        @click.capture="openingHandler"
        @focus.native="handlerFocus"
        v-click-outside="outside"
      >
        <span v-if="this.multiple && this.value.length" ref="selectable" class="selectable" @click="removeSelected" />
        <span
          ref="searchable"
          contenteditable
          :class="['selecteds', { '-placeholder': selected === placeholder }]"
          @keydown.self.down.prevent="pointerForward"
          @keydown.self.up.prevent="pointerBackward"
          @keydown.enter.tab.stop.self="addPointerElement"
          @keydown.tab.stop.self="escHandler"
          @keyup.esc.passive="escHandler"
          @input="search"
        />
          <!-- <span class="placeholder">{{ selected }}</span> -->

        <span class="icon">{{ isOpened ? '▼' : '▲' }}</span>
      </div>

      <div v-if="isOpened && options.length" class="items">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="item"
          :class="itemClasses(option, index)"
          aria-hidden="true"
          @click.stop="selected = index"
          @mouseenter.self="pointerSet(index)"
        >
          <span class="text">{{ displayBy && option[displayBy] || option }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { equals } from './utils/equals'
import matches from './utils/matches'

export default {
  directives: {
    'click-outside': {
      bind: function (el, binding, vNode) {
        const handler = (e) => {
          if (!el.contains(e.target) && el !== e.target) {
            binding.value(e)
          }
        }
        el.__vueClickOutside__ = handler

        document.addEventListener('click', handler)
      },

      unbind: function (el, binding) {
        document.removeEventListener('click', el.__vueClickOutside__)
        el.__vueClickOutside__ = null
      }
    }
  },

  props: {
    tabindex: {
      type: Number,
      default: 0
    },
    value: [String, Object, Number, Array],
    items: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Selecione uma opção'
    },
    label: String,
    required: Boolean,
    validation: {
      type: [String, Boolean],
      required: false
    },
    multiple: Boolean,
    max: [Number, String],
    displayBy: String,
    trackBy: String,
    clearOnSelect: Boolean,
    disabled: Boolean,
    success: Boolean
  },

  data () {
    return {
      pointer: -1,
      isOpened: false,
      searchQuery: ''
    }
  },

  watch: {
    value (v) {
      if (!v) {
        this.synchronizeOnReset()
      }
    }
  },

  mounted () {
    this.$refs['searchable'].innerHTML = this.placeholder || ''
  },

  computed: {
    errors () {
      if (!this.items.some(item => this.displayBy && typeof item === 'object')) return ['You need to set displayBy.']

      if (this.multiple && !Array.isArray(this.value)) return ['Value must be a array']

      if (this.validation) return [this.validation]
    },

    containerClasses () {
      return [ 'c-select',
        {
          '-is-opened': this.isOpened,
          '-disabled': this.disabled
        }
      ]
    },

    selected: {
      get () {
        if (this.placeholder && (Array.isArray(this.value) ? !this.value.length : !this.value)) return this.placeholder

        const value = this.items
          .find(v => v === (Array.isArray(this.value) && this.value && this.displayBy && this.value[this.displayBy]) || this.value)

        if (!value) return 'Opção inválida'

        if (this.value) {
          if (this.displayBy && value[this.displayBy]) {
            return value[this.displayBy]
              ? value[this.displayBy]
              : process.env.NODE_ENV === 'development' ? 'error: displayBy prop does not exist' : ''
          } else {
            return this.value
          }
        }
      },
      set (index) {
        // invalid search
        if (index < 0) {
          this.outside()
          return
        }

        // remove
        if (typeof index !== 'number') {
          this.$emit('input', index)
          this.outside()
          return
        }

        let tracked = (this.trackBy && this.items[index][this.trackBy]) || this.items[index]

        if (this.multiple) {
          if (this.max && this.value.length < this.max) {
            const values = [ ...this.value ]
            const alreadyExist = values.find(value => value === tracked)

            if (!alreadyExist) {
              values.push(tracked)
            } else {
              for (let index = values.length - 1; index >= 0; index--) {
                if (values[index] === tracked) values.splice(index, 1); break
              }
            }

            tracked = values

            // check if the last searched item is valid
            if (tracked[tracked.length - 1]) {
              this.outside()
              this.$emit('input', tracked)
            }
          } else {
            this.isOpened = false
          }
        } else {
          this.outside()
          this.$emit('input', tracked)
        }
      }
    },

    options () {
      if (this.errors) return this.errors

      const items = this.items.map(item => (this.displayBy && item[this.displayBy]) || item)

      return this.searchQuery
        ? items.filter(item => {
          return typeof item === 'string'
            ? matches(this.searchQuery.toLowerCase(), item.toLowerCase())
            : matches(this.searchQuery.toString().toLowerCase(), item.toString().toLowerCase())
        })
        : items
    }
  },

  methods: {
    itemClasses (option, index) {
      return [
        {
          '-selected': this.isSelected(option, index),
          '-active': index === this.pointer,
          '-disabled': this.errors
        }
      ]
    },

    synchronizeOnReset () {
      this.$refs.searchable.innerHTML = this.placeholder || ''
    },

    handlerFocus () {
      this.isOpened = true

      this.resetQuery()
      this.setFocus()
    },

    openingHandler () {
      this.isOpened = !this.isOpened

      this.resetQuery()
      this.setFocus()
    },

    escHandler () {
      if (this.isOpened) {
        this.outside()
        this.unsetFocus()
      }
    },

    removeSelected ({ target: { innerText } }) {
      const afterRemove = [ ...this.value ].filter(v => v !== innerText)

      this.selected = afterRemove
    },

    resetQuery () {
      this.$refs['searchable'].innerHTML = ''
    },

    isSelected (option, index) {
      if (!this.selected) return false

      if (this.multiple) {
        return this.selected.includes(option)
      } else {
        console.log(option, this.selected)
        return option === this.selected
        // return this.trackBy
        //   ? this.selected[this.trackBy] === option[this.trackBy]
        //   : (this.value && equals(option, this.value)) || ''
      }
    },

    outside () {
      this.isOpened = false

      this.blur()
    },

    clear () {
      this.itemSelected = (this.clearOnSelect && '') || this.itemSelected
    },

    search ({ target: { textContent } }) {
      this.isOpened = true

      this.searchQuery = textContent
    },

    blur () {
      setTimeout(() => {
        if (this.multiple) {
          const contentDefault = this.items.find(item => item.name === this.value)
          const content = contentDefault || this.value.join('</span><span class="selected">')

          if (content && this.$refs['selectable']) {
            this.$refs['selectable'].innerHTML = '<span class="selected">' + content
            this.$refs['searchable'].innerHTML = ''
          }

          if (!this.value.length) this.$refs['searchable'].innerHTML = this.placeholder
        } else {
          this.$refs['searchable'].innerHTML = this.value || this.placeholder || ''
        }

        this.searchQuery = ''
        this.pointerReset()
      }, 200)
    },

    pointerReset () {
      this.pointer = -1
    },

    pointerSet (option) {
      this.pointer = option
    },

    pointerForward () {
      if (this.pointer < this.items.length - 1) this.pointer++
    },

    pointerBackward () {
      if (this.pointer > 0) this.pointer--
    },

    setFocus () {
      this.$refs.searchable.focus()
    },

    unsetFocus () {
      this.$refs.searchable.blur()
    },

    addPointerElement ({ key } = 'Enter') {
      if (this.items.length > 0 && key === 'Enter') {
        this.selected = this.pointer

        this.$nextTick(() => {
          this.unsetFocus()
          this.outside()
        })
      }
    }
  }
}
</script>

<style lang="scss">
$vue-coe-select-border-color: #E9EAEE;
$vue-coe-select-highlight-background: #f3f4f6 !default;

$c-input-disabled-background-color: #eaedef !default;
$c-input-disabled-color:            #bdc0d1 !default;

.c-select {
  position: relative;

  &.-disabled {
    cursor: default;
    pointer-events: none;

    & > .inner > .input {
      background-color: $c-input-disabled-background-color;
      border-color: $c-input-disabled-background-color;

      pointer-events: none;

      & > .selected,
      & > .selected.-placeholder {
        color: $c-input-disabled-color;
        font-weight: 300;
      }

      & > .icon { fill: $c-input-disabled-color; }
    }
  }

  & > .inner {
    position: relative;
    width: 100%;

    & > .input {
      position: relative;
      border: 1px solid $vue-coe-select-border-color;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      height: 40px;
      background-color: white;
      border-radius: 3px;
      font-size: 14px;
      transition: border-color .3s ease, box-shadow .3s ease;

      & > .selectable {
        display: flex;

        & > .selected {
          position: relative;
          color: white;
          border-radius: 3px;
          background-color: red;
          margin-left: 10px;
          max-height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: { left: 10px; right: 35px; top: 2px; bottom: 2px; }
          cursor: pointer;
          // white-space: nowrap;

          &:after {
            position: absolute;
            content: 'x';
            right: 10px;
            bottom: 2px;
          }
        }
      }

      & > .selecteds {
        display: inline-flex;
        align-items: center;
        color: black;
        padding-left: 10px;
        padding-right: 35px;
        line-height: 40px;
        min-height: inherit;
        outline: none;
        flex-grow: 1;
        cursor: text;

        &.-placeholder {
          color: gray;
          font-size: 14px;
          font-weight: 400;
        }
      }

      & > .icon {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        transition: transform 500ms ease;
      }
      &:hover,
      &:active,
      &:focus {
        border-color: green;
        box-shadow: 0 0 0 2px green;
      }
    }

    .items {
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 2;
      width: 100%;
      box-sizing: border-box;
      background-color: #fff;
      position: absolute;
      left: 0;
      top: calc(100% + 2px);
      border: 1px solid #E8E8E8;
      border-top: none;

      & > .item {
        cursor: pointer;
        min-height: 40px;
        display: flex;
        align-items: center;

        &.-selected { font-weight: 700; }
        &.-active { background-color: $vue-coe-select-highlight-background; }
        &.-disabled { cursor: not-allowed; }

        &:first-child {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        &:last-child {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }

        & > .text {
          font-size: 14px;
          color: black;
          transition: color .3s ease;
          color: black;
          padding: 10px;
          padding-left: 12px;
        }

        &:hover {
          background-color: $vue-coe-select-highlight-background;

          & > .text {
            color: orange;
            color: pink;
          }
        }
      }
    }

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
      color: red;
      position: absolute;

      & > .text {
        font-size: 12px;
        padding-left: 5px;
        white-space: nowrap;
      }
    }

    &.-is-opened { @extend %c-select-opened; }
  }
}

%c-select-opened {
  & > .input {
    border-radius: 3px 3px 0 0;

    & > .entry > .icon { transform: translateY(-50%) rotate(-180deg); }
  }
}
</style>
