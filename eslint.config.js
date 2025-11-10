import js from '@eslint/js';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React-specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      // Standard rules
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
        },
      ],
      'no-undef': 'error',
    },
  },
  {
    ignores: ['node_modules/', '.expo/', '.expo-shared/', 'dist/', 'web-build/', '*.config.js'],
  },
];
