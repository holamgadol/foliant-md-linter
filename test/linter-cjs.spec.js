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

test('markdown -m slim --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m slim', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -l --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n',
    `removing ${path.join(cwd, '.markdownlint-cli2.cjs ...')}`]
  const result = await cli(['markdown', '-m slim', '-l', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -c <custom-config-path> --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m slim', `-c ${customConfigPath}`, '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -l -c <custom-config-path> --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n',
    `removing ${path.join(cwd, '.markdownlint-cli2.cjs ...')}\n`]
  const result = await cli(['markdown', '-m slim', '-l', `-c ${customConfigPath}`, '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 error indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 error non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 error fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 error validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:35 error validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:37 error validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 error validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m slim', '-v', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v -s alt-src --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:8 error non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:19 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:21 error fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:25 error validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:29 error indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m slim', '-v', '-s alt-src', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m slim -v -s no-errors-src -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m slim', '-v', '-s no-errors-src', '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 13 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 13 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n',
    `removing ${path.join(cwd, '.markdownlint-cli2.cjs ...')}`]
  const result = await cli(['markdown', '-m full', '-l', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -v --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 13 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:10 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'src/linter-test-A.md:12 error indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 error non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 error fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:23:3 error MD027/no-multiple-space-blockquote Multiple spaces after blockquote symbol [Context: ">  ```python"]\n',
    'src/linter-test-A.md:24:3 error MD027/no-multiple-space-blockquote Multiple spaces after blockquote symbol [Context: ">  fenced-code-in-quote"]\n',
    'src/linter-test-A.md:27:4 error typograph typograph error [hyphen instead of dash]\n',
    'src/linter-test-A.md:29:7 error typograph typograph error [dash instead of hyphen]\n',
    'src/linter-test-A.md:31 error validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:35 error validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:37 error validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 error validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-v', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s alt-src -v --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 10 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:8 error non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:15:4 error typograph typograph error [hyphen instead of dash]\n',
    'alt-src/linter-test-B.md:17:7 error typograph typograph error [dash instead of hyphen]\n',
    'alt-src/linter-test-B.md:19 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:21 error fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:21:3 error MD027/no-multiple-space-blockquote Multiple spaces after blockquote symbol [Context: ">  ```python"]\n',
    'alt-src/linter-test-B.md:22:3 error MD027/no-multiple-space-blockquote Multiple spaces after blockquote symbol [Context: ">  fenced-code-in-quote"]\n',
    'alt-src/linter-test-B.md:25 error validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:29 error indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'alt-src/linter-test-B.md:33 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s alt-src -v -c <custom-config-path> --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', `-c ${customConfigPath}`, '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s alt-src -v -c <custom-config-path> -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', `-c ${customConfigPath}`, '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -s no-errors-src -v -c <custom-config-path> -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-s no-errors-src', '-v', `-c ${customConfigPath}`, '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-f', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -l --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n',
    `removing ${path.join(cwd, '.markdownlint-cli2.cjs ...')}`]
  const result = await cli(['markdown', '-m full', '-f', '-l', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 9 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:12 error indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',
    'src/linter-test-A.md:16 error non-literal-fence-label Invalid language label in fenced code block\n',
    'src/linter-test-A.md:23 error fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'src/linter-test-A.md:31 error validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'src/linter-test-A.md:35 error validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]\n',
    'src/linter-test-A.md:37 error validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:8 error validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-f', '-v', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c <custom-config-path> --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: src/linter-test-A.md\n',
    'src/linter-test-A.md:8 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:10 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c <custom-config-path> -s alt-src --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '-s alt-src', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c <custom-config-path> -s alt-src -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    '--------------------------------------------------------------------------------\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:19 error MD001/heading-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:33 error MD024/no-duplicate-heading Multiple headings with the same content [Context: "MD001: Heading levels should o..."]\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '-s alt-src', '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v -c <custom-config-path> -s no-errors-src -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m full', '-f', '-v', `-c ${customConfigPath}`, '-s no-errors-src', '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m typograph', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -l --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n',
    `removing ${path.join(cwd, '.markdownlint-cli2.cjs ...')}`]
  const result = await cli(['markdown', '-m typograph', '-l', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m typograph', '-v', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -c <custom-config-path> --format cjs', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m typograph -v -c <custom-config-path> -s alt-src --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '-s alt-src', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m typograph -v -c <custom-config-path> -s alt-src -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '-s alt-src', '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -c <custom-config-path> -s no-errors-src -a --format cjs', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    'Full markdownlint log see in .markdownlint.log\n']
  const result = await cli(['markdown', '-m typograph', '-v', `-c ${customConfigPath}`, '-s no-errors-src', '-a', '--format cjs'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.cjs`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})
