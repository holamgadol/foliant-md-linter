const path = require('path')
const fs = require('fs')
const {
  cli,
  copyTestSrcDir
} = require('./utils-for-tests.js')

const cwd = process.cwd().toString()
const customConfigPath = './test/test-custom-config-cli2.jsonc'

jest.setTimeout(30000)

const testSrcDirs = ['src', 'alt-src', 'no-errors-src']

testSrcDirs.forEach(srcDir => copyTestSrcDir(srcDir))

test('markdown -m slim', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['markdown', '-m slim', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -c <custom-config-path>', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', `-c ${customConfigPath}`], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -l -c <custom-config-path>', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}\n`]
  const result = await cli(['markdown', '-m slim', '-l', `-c ${customConfigPath}`], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:35 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:8 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:21 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:25 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:29 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:39 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v -p another-project -a', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:39 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-p another-project', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m slim -v -s no-errors-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-s no-errors-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 11 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 11 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['markdown', '-m full', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 11 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:35 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 11 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:39 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s alt-src -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 8 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:8 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:21 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:25 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:29 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s alt-src -v -c <custom-config-path>', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', `-c ${customConfigPath}`], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s alt-src -v -c <custom-config-path> -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', `-c ${customConfigPath}`, '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -s no-errors-src -v -c <custom-config-path> -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s no-errors-src', '-v', `-c ${customConfigPath}`, '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['markdown', '-m full', '-f', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:35 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:10 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    'src/linter-test-A.md:12 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:37 validate-internal-links Broken link [file exists, but invalid anchor] [Context: "/another-project/subproject/article#anchor"]\n',
    'src/linter-test-A.md:39 validate-internal-links Broken link [file does not exist] [Context: "/foliant-md-linter/subproject/article"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c <custom-config-path>', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:10 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c <custom-config-path> -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c <custom-config-path> -s alt-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '-s alt-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v -c <custom-config-path> -s no-errors-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '-s no-errors-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['markdown', '-m typograph', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -c <custom-config-path>', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m typograph -v -c <custom-config-path> -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m typograph -v -c <custom-config-path> -s alt-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '-s alt-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -c <custom-config-path> -s no-errors-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '-s no-errors-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})
