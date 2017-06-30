const babelPluginTransformVueTemplate = require('../')

test('main', () => {
  expect(typeof babelPluginTransformVueTemplate).toBe('function')
})
