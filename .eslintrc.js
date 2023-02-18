module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/strict-boolean-expressions': 'off',
  },
}
