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

    let { render, staticRenderFns, errors, tips } = compile(template)
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
    if (tips.length > 0) {
      tips.forEach(tip => console.log(tip))
    }

    let ast = babylon.parse(es2015compile(`var renderFns = [
      (function() { ${render} }).call(this), 
      [${staticRenderFns.map(fn => `function(){ ${fn} }` ).join(',')}]
    ];`))
    // get RHS of  var renderFns = [...];
    let renderFns = ast.program.body[0].declarations[0].init.elements

    const tempVariables = expressions.map((expr, i) => {
      return t.expressionStatement(t.assignmentExpression(
        '=',
        t.MemberExpression(t.ThisExpression(), t.Identifier(`_t$${i}`)),
        expr
      ))
    })

    return [
      t.objectMethod('method', t.identifier('render'), [], t.blockStatement(
        tempVariables.concat(t.returnStatement(renderFns[0]))
      )),
      // don't care about tempVariables here because
      // staticRenderFns will be empty when expressions are available
      t.objectProperty(t.identifier('staticRenderFns'), renderFns[1]),
    ]
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
              ReturnStatement(cpath) {
                if (t.isTemplateLiteral(cpath.node.argument)) {
                  path.replaceWithMultiple(templateToRender(cpath.node))
                }
              }
            })
          }
        })
      }
    }
  }
}