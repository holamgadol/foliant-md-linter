#!/usr/bin/env node

const { Command } = require('commander')
const path = require('path')
const fs = require('fs')
const program = new Command()
const cwd = process.cwd().toString()

function createConfig (mode = 'full', source = '', project = '', includesMap = '') {
  const customRules = [
    'markdownlint-rules-foliant/lib/indented-fence',
    'markdownlint-rules-foliant/lib/non-literal-fence-label',
    'markdownlint-rules-foliant/lib/fenced-code-in-quote',
    'markdownlint-rules-foliant/lib/typograph',
    'markdownlint-rules-foliant/lib/validate-internal-links',
    'markdownlint-rules-foliant/lib/frontmatter-tags-exist'
  ]

  const configFull = {
    MD001: true,
    MD004: { style: 'dash' },
    MD005: true,
    MD007: { indent: 4 },
    MD009: true,
    MD010: true,
    MD012: { maximum: 5 },
    MD013: {
      line_length: 1000,
      heading_line_length: 80
    },
    MD014: true,
    MD018: true,
    MD019: true,
    MD022: true,
    MD024: true,
    MD025: true,
    MD026: true,
    MD027: true,
    MD028: true,
    MD029: false,
    MD030: true,
    MD031: true,
    MD032: false,
    MD033: false,
    MD034: false,
    MD036: true,
    MD037: true,
    MD038: true,
    MD040: true,
    MD041: true,
    MD045: true,
    MD046: false,
    MD047: true,
    MD049: { style: 'underscore' },
    MD050: { style: 'asterisk' },
    MD051: false,
    MD052: true,
    MD053: false,
    'indented-fence': true,
    'non-literal-fence-label': true,
    'fenced-code-in-quote': true,
    typograph: true,
    'validate-internal-links': {
      src: source.length === 0 ? undefined : source,
      project: project.length === 0 ? undefined : project,
      includesMap: project.length === 0 ? undefined : includesMap
    },
    'frontmatter-tags-exist': false
  }

  const configSlim = {
    MD001: true,
    MD004: false,
    MD005: false,
    MD007: false,
    MD009: false,
    MD010: false,
    MD012: false,
    MD013: false,
    MD014: false,
    MD018: false,
    MD019: false,
    MD022: false,
    MD024: false,
    MD025: true,
    MD026: false,
    MD027: false,
    MD028: false,
    MD029: false,
    MD030: false,
    MD031: false,
    MD032: false,
    MD033: false,
    MD034: false,
    MD036: false,
    MD037: false,
    MD038: false,
    MD040: false,
    MD041: true,
    MD045: false,
    MD046: false,
    MD047: false,
    MD048: false,
    MD049: false,
    MD050: false,
    MD051: false,
    MD052: true,
    MD053: false,
    'indented-fence': true,
    'non-literal-fence-label': true,
    'fenced-code-in-quote': true,
    typograph: false,
    'validate-internal-links': {
      src: source.length === 0 ? undefined : source,
      project: project.length === 0 ? undefined : project,
      includesMap: project.length === 0 ? undefined : includesMap
    },
    'frontmatter-tags-exist': false
  }

  const configTypograph = {
    MD001: false,
    MD003: false,
    MD004: false,
    MD005: false,
    MD007: false,
    MD009: false,
    MD010: false,
    MD011: false,
    MD012: false,
    MD013: false,
    MD014: false,
    MD018: false,
    MD019: false,
    MD020: false,
    MD021: false,
    MD022: false,
    MD023: false,
    MD024: false,
    MD025: false,
    MD026: false,
    MD027: false,
    MD028: false,
    MD029: false,
    MD030: false,
    MD031: false,
    MD032: false,
    MD033: false,
    MD034: false,
    MD035: false,
    MD036: false,
    MD037: false,
    MD038: false,
    MD040: false,
    MD041: false,
    MD042: false,
    MD043: false,
    MD044: false,
    MD045: false,
    MD046: false,
    MD047: false,
    MD048: false,
    MD049: false,
    MD050: false,
    MD051: false,
    MD052: false,
    MD053: false,
    'indented-fence': false,
    'non-literal-fence-label': false,
    'fenced-code-in-quote': false,
    typograph: true,
    'validate-internal-links': false,
    'frontmatter-tags-exist': false
  }

  let config
  if (mode === 'slim') {
    config = configSlim
  } else if (mode === 'default') {
    return null
  } else if (mode === 'typograph') {
    config = configTypograph
  } else {
    config = configFull
  }
  const obj = {
    customRules,
    config
  }
  const json = JSON.stringify(obj, null, 4)
  fs.writeFileSync(path.resolve(cwd, '.markdownlint-cli2.jsonc'), json, 'utf8')
  console.log(`${mode} markdownlint config created succesfully!`)
}

program
  .name('create-markdownlint-config')
  .description('script for generating .markdownlint-cli2.jsonc in foliant-project root')
  .version('0.0.1')
  .option('-m, --mode <mode>', 'full, slim, typograph or default config', 'full')
  .option('-s, --source <source>', 'relative path to source directory', '')
  .option('-p, --project <project>', 'project name', '')
  .option('--includes-map <includes-map>', 'includes map path', '')

program.parse()

const options = program.opts()
createConfig(options.mode, options.source, options.project, options.includesMap)
