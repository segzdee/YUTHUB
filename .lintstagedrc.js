module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{css,scss,less}': [
    'prettier --write',
  ],
  '*.{json,md}': [
    'prettier --write',
  ],
};