// import css from 'rollup-plugin-css-only'
const vue = require('rollup-plugin-vue').default

module.exports = {
  input: 'src/index.js',
  output: {
    format: 'esm',
    file: 'dist/vue-coe-select.esm.js'
  },
  plugins: [
    // css(),
    vue()
  ]
}
