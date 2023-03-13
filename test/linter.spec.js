const path = require('path')
const {
  exec,
  execSync
} = require('child_process')
const fs = require('fs')

const cwd = process.cwd().toString()
const isWin = process.platform === 'win32'
jest.setTimeout(10000)

function linkCheckFilePrint (file) {
  if (process.platform === 'win32') {
    file = path.posix.basename(file)
  } else if (process.platform === 'linux') {
    file = file.replace('//', '/')
  }
  return file
}

function linuxSwapString (originalString, linuxString) {
  if (process.platform === 'linux') {
    return linuxString
  } else {
    return originalString
  }
}

function copyTestSrcDir (dirname) {
  execSync((isWin === true ? `xcopy test\\${dirname} ${dirname} /E/S/I/C/Y` : `yes | cp -rf './test/${dirname}/.' ./${dirname}/`))
}

const testSrcDirs = ['src', 'alt-src', 'no-errors-src']

testSrcDirs.forEach(srcDir => copyTestSrcDir(srcDir))

test('First print', async () => {
  const expectedStdout = ''
  const result = await cli(['print', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
  expect(result.code).toEqual(0)
})

test('create-full-config', async () => {
  const expectedStdout = ['Command completed with no errors!\n']
  const result = await cli(['create-full-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('create-slim-config', async () => {
  const expectedStdout = ['Command completed with no errors!\n']
  const result = await cli(['create-slim-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['slim', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -l -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}\n`,
    `${path.join(cwd, '.markdownlint-cli2.jsonc is absent')}\n`]
  const result = await cli(['slim', '-l', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -v -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-v', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('slim -v -p another-project -f', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-v', '-p another-project', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('slim -v -s no-errors-src -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-v', '-s no-errors-src', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 11 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 11 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['styleguide', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 11 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 11 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide -s alt-src -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 8 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide', '-s alt-src', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide -s alt-src -v -c', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide', '-s alt-src', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('styleguide -s alt-src -v -c -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide', '-s alt-src', '-v', '-c', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('styleguide -s no-errors-src -v -c -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide', '-s no-errors-src', '-v', '-c', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['fix', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix -v -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:5 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:3:1 MD051/link-fragments Link fragments should be valid [Context: "[broken local link](#anchor)"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 3 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix -v -c -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v', '-c', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('fix -v -c -s alt-src -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v', '-c', '-s alt-src', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('fix -v -c -s no-errors-src -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v', '-c', '-s no-errors-src', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['typograph', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph -v -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:5 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:3:1 MD051/link-fragments Link fragments should be valid [Context: "[broken local link](#anchor)"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 3 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph -v -c -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph', '-v', '-c', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('typograph -v -c -s alt-src -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph', '-v', '-c', '-s alt-src', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('typograph -v -c -s no-errors-src -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['typograph', '-v', '-c', '-s no-errors-src', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
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
  expect(result.code).toEqual(0)
})

test('urls -v', async () => {
  const expectedStdout = [
    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('urls -v -s alt-src', async () => {
  const expectedStdout = [
    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s alt-src'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('urls -v -s alt-src -f', async () => {
  const expectedStdout = [
    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s alt-src', '-f'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('urls -v -s no-errors-src -f', async () => {
  const expectedStdout = [
    'Found 0 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s no-errors-src', '-f'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['essential', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential -s alt-src -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential', '-s alt-src', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential -s alt-src -v -c', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential', '-s alt-src', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('essential -s alt-src -v -c -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential', '-s alt-src', '-v', '-c', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('essential -s no-errors-src -v -c -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 critical formatting errors\n',
    'Found 0 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['essential', '-s no-errors-src', '-v', '-c', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('full-check -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('full-check -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:7 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:32 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:34 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/subproject/article.md\n',

    'src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('full-check -s alt-src -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 8 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s alt-src', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('full-check -s alt-src -v -c', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s alt-src', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -s alt-src -v -c -l', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}\n`,
    `${path.join(cwd, '.markdownlint-cli2.jsonc is absent')}\n`
  ]
  const result = await cli(['full-check', '-s alt-src', '-v', '-c', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -s alt-src -v -c -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s alt-src', '-v', '-c', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('print', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,
    'Found 1 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['print'], '.', false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('print -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 critical formatting errors\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,
    'Found 1 broken external links\n',
    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,
    '  [✖] https://example.rus/ → Status: 0\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['print', '-v'], '.', false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('full-check -s no-errors-src -v -c -f', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 0 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`,
    'Found 0 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s no-errors-src', '-v', '-c', '-f'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

function cli (args, cwd, clearLogs = true) {
  let clearLogsCmd = ''
  if (clearLogs) {
    clearLogsCmd = (isWin === true) ? 'DEL /Q /F ".markdownlin*" &&' : 'rm -f .markdownlin* &&'
  }
  return new Promise(resolve => {
    exec(`${clearLogsCmd} node ${path.resolve('./linter')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        })
      })
  })
}
