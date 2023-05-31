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

test('create-config', async () => {
  const expectedStdout = ['']
  const result = await cli(['create-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('create-config -m full', async () => {
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

test('markdown -m slim', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
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
  expect(result.code).toEqual(0)
})

test('markdown -m slim -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m slim -l -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}\n`,
    `${path.join(cwd, '.markdownlint-cli2.jsonc is absent')}\n`]
  const result = await cli(['markdown', '-m slim', '-l', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m slim -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m slim -v -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m slim -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m slim -v -p another-project -a', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m slim', '-v', '-p another-project', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
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
  expect(result.code).toEqual(0)
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
  expect(result.code).toEqual(0)
})

test('markdown -m full -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 11 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 11 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -s alt-src -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -s alt-src -v -c', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -s alt-src -v -c -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s alt-src', '-v', '-c', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -s no-errors-src -v -c -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-s no-errors-src', '-v', '-c', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['markdown', '-m full', '-f', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: src/linter-test-A.md\n',

    'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'src/linter-test-A.md:5 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    'FILE: src/subproject/article.md\n',
    'src/subproject/article.md:3:1 MD051/link-fragments Link fragments should be valid [Context: "[broken local link](#anchor)"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 3 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v -c -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', '-c', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m full -f -v -c -s alt-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', '-c', '-s alt-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m full -f -v -c -s no-errors-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m full', '-f', '-v', '-c', '-s no-errors-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
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

test('markdown -m typograph -v -c', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 3 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -c -s alt-src', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', '-c', '-s alt-src'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('markdown -m typograph -v -c -s alt-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', '-c', '-s alt-src', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('markdown -m typograph -v -c -s no-errors-src -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`]
  const result = await cli(['markdown', '-m typograph', '-v', '-c', '-s no-errors-src', '-a'], '.')
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

test('urls -v -s alt-src -a', async () => {
  const expectedStdout = [
    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['urls', '-v', '-s alt-src', '-a'], '.')
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
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

test('full-check -m slim', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -m slim -l', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`,
    `removing ${path.join(cwd, '.markdownlint-cli2.jsonc ...')}`]
  const result = await cli(['full-check', '-m slim', '-l'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -m slim -v', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -m slim -v -p another-project', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//linter-test-A.md', 'src//subproject/article.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.co/', 'https://example.coms/')} → Status: 0\n`,

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint(linuxSwapString('src//subproject/article.md', 'src//linter-test-A.md'))}\n`,

    `  [✖] ${linuxSwapString('https://example.coms/', 'https://example.co/')} → Status: 0\n`,

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim', '-v', '-p another-project'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -m slim -s alt-src -v', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 5 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim', '-s alt-src', '-v'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -m slim -s alt-src -v -c', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim', '-s alt-src', '-v', '-c'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check -m slim -s alt-src -v -c -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim', '-s alt-src', '-v', '-c', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('full-check -m slim -s no-errors-src -v -c -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    'Found 0 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-m slim', '-s no-errors-src', '-v', '-c', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(0)
})

test('full-check', async () => {
  const expectedStdout = [
    'Checked 2 files\n',
    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

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
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

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
    'Found 8 formatting errors\n',

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

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 9 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

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
    'Found 5 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn\'t be in quote\n',
    'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n',
    'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 8 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

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
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

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
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

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

test('full-check -s alt-src -v -c -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',

    '--------------------------------------------------------------------------------\n',

    'FILE: alt-src/linter-test-B.md\n',

    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',

    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,

    'Found 1 broken external links\n',

    '--------------------------------------------------------------------------------\n',

    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,

    '  [✖] https://example.rus/ → Status: 0\n',

    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s alt-src', '-v', '-c', '-a'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
  expect(result.code).toEqual(1)
})

test('print', async () => {
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
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 2 formatting errors\n',
    'FILE: alt-src/linter-test-B.md\n',
    'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n',
    'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 2 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 1 broken external links\n',
    `FILE: ${linkCheckFilePrint('alt-src//linter-test-B.md')}\n`,
    '  [✖] https://example.rus/ → Status: 0\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['print', '-v'], '.', false)
  console.log(result)

  expectedStdout.forEach(element => expect(result.stdout).toContain(element))
})

test('full-check -s no-errors-src -v -c -a', async () => {
  const expectedStdout = [
    'Checked 1 files\n',
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 0 formatting errors\n',
    `Full markdownlint log see in ${path.join(cwd, '.markdownlint.log')}\n`,
    'Found 0 broken external links\n',
    `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`]
  const result = await cli(['full-check', '-s no-errors-src', '-v', '-c', '-a'], '.')
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
