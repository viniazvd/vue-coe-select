const { name } = require('./package.json')

const vue = require('rollup-plugin-vue').default
const sass = require('rollup-plugin-sass')

module.exports = {
  js: 'buble',
  input: 'src/index.js',
  banner: true,
  format: ['umd', 'umd-min', 'cjs', 'es'],
  filename: name + '[suffix].js',
  plugins: [
    sass(),
    vue()
  ]
}