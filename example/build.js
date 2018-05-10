const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')

const input = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8')
const code = babel.transform(input, {
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('..')
  ]
}).code
console.log(input)
console.log('-------- to --------')
console.log(code)
