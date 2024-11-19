#!/usr/bin/env node

// Third-party modules
const { Command } = require('commander')
const path = require('path')
const fs = require('fs')
const program = new Command()
const cwd = process.cwd().toString()
const vscodeSettings = '.vscode/settings.json'

// Import utils.js
const {
  parseChapters,
  updateListOfFiles,
  existIncludes
} = require('./utils.js')

function createConfig (mode = 'full', source = '', project = '', configPath = '',
  includesMap = '', nodeModulePath = '', workingDir = '', foliantConfig = '',
  vscode = false, debug = false) {
  let existIncludesMap = false
  let listOfFiles = []
  // Set validate-internal-links config
  const validateIntLinksConf = {}
  validateIntLinksConf.src = source || undefined
  validateIntLinksConf.project = project || undefined
  validateIntLinksConf.includesMap = includesMap || undefined
  validateIntLinksConf.workingDir = workingDir || undefined

  let customRules = [
    './node_modules/markdownlint-rules-foliant/lib/indented-fence',
    './node_modules/markdownlint-rules-foliant/lib/non-literal-fence-label',
    './node_modules/markdownlint-rules-foliant/lib/fenced-code-in-quote',
    './node_modules/markdownlint-rules-foliant/lib/typograph',
    './node_modules/markdownlint-rules-foliant/lib/validate-internal-links',
    './node_modules/markdownlint-rules-foliant/lib/frontmatter-tags-exist'
  ]

  if (nodeModulePath.length !== 0) {
    customRules = [
      path.join(nodeModulePath, '/node_modules/markdownlint-rules-foliant/lib/indented-fence'),
      path.join(nodeModulePath, '/node_modules/markdownlint-rules-foliant/lib/non-literal-fence-label'),
      path.join(nodeModulePath, '/node_modules/markdownlint-rules-foliant/lib/fenced-code-in-quote'),
      path.join(nodeModulePath, '/node_modules/markdownlint-rules-foliant/lib/typograph'),
      path.join(nodeModulePath, '/node_modules/markdownlint-rules-foliant/lib/validate-internal-links'),
      path.join(nodeModulePath, '/node_modules/markdownlint-rules-foliant/lib/frontmatter-tags-exist')
    ]
  }

  if (fs.existsSync(foliantConfig)) {
    listOfFiles = parseChapters(foliantConfig, source, listOfFiles)
    existIncludesMap = existIncludes(foliantConfig)
    if (existIncludesMap) {
      updateListOfFiles(source, includesMap, listOfFiles)
    }
  }
  console.log(listOfFiles)
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
    MD039: false,
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
    'validate-internal-links': validateIntLinksConf,
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
    MD039: false,
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
    'validate-internal-links': validateIntLinksConf,
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
    MD039: false,
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
  if (configPath !== '') {
    mode = 'custom'
    console.log(`using configuration from a file: ${configPath}`)
    try {
      const customConfig = JSON.parse(fs.readFileSync(path.resolve(cwd, configPath), 'utf-8'))
      config = Object.assign({}, config, customConfig)
    } catch (err) {
      if (err instanceof SyntaxError) {
        console.error('Invalid JSON format')
      } else {
        console.error(err)
      }
      mode = 'slim'
      config = configSlim
    }
  }

  if (debug) {
    console.log(config)
  }

  const json = JSON.stringify({ customRules, config }, null, 4)
  fs.writeFileSync(path.resolve(cwd, '.markdownlint-cli2.jsonc'), json, { mode: 0o777 })
  console.log(`${mode} markdownlint config created successfully!`)

  if (listOfFiles && vscode) {
    const configExist = initVSCodeSettings(listOfFiles)
    if (configExist) {
      console.log(`${vscodeSettings} config updated successfully!`)
    } else {
      console.log(`${vscodeSettings} config created successfully!`)
    }
  }
}

function initVSCodeSettings (listOfFiles = []) {
  const configExist = fs.existsSync(vscodeSettings)
  let data = {
    'markdownlint.lintWorkspaceGlobs': listOfFiles
  }

  if (configExist) {
    const originalData = JSON.parse(fs.readFileSync(vscodeSettings))
    data = Object.assign({}, originalData, data)
    console.log(data)
  } else {
    fs.mkdirSync(path.dirname(vscodeSettings), { recursive: true })
  }
  fs.writeFileSync(vscodeSettings, JSON.stringify(data))
  return configExist
}

program
  .name('create-markdownlint-config')
  .description('script for generating .markdownlint-cli2.jsonc in foliant-project root')
  .version('0.0.1')
  .option('-m, --mode <mode>', 'full, slim, typograph or default config', 'slim')
  .option('-s, --source <source>', 'relative path to source directory', '')
  .option('-p, --project <project>', 'project name', '')
  .option('-c, --config-path <path-to-config>', 'path to custom config', '')
  .option('--includes-map <includes-map>', 'includes map path', '')
  .option('--node-modules <node-modules-path>', 'custom path to node modules', '')
  .option('-w, --working-dir <working-dir>', 'working dir', '')
  .option('--foliant-config <config-path>',
    'the configuration file is a foliant from which chapters', 'foliant.yml')
  .option('--vs-code',
    'generate settings.json for vs code', false)
  .option('-d, --debug', 'output of debugging information', false)

program.parse()

const options = program.opts()
createConfig(options.mode, options.source, options.project, options.configPath,
  options.includesMap, options.nodeModules, options.workingDir, options.foliantConfig, options.vsCode, options.debug)
