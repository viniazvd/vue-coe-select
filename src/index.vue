<template>
  <container
    v-bind="$attrs"
    :class="containerClasses"
    :validation="validation"
  >
    <div class="inner">
      <div
        class="input"
        :tabindex="tabindex"
        @click="openingHandler"
        @focus="handlerFocus"
        v-click-outside="outside"
      >
        <span v-if="Array.isArray(this.value) && this.multiple && this.value.length" ref="selectable" class="selectable" @click="removeSelected" />
        <span
          ref="searchable"
          contenteditable
          :class="['selecteds', { '-placeholder': !selected }]"
          @keydown.self.down.prevent="pointerForward"
          @keydown.self.up.prevent="pointerBackward"
          @keydown.enter.tab.stop.self="addPointerElement"
          @keydown.tab.stop.self="escHandler"
          @keyup.esc.passive="escHandler"
          @input="search"
          @click="resetQuery"
        >
          <span class="placeholder">{{ selected }}</span>
        </span>

        <span class="icon">{{ isOpened ? '▼' : '▲' }}</span>
      </div>

      <div v-if="isOpened && options.length && !validation" class="items">
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
  </container>
</template>

<script>
import container from './components/Container'

import { equals } from './utils/equals'
import matches from './utils/matches'

export default {
  components: { container },

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
    multiple: Boolean,
    max: [Number, String],
    displayBy: String,
    trackBy: String,
    clearOnSelect: Boolean,
    validation: [String, Boolean],
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

  computed: {
    containerClasses () {
      return [ 'c-select',
        {
          '-is-opened': this.isOpened,
          '-has-validation': this.validation || this.success,
          '-disabled': this.disabled,
          '-success': this.success
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
        let tracked = Array.isArray(this.value)
          ? this.options[index]
          : (this.trackBy && this.options[index][this.trackBy]) || this.options[index]

        if (typeof index !== 'number') {
          this.outside()
          this.$emit('input', index)
        } else {
          if (!Array.isArray(this.value)) {
            this.outside()
            this.$emit('input', tracked)
          }

          if (Array.isArray(this.value) && this.max && this.value.length < this.max) {
            const values = [ ...this.value ]
            const alreadyExist = values.find(value => value === tracked)

            if (!alreadyExist) {
              values.push(tracked)
            } else {
              for (let index = values.length - 1; index >= 0; index--) {
                if (values[index] === tracked) {
                  values.splice(index, 1)
                  break
                }
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
        }
      }
    },

    options () {
      const items = (this.multiple && this.items.map(item => (this.displayBy && item[this.displayBy]) || item)) || this.items

      return this.searchQuery
        ? items.filter(item => {
          const itemName = (!!this.displayBy && item[this.displayBy]) || item

          return typeof itemName === 'string'
            ? matches(this.searchQuery.toLowerCase(), itemName.toLowerCase())
            : matches(this.searchQuery.toString().toLowerCase(), itemName.toString().toLowerCase())
        })
        : items
    }
  },

  methods: {
    itemClasses (item, index) {
      return [
        {
          '-selected': this.isSelected(item),
          '-active': index === this.pointer
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

      if (!this.multiple) this.$emit('input', this.value)
    },

    isSelected (item) {
      if (!this.selected) return false

      if (this.multiple) {
        return this.selected.includes(item)
      } else {
        return this.trackBy
          ? this.selected[this.trackBy] === item[this.trackBy]
          : (this.value && equals(item, this.value)) || ''
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
        const contentDefault = this.items.find(item => item.name === this.value)
        const content =
          (this.multiple && this.value.join('</span><span class="selected">')) ||
          (typeof this.selected === 'object' && this.selected[this.displayBy]) ||
          (contentDefault && contentDefault[this.displayBy]) ||
          this.value ||
          this.placeholder

        if (this.$refs['selectable'] && this.multiple && !!content) {
          this.$refs['selectable'].innerHTML = '<span class="selected">' + content
          this.$refs['searchable'].innerHTML = ''
        }
        if (this.$refs['searchable'] && !this.multiple) this.$refs['searchable'].innerHTML = (!this.value && '') || this.value
        if (Array.isArray(this.value) && !this.value.length) this.$refs['searchable'].innerHTML = '<span class="placeholder">' + this.placeholder + '</span>'

        this.searchQuery = ''
        this.pointerReset()
      }, 100)
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

        & > .placeholder {
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
