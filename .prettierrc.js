/** @type {import("prettier").Config} */
export default {
  arrowParens: 'always',
  endOfLine: 'lf',
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: ['package.json', '*.md'],
      options: {
        printWidth: 80,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: 'none',
      },
    },
  ],
};
