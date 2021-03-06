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

execSync((isWin === true ? 'xcopy test\\src src /E/S/I/C/Y  && xcopy test\\alt-src alt-src /E/S/I/C/Y' : 'yes | cp -rf \'./test/src/.\' ./src/ && yes | cp -rf \'./test/alt-src/.\' ./alt-src/'))

test('First print', async () => {
  const expectedStdout = ''
  const result = await cli(['print', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('create-full-config', async () => {
  const expectedStdout = ['Command completed with no errors!\n']
  const result = await cli(['create-full-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('create-slim-config', async () => {
  const expectedStdout = ['Command completed with no errors!\n']
  const result = await cli(['create-slim-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('slim', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('slim -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`]
  const result = await cli(['slim', '-c'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('styleguide', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 11 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['styleguide'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('fix', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 critical formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,
    'Found 9 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('fix -v -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 2 critical formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:5 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`,

    'Found 2 styleguide and formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`]
  const result = await cli(['fix', '-v', '-c'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('urls', async () => {
  const expectedStdout = [
    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('urls -v', async () => {
  const expectedStdout = [
    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [???] ${linuxSwapString('https://example.co/', 'https://example.coms/')} ??? Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [???] ${linuxSwapString('https://example.coms/', 'https://example.co/')} ??? Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('urls -v -s alt-src', async () => {
  const expectedStdout = [
    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [???] https://example.rus/ ??? Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s alt-src'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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

    `  [???] ${linuxSwapString('https://example.co/', 'https://example.coms/')} ??? Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [???] ${linuxSwapString('https://example.coms/', 'https://example.co/')} ??? Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-v'], '.')
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

    `  [???] ${linuxSwapString('https://example.co/', 'https://example.coms/')} ??? Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [???] ${linuxSwapString('https://example.coms/', 'https://example.co/')} ??? Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-v', '-p another-project'], '.')
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

    '  [???] https://example.rus/ ??? Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s alt-src', '-v'], '.')
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

    '  [???] https://example.rus/ ??? Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s alt-src', '-v', '-c'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
    '  [???] https://example.rus/ ??? Status: 0\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['print', '-v'], '.', false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
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
