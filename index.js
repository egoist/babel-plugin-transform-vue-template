const { compile } = require('vue-template-compiler')
const stripWith = require('vue-template-es2015-compiler')
const { parse } = require('@babel/parser');

function shouldDisable(comments = []) {
  return comments.some(comment => {
    return /@transform-disable/.test(comment.value)
  })
}

function toFunction(code, name = '') {
  return `function ${name}(){${code}}`
}

function toASTNode(code) {
  return parse(code).program.body[0];
}

function compilePath(t, path, template) {
  const { errors, tips, render, staticRenderFns } = compile(template)

  if (errors.length > 0) {
    errors.forEach(error => console.error(error))
  }
  if (tips.length > 0) {
    tips.forEach(tip => console.log(tip))
  }

  const renderCode = stripWith(toFunction(render, 'render'));
  const renderFnValue = toASTNode(renderCode);
  renderFnValue.type = 'FunctionExpression'

  const staticRenderCode = stripWith(`[${staticRenderFns
      .map(fn => toFunction(fn))
      .join(',')}]`);
  const staticRenderFnsValue = toASTNode(staticRenderCode).expression;

  path.parentPath.replaceWithMultiple([
    t.objectProperty(t.identifier('render'), renderFnValue),
    t.objectProperty(t.identifier('staticRenderFns'), staticRenderFnsValue)
  ])
}

function isTemplateProperty(node) {
  return node.type === 'ObjectProperty' && node.key.name === 'template'
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
              !isTemplateProperty(parent) ||
              shouldDisable(parent.leadingComments)
            ) {
              return
            }

            compilePath(t, path, path.evaluate().value)
          },

          TaggedTemplateExpression(path) {
            const { parent, node } = path

            if (
              node.tag.name !== 'html' ||
              !isTemplateProperty(parent) ||
              shouldDisable(parent.leadingComments)
            ) {
              return
            }

            const template = path.get('quasi').evaluate().value
            compilePath(t, path, template)
          }
        })
      }
    }
  }
}
