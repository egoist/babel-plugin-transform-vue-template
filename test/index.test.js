const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')

const plugin = require.resolve('../')

test('main', () => {
  const { code } = babel.transform(
    fs.readFileSync(path.join(__dirname, 'fixtures/a.js'), 'utf8'),
    {
      babelrc: false,
      plugins: [plugin]
    }
  )

  expect(code).toMatchSnapshot()
})
