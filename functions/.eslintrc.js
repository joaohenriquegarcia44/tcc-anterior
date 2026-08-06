module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,  // <- permite operadores modernos
  },
  extends: [
    'eslint:recommended',
  ],
   rules: {
    'no-unused-vars': 'off',
    'object-curly-spacing': 'off',
  },
  rules: {
    'no-console': 'off',
    'require-jsdoc': 'off',
  },
};