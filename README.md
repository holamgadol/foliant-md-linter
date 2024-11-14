# Foliant markdown linter

Wrapper-script for running markdown linters in Foliant projects.

This script uses:
- [markdown-link-check](https://github.com/tcort/markdown-link-check)
- [markdownlint](https://github.com/DavidAnson/markdownlint) with
  - [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
  - [markdownlint-foliant-rules](https://github.com/holamgadol/markdownlint-foliant-rules)
  for specific Foliant checks.

## Installation

Locate your foliant project:

```bash
cd my-awesome-foliant-project/
```

Install _foliant-md-linter_ via npm. Locally or globally, as you wish.

```bash
npm i foliant-md-linter
```

### Include foliant-md-linter into Foliant build

You can invoke foliant-md-linter in a Foliant building process.

#### Prerequisites

- Install _foliant-md-linter_ into your Docker-image if you're using a building within Docker:

  ```dockerfile
  RUN npm i foliant-md-linter -g
  ```

- Install [_runcommands_](https://foliant-docs.github.io/docs/preprocessors/runcommands/) preprocessor
if you haven't installed it yet:

    - native install

      ```bash
      pip install foliantcontrib.runcommands
      ```

    - docker install

      ```dockerfile
      RUN pip3 install foliantcontrib.runcommands
      ```

1. Add _runcommands_ to the `preprocessors` part of the _foliant.yml_:

  ```yml
  preprocessors:
      - runcommands:
          commands:
              - cd ${PROJECT_DIR}
              # use thr project title for the p argument
              # use the l flag if using foliant-md-linter within docker
              - foliant-md-linter styleguide -v -p my-awesome-foliant-project -s src -l
  ```

2. Build you project as usual and check the output for foliant-md-linter messages.

  ```bash
  $ foliant make site --with mkdocs
  Parsing config... Done
  Applying preprocessor runcommands... markdownlint-cli2 v0.4.0 (markdownlint v0.25.1)

  Finding: src/**/*.md
  ...
  Found 5 styleguide and formatting errors
  Full markdownlint log see in /usr/src/app/.markdownlint_full.log

  removing /usr/src/app/.markdownlint-cli2.jsonc ...

  Done
  Applying preprocessor mkdocs... Done
  ...
  ```

## Usage

Run _foliant-md-linter_ from the project root with following commands and options:

- `full-check` – check md files with markdownlint and markdown-link-check
    - `-v`, `--verbose` – print full linting results (default: false)
    - `-s`, `--source <path-to-sources>` – specify source directory (default: _src_)
    - `-c`, `--config <path-to-sources>` – path to custom config
    - `-p`, `--project <project-name>` – specify project name
    - `-d`, `--debug` – print executing command (default: false)
    - `-a`, `--allowfailure` – allow exit with failure if errors (default: false)
    - `--node-modules <node-modules-path>` – custom path to node modules (the command to get the path to the node modules `npm list -g | head -1`)
    - `-w --working-dir <working-dir>` – the working directory should be set if the project folder differs from the CWD. For example, when using the linter in vs code (the command to get the path to the working dir `pwd` in the foliant project folder)

      _helpful in CI/CD, as you can cause pipelines to fail in case of linting errors_

    - `-l`, `--clearconfig` – remove markdownlint config after execution (default: false)

      _helpful within docker, otherwise annoying bugs are occurred with the markdownlint extension for VSCode_

    - `-f`, `--fix` – fix formatting errors with markdownlint (default: false)
    - `-m`, `--markdownlintmode` – set mode for markdownlint. 
      Possible values:
        - `full` – check md files with markdownlint and markdown-link-check
        - `slim` (default value) – check for critical errors with markdownlint
        - `typograph` – fix typograph errors with markdownlint
        - `mdlint-default` – check md files for critical formatting errors with markdownlint and validate external links with markdown-link-check

    - `--includes-map` – set the path to the includes map (default: false)
    - `--foliant-config` – set the configuration file is a foliant from which chapters (default: `./foliant.yml`)

- `markdown` – check md files for errors with markdownlint
    - `-v`, `-s`, `-c`, `-d`, `-a`, `-l`, `-f`, `-m`, `--includes-map`, `--foliant-config`
- `urls` validate external links with markdown-link-check
    - `-v`, `-s`, `-d`, `-a`, `-l`
- `print` print linting results
    - `-v`
- `create-config` create markdownlint config for styleguide adherence
    - `-v`, `-s`, `-p`, `-d`, `-m`

`.markdownlintignore` – an exception file, each line of which can contain a glob.

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

  [✖] https://github.com/holamgadol/foliant-md-lint → Status: 404

--------------------------------------------------------------------------------

FILE: src//subproject/article.md

  [✖] https://github.com/holamgadol/foliant-md-linte → Status: 404

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
