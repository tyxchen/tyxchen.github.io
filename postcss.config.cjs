module.exports = {
  plugins: [
    require('postcss-import'),
    require('@csstools/postcss-mixins'),
    require('autoprefixer'),
    require('postcss-atroot'),
    require('postcss-custom-media'),
    require('postcss-nested'),
  ]
}
