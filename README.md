# babel-plugin-transform-vue-template

[![NPM version](https://img.shields.io/npm/v/babel-plugin-transform-vue-template.svg?style=flat)](https://npmjs.com/package/babel-plugin-transform-vue-template) [![NPM downloads](https://img.shields.io/npm/dm/babel-plugin-transform-vue-template.svg?style=flat)](https://npmjs.com/package/babel-plugin-transform-vue-template) [![CircleCI](https://circleci.com/gh/egoist/babel-plugin-transform-vue-template/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/babel-plugin-transform-vue-template/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

Compile Vue template at build time via babel plugin.

## Install

```bash
yarn add babel-plugin-transform-vue-template --dev

yarn add vue-template-compiler --dev
# vue-template-compiler is required as peer dependency
```

## Usage

With `.babelrc`:

```js
{
  "plugins": ["transform-vue-template"]
}
```

Then every object property `template` whose value is a template string literal will be compiled to `render` function at build time:

```js
export default {
  template: `<div>
    <button @click="whatever">Click me!</button>
  </div>`,

  methods: {
    whatever() {
      // do whatever
    }
  }
}
```

Compiled code:

```js
export default {
  render: function render() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c('div', [_c('button', {
      on: {
        "click": _vm.whatever
      }
    }, [_vm._v("Click me!")])]);
  },
  staticRenderFns: [],
  methods: {
    whatever() {// do whatever
    }

  }
};
```

### Tagged template expression

This plugin also handles tagged template expression, it simply ignores the tag:

```js
export default {
  template: html`<div>{{ message }}</div>`
}
```

Note that the tag name can only be `html`.

### Disable transforming for specific code

Add a comment block with `@transform-disable` to the previous line:

```js
export default {
  // @transform-disable
  template: `<div></div>`
}
```

### Syntax highlighting

- VSCode, currently no editor support.
- Atom, supported by default.
- Sublime, unknown.
- WebStorm, supported by default.


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**babel-plugin-transform-vue-template** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/babel-plugin-transform-vue-template/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
