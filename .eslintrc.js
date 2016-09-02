module.exports = {
  "extends": ["google", "plugin:import/errors", "plugin:import/warnings"],
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
    "jasmine": true,
    "es6": true,
    "commonjs": true
  },
  "globals": {
    "chrome": true
  },
  "plugins": ["import"],
  "rules": {
    "camelcase": 0,
    "dot-notation": 1,
    "eol-last": 0,
    "radix": 0,
    "max-len": 0,
    "no-alert": 0,
    "no-console": 0,
    "no-use-before-define": 0,
    "require-jsdoc": 0,
    "valid-jsdoc": 0,
    "import/no-unresolved": 0,
    "indent": 0,
    "no-multiple-empty-lines": 0,
    "no-nested-ternary": 0,
    "space-before-blocks": 0,
    "brace-style": 0,
    "max-statements-per-line": 0,
    "no-unused-expressions": 0,
    "no-negated-condition": 0,
    "one-var-declaration-per-line": 0,
    "one-var": 0,
    "no-implicit-coercion": 0
  }
}
