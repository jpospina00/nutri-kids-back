// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended, // Reglas recomendadas de ESLint
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Variables globales de Node.js
      },
    },
    rules: {
      'no-console': 'warn', // Te avisa cuando dejas un console.log
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'], // obliga a usar ===
    },
  },
  eslintConfigPrettier, // Para que no choquen ESLint y Prettier
];
