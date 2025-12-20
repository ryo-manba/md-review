export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-plugin-use-baseline'],

  rules: {
    'plugin/use-baseline': [true, { available: 'widely' }],
  },
};
