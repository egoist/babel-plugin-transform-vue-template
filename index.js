const babylon = require('babylon')
const { compile } = require('vue-template-compiler')
const es2015compile = require('vue-template-es2015-compiler')

module.exports = function ({ types: t }) {
  return {
    visitor: {
      ObjectMethod(path) {
        if (!t.isIdentifier(path.node.key, {
          name: 'render'
        })) return

        path.traverse({
          ReturnStatement(path) {
            if (t.isTemplateLiteral(path.node.argument)) {
              const { quasis, expressions } = path.node.argument
              const template = quasis.reduce((res, next, i) => {
                const expr = expressions[i] ? `{{_t$${i}}}` : ''
                return res + next.value.raw + expr
              }, '')

              let { render, errors, tips } = compile(template)
              if (errors.length > 0) {
                throw new Error(errors.join('\n'))
              }
              if (tips.length > 0) {
                tips.forEach(tip => console.log(tip))
              }

              render = es2015compile(`var _result = (function () {${render}}).call(this);`)

              const tempVariables = expressions.map((expr, i) => {
                return t.assignmentExpression('=', t.MemberExpression(
                  t.ThisExpression(),
                  t.Identifier(`_t$${i}`)
                ), expr)
              })

              path.replaceWithMultiple(tempVariables.concat([
                babylon.parse(render),
                t.returnStatement(t.Identifier('_result'))
              ]))
            }
          }
        })
      }
    }
  }
}
