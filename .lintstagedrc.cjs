module.exports = {
  '*.{ts,tsx}': [
    'tsc --noEmit --skipLibCheck',
    'eslint --fix',
    'prettier --write',
  ],
  '*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss,less,json,md}': ['prettier --write'],
};
