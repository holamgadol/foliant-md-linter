const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')

const cwd = process.cwd().toString()

test('First print', async () => {
  const expectedStdout = ''
  const result = await cli(['print', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('create-full-config', async () => {
  const expectedStdout = 'Command completed with no errors!\n'
  const result = await cli(['create-full-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('create-slim-config', async () => {
  const expectedStdout = 'Command completed with no errors!\n'
  const result = await cli(['create-slim-config'], '.')
  expect(fs.existsSync(`${cwd}/.markdownlint-cli2.jsonc`)).toBe(true)
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('slim', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 5 critical formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`
  const result = await cli(['slim'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('slim -c', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 2 critical formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`
  const result = await cli(['slim', '-c'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('slim -v', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        "src/linter-test-A.md:7 indented-fence Fenced code shouldn't be indented by 1 to 3 spaces [Context: \"   ```bash\"]\n" +
        'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n' +
        "src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
        'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`
  const result = await cli(['slim', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('slim -v -s alt-src', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n' +
        'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        "alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
        'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
        'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n`
  const result = await cli(['slim', '-v', '-s alt-src'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('styleguide', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 8 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['styleguide'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('styleguide -v', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        "src/linter-test-A.md:7 indented-fence Fenced code shouldn't be indented by 1 to 3 spaces [Context: \"   ```bash\"]\n" +
        'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n' +
        "src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
        'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 8 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['styleguide', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('styleguide -s alt-src -v', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n' +
        'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        "alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
        'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
        'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 8 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['styleguide', '-s alt-src', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('styleguide -s alt-src -v -c', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 2 critical formatting errors\n' +
        'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 2 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['styleguide', '-s alt-src', '-v', '-c'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('fix', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 5 critical formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
      'Found 6 styleguide and formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['fix'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('fix -v', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 5 critical formatting errors\n' +
      'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
      "src/linter-test-A.md:7 indented-fence Fenced code shouldn't be indented by 1 to 3 spaces [Context: \"   ```bash\"]\n" +
      'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n' +
      "src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
      'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
      'Found 6 styleguide and formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['fix', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('fix -v -c', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 2 critical formatting errors\n' +
      'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
      'src/linter-test-A.md:5 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
      'Found 2 styleguide and formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['fix', '-v', '-c'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('fix -v -c -s alt-src', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 2 critical formatting errors\n' +
      'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
      'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
      'Found 2 styleguide and formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n`
  const result = await cli(['fix', '-v', '-c', '-s alt-src'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('urls', async () => {
  const expectedStdout =
        'Found 1 broken external links\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['urls'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('urls -v', async () => {
  const expectedStdout =
        'Found 1 broken external links\n' +
        '  [✖] https://example.co/ → Status: 0\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['urls', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('urls -v -s alt-src', async () => {
  const expectedStdout =
        'Found 1 broken external links\n' +
        '  [✖] https://example.rus/ → Status: 0\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['urls', '-v', '-s alt-src'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('full-check', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 6 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n` +
        'Found 1 broken external links\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['full-check'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('full-check -v', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        'src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        "src/linter-test-A.md:7 indented-fence Fenced code shouldn't be indented by 1 to 3 spaces [Context: \"   ```bash\"]\n" +
        'src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block\n' +
        "src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
        'src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 6 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n` +
        'Found 1 broken external links\n' +
        '  [✖] https://example.co/ → Status: 0\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['full-check', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('full-check -s alt-src -v', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 5 critical formatting errors\n' +
        'alt-src/linter-test-B.md:3 non-literal-fence-label Invalid language label in fenced code block\n' +
        'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        "alt-src/linter-test-B.md:16 fenced-code-in-quote Fenced code shouldn't be in quote\n" +
        'alt-src/linter-test-B.md:20 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]\n' +
        'alt-src/linter-test-B.md:24 indented-fence Fenced code shouldn\'t be indented by 1 to 3 spaces [Context: "   ```bash"]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 8 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n` +
        'Found 1 broken external links\n' +
        '  [✖] https://example.rus/ → Status: 0\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['full-check', '-s alt-src', '-v'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('full-check -s alt-src -v -c', async () => {
  const expectedStdout =
        'Checked 1 files\n' +
        'Found 2 critical formatting errors\n' +
        'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
        'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
        'Found 2 styleguide and formatting errors\n' +
        `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n` +
        'Found 1 broken external links\n' +
        '  [✖] https://example.rus/ → Status: 0\n' +
        `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['full-check', '-s alt-src', '-v', '-c'], '.')
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('print', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 2 critical formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
      'Found 2 styleguide and formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n` +
      'Found 1 broken external links\n' +
      `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['print'], '.', false)
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

test('print -v', async () => {
  const expectedStdout =
      'Checked 1 files\n' +
      'Found 2 critical formatting errors\n' +
      'alt-src/linter-test-B.md:14 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]\n' +
      'alt-src/linter-test-B.md:28 MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content [Context: "### MD001: Heading levels shou..."]\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_slim.log')}\n` +
      'Found 2 styleguide and formatting errors\n' +
      `Full markdownlint log see in ${path.join(cwd, '.markdownlint_full.log')}\n` +
      'Found 1 broken external links\n' +
      '  [✖] https://example.rus/ → Status: 0\n' +
      `Full markdown-link-check log see in ${path.join(cwd, '.markdownlinkcheck.log')}\n`
  const result = await cli(['print', '-v'], '.', false)
  console.log(result)

  expect(result.stdout).toEqual(expectedStdout)
})

function cli (args, cwd, clearLogs = true) {
  let clearLogsCmd = ''
  if (clearLogs) {
    clearLogsCmd = 'DEL /Q /F ".markdownlin*" &&'
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
