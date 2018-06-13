module.exports = {
  preset: 'jest-puppeteer',
  setupTestFrameworkScriptFile: 'expect-puppeteer',
  roots: ['<rootDir>/integration'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(.*(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
