# Foliant markdown linter

Wrapper-script for running markdown linters in Foliant projects.

## Installation

Locate your foliant project

```bash
cd my-awesome-foliant-project/
```

Install _foliant-md-linter_ via npm. Locally or globally, as you wish.

```bash
npm i foliant-md-linter
```

## Usage

Run _foliant-md-linter_ from the project root with following commands and options

- `full-check` Check md files with markdownlint and markdown-link-check
    - `-v`, `--verbose` Print full linting results (default: false)
    - `-s`, `--source <path-to-sources>` specify source directory (default: _src_)
    - `-c`, `--config` Do not create a new markdownlint config file and use default or one in root directory instead (default: false)
- `urls` Validate external links with markdown-link-check
    - `-v`, `-s`
- `styleguide` Check for styleguide adherence with markdownlint
    - `-v`, `-s`, `-c`
- `slim` Check for critical errors with markdownlint
  - `-v`, `-s`, `-c`
- `fix` Fix formatting errors with markdownlint
  - `-v`, `-s`, `-c`
- `print` Print linting results
    - `-v`
- `create-full-config` Create markdownlint config for styleguide adherence
- `create-slim-config` Create markdownlint config for critical errors check

### Examples

The simplest case

```bash
$ npx foliant-md-linter full-check

Process finished with exit code 1
Checked 1 files
Found 5 critical formatting errors
Full markdownlint log see in user/my-awesome-foliant-project/.markdownlint_slim.log
Found 6 styleguide and formatting errors
Full markdownlint log see in user/my-awesome-foliant-project/.markdownlint_full.log
Found 1 broken external links
Full markdown-link-check log see in user/my-awesome-foliant-project/.markdownlinkcheck.log
```

If you want more detailed output

```bash
$ npx foliant-md-linter full-check -v

Checked 1 files
Found 5 critical formatting errors
src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3] 
src/linter-test-A.md:7 indented-fence Fenced code shouldn't be indented by 1 to 3 spaces [Context: \"   ```bash\"]
src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block
src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn't be in quote
src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]
Full markdownlint log see in user/my-awesome-foliant-project/.markdownlint_slim.log
Found 6 styleguide and formatting errors
Full markdownlint log see in user/my-awesome-foliant-project/.markdownlint_full.log
Found 1 broken external links
  [✖] https://example.co/ → Status: 0
Full markdown-link-check log see in user/my-awesome-foliant-project/.markdownlinkcheck.log
```
