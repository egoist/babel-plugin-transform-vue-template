const { compile } = require('vue-template-compiler')
const stripWith = require('vue-template-es2015-compiler')
const template = require('@babel/template').default

function shouldDisable(comments = []) {
  return comments.some(comment => {
    return /@transform-disable/.test(comment.value)
  })
}

function toFunction(code, name = '') {
  return `function ${name}(){${code}}`
}

module.exports = function({ types: t }) {
  return {
    name: 'transform-vue-template',
    visitor: {
      Program(path) {
        path.traverse({
          TemplateLiteral(path) {
            const { parent } = path

            if (
              parent.type !== 'ObjectProperty' ||
              parent.key.name !== 'template' ||
              shouldDisable(parent.leadingComments)
            ) {
              return
            }

            const { errors, tips, render, staticRenderFns } = compile(
              path.evaluate().value
            )
            if (errors.length > 0) {
              errors.forEach(error => console.error(error))
            }
            if (tips.length > 0) {
              tips.forEach(tip => console.log(tip))
            }

            const renderFnValue = template(
              stripWith(toFunction(render, 'render'))
            )()
            renderFnValue.type = 'FunctionExpression'

            const staticRenderFnsValue = template(
              stripWith(
                `[${staticRenderFns.map(fn => toFunction(fn)).join(',')}]`
              )
            )().expression

            path.parentPath.replaceWithMultiple([
              t.objectProperty(t.identifier('render'), renderFnValue),
              t.objectProperty(
                t.identifier('staticRenderFns'),
                staticRenderFnsValue
              )
            ])
          }
        })
      }
    }
  }
}
