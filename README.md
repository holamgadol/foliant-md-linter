# Foliant markdown linter

Wrapper-script for running markdown linters in Foliant projects.

This script uses:
- [markdown-link-check](https://github.com/tcort/markdown-link-check)
- [markdownlint](https://github.com/DavidAnson/markdownlint) with
  - [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
  - [markdownlint-foliant-rules](https://github.com/holamgadol/markdownlint-foliant-rules)
  for specific Foliant checks.

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
    - `-p`, `--project <project-name>` specify project name
    - `-d`, `--debug` print executing command (default: false)
    - `-f`, `--allowfailure` allow exit with failure if errors (default: false)
- `essential` Check md files for critical formatting errors with markdownlint and validate external links ith markdown-link-check
  - `-v`, `-s`, `-c`, `-p`, `-d`, `-f`
- `urls` Validate external links with markdown-link-check
    - `-v`, `-s`, `-d`, `-f`
- `styleguide` Check for styleguide adherence with markdownlint
    - `-v`, `-s`, `-c`, `-p`, `-d`, `-f`
- `slim` Check for critical errors with markdownlint
    - `-v`, `-s`, `-c`, `-p`, `-d`, `-f`
- `fix` Fix formatting errors with markdownlint
    - `-v`, `-s`, `-c`, `-p`, `-d`, `-f`
- `print` Print linting results
    - `-v`
- `create-full-config` Create markdownlint config for styleguide adherence
    - `-s`, `-p`, `-d`
- `create-slim-config` Create markdownlint config for critical errors check
    - `-s`, `-p`, `-d`


### Examples

The simplest case

```bash
$ npx foliant-md-linter full-check

Checked 2 files
Found 8 critical formatting errors
Full markdownlint log see in /Users/user/github/foliant-md-linter/.markdownlint_slim.log

Found 9 styleguide and formatting errors
Full markdownlint log see in /Users/user/github/foliant-md-linter/.markdownlint_full.log

Found 2 broken external links
Full markdown-link-check log see in /Users/user/github/foliant-md-linter/.markdownlinkcheck.log

```

If you want more detailed output

```bash
$ npx foliant-md-linter full-check -v

Checked 2 files
Found 8 critical formatting errors

--------------------------------------------------------------------------------

FILE: src/linter-test-A.md

src/linter-test-A.md:3 MD001/heading-increment/header-increment Heading levels should only increment by one level at a time [Expected: h2; Actual: h3]
src/linter-test-A.md:7 indented-fence Fenced code shouldn't be indented by 1 to 3 spaces [Context: "   ```bash"]
src/linter-test-A.md:11 non-literal-fence-label Invalid language label in fenced code block
src/linter-test-A.md:18 fenced-code-in-quote Fenced code shouldn't be in quote
src/linter-test-A.md:26 validate-internal-links Broken link [image does not exist] [Context: "/red-circle.png"]
src/linter-test-A.md:30 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article"]
src/linter-test-A.md:32 validate-internal-links Broken link [file does not exist] [Context: "/another-project/subproject/article#anchor"]

--------------------------------------------------------------------------------

FILE: src/subproject/article.md

src/subproject/article.md:3 validate-internal-links Broken link [invalid local anchor] [Context: "#anchor"]

Full markdownlint log see in /Users/user/github/foliant-md-linter/.markdownlint_slim.log

Found 9 styleguide and formatting errors
Full markdownlint log see in /Users/user/github/foliant-md-linter/.markdownlint_full.log

Found 2 broken external links

--------------------------------------------------------------------------------

FILE: src//linter-test-A.md

  [✖] https://example.co/ → Status: 0

--------------------------------------------------------------------------------

FILE: src//subproject/article.md

  [✖] https://example.coms/ → Status: 0

Full markdown-link-check log see in /Users/user/github/foliant-md-linter/.markdownlinkcheck.log
```

If project sources are located in a folder other than _src_, then you may specify them via `-s` option

```bash
$ npx foliant-md-linter full-check -s another-sources
```

Sometimes, the project directory and the project name could be different, especially inside docker containers.
You have an option to specify the project name to validate absolute links properly

```bash
$ npx foliant-md-linter full-check -p project-name
```

You can edit a generated `.markdownlint-cli2.jsonc` config file for your needs
and use it for the next _markdownlint_ runs by `-c` option

```bash
$ npx foliant-md-linter full-check -c
```
