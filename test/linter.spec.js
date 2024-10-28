const path = require('path')
const fs = require('fs')
const {
  cli,
  linkCheckFilePrint,
  linuxSwapString,
  copyTestSrcDir
} = require('./utils.js')

const cwd = process.cwd().toString()
const customConfigPath = './test/test-custom-config-cli2.jsonc'

jest.setTimeout(30000)

const testSrcDirs = ['src', 'alt-src', 'no-errors-src']

testSrcDirs.forEach(srcDir => copyTestSrcDir(srcDir))

// Tests

test('First print', async () => {
  const expectedStdout = ''
  const result = await cli(['print', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
  expect(result.code).toEqual(0)
})

test('create-config', async () => {
  const expectedStdout = ['']
  const result = await cli(['create-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('create-config', async () => {
  const expectedStdout = ['']
  const result = await cli(['create-config', '-m full'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('create-config -m slim', async () => {
  const expectedStdout = ['']
  const result = await cli(['create-config', '-m slim'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('create-config -m typograph', async () => {
  const expectedStdout = ['']
  const result = await cli(['create-config', '-m typograph'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('urls', async () => {
  const expectedStdout = [
    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('urls -v', async () => {
  const expectedStdout = [
    'Found 2 broken external links\n',
    '--------------------------------------------------------------------------------\n',
    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,
    `  [✖] ${linuxSwapString('https://github.com/holamgadol/foliant-md-lint', 'https://github.com/holamgadol/foliant-md-linte')} → Status: 404\n`,
    '--------------------------------------------------------------------------------\n',
    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,
    `  [✖] ${linuxSwapString('https://github.com/holamgadol/foliant-md-linte', 'https://github.com/holamgadol/foliant-md-lint')} → Status: 404\n`,
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('urls -v -s alt-src', async () => {
  const expectedStdout = [
    'Found 1 broken external links\n',
    '--------------------------------------------------------------------------------\n',
    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,
    '  [✖] https://github.com/holamgadol/foliant-md-linters → Status: 404\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s alt-src'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('urls -v -s alt-src -a', async () => {
  const expectedStdout = [
    'Found 1 broken external links\n',
    '--------------------------------------------------------------------------------\n',
    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,
    '  [✖] https://github.com/holamgadol/foliant-md-linters → Status: 404\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s alt-src', '-a'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('urls -v -s no-errors-src -a', async () => {
  const expectedStdout = [
    'Found 0 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s no-errors-src', '-a'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('print', async () => {
  await cli(['full-check', '-s alt-src', `-c ${customConfigPath}`], '.')
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 1 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['print'], '.', false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('print -v', async () => {
  await cli(['full-check', '-s alt-src', `-c ${customConfigPath}`], '.')
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 1 broken external links\n',
    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,
    '  [✖] https://github.com/holamgadol/foliant-md-linters → Status: 404\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['print', '-v'], '.', false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})
