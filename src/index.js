// import VueCoeSelect from './components/VueCoeSelect.vue'
// import pointer from './mixins/pointer.js'
// import searchable from './mixins/searchable'

// export default VueCoeSelect

// export { VueCoeSelect, pointer, searchable }

import VueCoeSelect from './components/VueCoeSelect.vue'

if (typeof Vue !== 'undefined') {
  Vue.component('VueCoeSelect', VueCoeSelect)
}