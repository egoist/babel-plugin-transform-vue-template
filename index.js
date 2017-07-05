const babylon = require('babylon')
const { compile } = require('vue-template-compiler')
const es2015compile = require('vue-template-es2015-compiler')

function shouldDisable(comments = []) {
  return comments.some(comment => {
    return /@transform-disable/.test(comment.value)
  })
}

module.exports = function({ types: t }) {
  function templateToRender(node) {
    const { quasis, expressions } = node.argument
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

    render = es2015compile(
      `var _result = (function () {${render}}).call(this);`
    )

    const tempVariables = expressions.map((expr, i) => {
      return t.assignmentExpression(
        '=',
        t.MemberExpression(t.ThisExpression(), t.Identifier(`_t$${i}`)),
        expr
      )
    })

    return tempVariables.concat(babylon.parse(render), [
      t.returnStatement(t.Identifier('_result'))
    ])
  }

  return {
    visitor: {
      Program(path, file) {
        path.traverse({
          ObjectProperty(path) {
            const transformTemplate =
              typeof file.opts.template === 'undefined'
                ? true
                : file.opts.template

            if (
              !transformTemplate ||
              !t.isIdentifier(path.node.key, {
                name: 'template'
              })
            ) {
              return
            }

            if (shouldDisable(path.node.leadingComments)) {
              return
            }

            if (t.isTemplateLiteral(path.node.value)) {
              path.replaceWith(
                t.ObjectMethod(
                  'method',
                  t.Identifier('render'),
                  [],
                  t.BlockStatement([t.returnStatement(path.node.value)])
                )
              )
            }
          },
          ObjectMethod(path) {
            if (
              !t.isIdentifier(path.node.key, {
                name: 'render'
              }) ||
              shouldDisable(path.node.leadingComments)
            ) {
              return
            }

            path.traverse({
              ReturnStatement(path) {
                if (t.isTemplateLiteral(path.node.argument)) {
                  path.replaceWithMultiple(templateToRender(path.node))
                }
              }
            })
          }
        })
      }
    }
  }
}
