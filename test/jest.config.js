const { resolve } = require('path');
const root = resolve(__dirname, '..');
const rootConfig = require(`${root}/jest.config.js`);

module.exports = {
  ...rootConfig,
  ...{
    rootDir: root,
    displayName: 'end2end-tests',
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'], //o arquivo de setup roda antes de rodar os testes. Bom para fazer setups de database, servidor [express]
    testMatch: ['<rootDir>/test/**/*.test.ts'],
  },
};
