const nextVitals = require('eslint-config-next/core-web-vitals')

module.exports = [
  ...nextVitals,
  {
    ignores: ['node_modules/**', '.next/**', '.next-dev/**', 'dist/**', 'build/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
