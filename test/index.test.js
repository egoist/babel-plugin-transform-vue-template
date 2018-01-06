const babelPluginTransformVueTemplate = require('../')
var babel = require('babel-core')

var options = function(){
	return {filename: __filename, compact: true, plugins: babelPluginTransformVueTemplate}
}

var testTemplate = function(desc, tpl, render, staticRenderFns){
	staticRenderFns = staticRenderFns || '';
	test(desc, () => {
		var result = babel.transform("Vue.component({template:`" + tpl + "`});", options())
		expect(result.code).toBe("Vue.component({render(){" + render + "},staticRenderFns:[" + staticRenderFns + "]});")

		var result2 = babel.transform("Vue.component({render(){return`" + tpl + "`;}});", options())
		expect(result2.code).toBe(result.code);
	})
}

test('main', () => {
  expect(typeof babelPluginTransformVueTemplate).toBe('function')
})

test('do not process string literals', () => {
	var code = `Vue.component({template:'<div>Hello World</div>'});`
	var result = babel.transform(code, options())
	expect(result.code).toBe(code)
})

test('@transform-disable', () => {
	var code = "Vue.component({// @transform-disable\ntemplate:`<div>today is ${new Date()}</div>`});"
	var result = babel.transform(code, options())
	expect(result.code).toBe(code)

	var code2 = "Vue.component({// @transform-disable\nrender(){return`<div>today is ${new Date()}</div>`;}});"
	var result2 = babel.transform(code2, options())
	expect(result2.code).toBe(code2)
})

test('template require', () => {
	var code = "require('./test-template.html')";
	var result = babel.transform("Vue.component({template:" + code + "});", options())
	expect(result.code).toBe("Vue.component({render(){return function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0);}.call(this);},staticRenderFns:[function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('section',[_vm._v(\"Test Template\")])]);}]});")

	var result2 = babel.transform("Vue.component({render(){return " + code + ";}});", options())
	expect(result2.code).toBe(result.code)
})

testTemplate('basic', '<div>Hello World</div>', "return function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._v(\"Hello World\")]);}.call(this);")

testTemplate('static', '<div><section>one</section><section>two</section></div>', "return function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _vm._m(0);}.call(this);",
	"function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('section',[_vm._v(\"one\")]),_c('section',[_vm._v(\"two\")])]);}")

testTemplate('template variable', '<div>today is ${new Date()}</div>', "this._t$0=new Date();return function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._v(\"today is \"+_vm._s(_vm._t$0))]);}.call(this);")
