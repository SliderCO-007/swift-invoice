module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:promise/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "promise/always-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/catch-or-return": "error",
    "promise/no-native": "off",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/avoid-new": "warn",
    "promise/no-new-statics": "error",
    "promise/no-return-in-finally": "warn",
    "promise/valid-params": "warn",
    "indent": "off", // Turning off because it can conflict with some auto-formatters
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn on unused variables, but allow unused arguments starting with _
  },
};
