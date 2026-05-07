const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
    {
        ignores: ['node_modules', '.next', '.next-dev', 'dist', 'build'],
    },
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                window: 'readonly',
                localStorage: 'readonly',
                fetch: 'readonly',
                Request: 'readonly',
                Response: 'readonly',
                AbortController: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                DOMException: 'readonly',
                crypto: 'readonly',
                React: 'readonly',
                HTMLDialogElement: 'readonly',
                HTMLHeadingElement: 'readonly',
            },
        },
        plugins: { '@typescript-eslint': tsPlugin },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                window: 'readonly',
                localStorage: 'readonly',
                fetch: 'readonly',
                Request: 'readonly',
                Response: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                React: 'readonly',
            },
        },
    },
];
