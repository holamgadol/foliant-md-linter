#!/usr/bin/env node

// Third-party modules
const { Command } = require('commander')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

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
  debug = false, format = '') {
  let existIncludesMap = false
  let listOfFiles = []

  // Set validate-internal-links config
  const validateIntLinksConf = {}
  validateIntLinksConf.src = source || undefined
  validateIntLinksConf.project = project || undefined
  validateIntLinksConf.includesMap = includesMap || './includes_map.json'
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
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('Invalid JSON format')
      } else {
        console.error(error)
      }
      mode = 'slim'
      config = configSlim
    }
  }

  if (debug) {
    console.log(config)
  }

  const json = { customRules, config }
  let configExist = false
  if (format === 'cjs') {
    const content = []
    json.globs = listOfFiles
    content.push('// @ts-check\n\n"use strict";\n\n')
    if (json.config.validateIntLinksConf) {
      content.push("const path = require('path')")
      content.push("const repoName = require('git-repo-name')")
    }

    content.push(`const json = ${JSON.stringify(json, null, 4)}`)

    if (json.config.validateIntLinksConf) {
      content.push('json.config[\'validate-internal-links\'].project = repoName.sync({cwd: __dirname})')
      content.push('json.config[\'validate-internal-links\'].workingDir = __dirname')
    }
    if (includesMap) {
      const includesMapPath = path.relative('./', includesMap)
      content.push(`json.config['validate-internal-links'].includesMap = "./${includesMapPath}"`)
    }

    content.push('\n\nmodule.exports = json')

    try {
      fs.writeFileSync(path.resolve(cwd, '.markdownlint-cli2.cjs'), content.join('\n'), { mode: 0o777 })
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
    console.log(`${mode} markdownlint config '.markdownlint-cli2.cjs' created successfully!`)

    // disabling globs used by the markdownlint extension
    configExist = initVSCodeSettings([])

    const existPackageJSON = fs.existsSync('package.json')
    if (existPackageJSON) {
      const data = JSON.parse(fs.readFileSync('package.json'))
      data.dependencies['git-repo-name'] = '^1.0.1'
      data.dependencies['markdownlint-rules-foliant'] = 'latest'
      fs.writeFileSync('package.json', JSON.stringify(data, null, 2))
    } else {
      // write package.json
      const packageJSONforCJS = {
        dependencies: {
          'markdownlint-rules-foliant': 'latest',
          'git-repo-name': '^1.0.1'
        }
      }
      fs.writeFileSync(path.resolve(cwd, 'package.json'), JSON.stringify(packageJSONforCJS, null, 2), { mode: 0o777 })
    }

    // install dependencies
    childProcess.execSync('npm i .', { stdio: [0, 1, 2] })

    if (!existPackageJSON) {
      // remove package.json
      fs.rmSync(path.resolve(cwd, 'package.json'))
      fs.rmSync(path.resolve(cwd, 'package-lock.json'))
    }

    if (configExist) {
      console.log(`${vscodeSettings} config updated successfully!`)
    } else {
      console.log(`${vscodeSettings} config created successfully!`)
    }
  } else {
    const content = JSON.stringify({ customRules, config }, null, 4)

    try {
      fs.writeFileSync(path.resolve(cwd, '.markdownlint-cli2.jsonc'), content, { mode: 0o777 })
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
    console.log(`${mode} markdownlint config '.markdownlint-cli2.jsonc' created successfully!`)
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
  } else {
    fs.mkdirSync(path.dirname(vscodeSettings), { recursive: true })
  }

  try {
    fs.writeFileSync(vscodeSettings, JSON.stringify(data))
  } catch (error) {
    console.log(error)
    process.exit(1)
  }

  return configExist
}

program
  .name('create-markdownlint-config')
  .description('script for generating markdownlint-cli2 config in foliant-project root')
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
  .option('--format <format>',
    'config for markdownlint-cli2 (default"jsonc") or "cjs" format with automatic parameter detection',
    'jsonc')
  .option('-d, --debug', 'output of debugging information', false)

program.parse()

const options = program.opts()
createConfig(options.mode, options.source, options.project, options.configPath,
  options.includesMap, options.nodeModules, options.workingDir,
  options.foliantConfig, options.debug, options.format)
