const path = require('path')
const fs = require('fs')
const {
  cli,
  copyTestSrcDir
} = require('../test/utils-for-tests.js')

const cwd = process.cwd().toString()

jest.setTimeout(30000)

const testSrcDirs = ['maps']
const config = 'foliant.yml'

testSrcDirs.forEach(srcDir => copyTestSrcDir(srcDir, config))

test('create-maps', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n',
    'Found 2 broken external links\n',
    'Full markdown-link-check log see in .markdownlinkcheck.log\n']
  const result = await cli(['create-maps'], '.')
  // expect(fs.existsSync(`${cwd}/includes_map.json`)).toBe(true)
  // expect(fs.existsSync(`${cwd}/anchors_map.json`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

// test('create-maps --ext-prep ./extend-preprocess.yml', async () => {
//   const expectedStdout = [
//     'Checked 2 files\n',
//     'Found 8 formatting errors\n',
//     'Full markdownlint log see in .markdownlint.log\n',
//     'Found 2 broken external links\n',
//     'Full markdown-link-check log see in .markdownlinkcheck.log\n',
//     `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
//   const result = await cli(['create-maps', '--ext-prep ./extend-preprocess.yml'], '.')
//   // expect(fs.existsSync(`${cwd}/includes_map.json`)).toBe(true)
//   // expect(fs.existsSync(`${cwd}/anchors_map.json`)).toBe(true)
//   console.log(result)

//   expectedStdout.forEach(element => expect(result.stdout).toContain(element))
//   expect(result.code).toEqual(1)
// })
