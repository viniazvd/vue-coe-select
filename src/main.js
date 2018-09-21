import Vue from 'vue'
import Testes from './example/Testes.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(Testes)
}).$mount('#app')
