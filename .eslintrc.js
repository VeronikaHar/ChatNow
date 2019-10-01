module.exports = {
  env: {
    'react-native/react-native': true,
  },
  parser: 'babel-eslint',
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
  },
  plugins: [
    'react',
    'react-native',
  ],
  rules: {
  },
};
