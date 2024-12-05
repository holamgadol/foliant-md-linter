#!/usr/bin/env node

// Third-party modules
const {
  Command,
  Option
} = require('commander')
const { exec, spawn, execSync } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')
const fs = require('fs')
const { unlink } = require('fs')

// Import utils.js
const {
  parseChapters,
  updateListOfFiles,
  existIncludes
} = require('./utils.js')

// The subprocess
const program = new Command()
const cwd = process.cwd().toString()
const isWin = process.platform === 'win32'
const shell = (isWin === true) ? 'cmd.exe' : '/bin/bash'

// The log paths
const markdownLintLog = '.markdownlint.log'
const markdownLinkCheckLog = '.markdownlinkcheck.log'
const genIncludesMapLog = '.gen_includes_map.log'

// Default paths
const defaultConfig = path.resolve(cwd, '.markdownlint-cli2')
const defaultSrc = 'src'
const defaultFoliantConfig = path.resolve(cwd, 'foliant.yml')
const defaultIncludesMap = './includes_map.json'
const usedFoliantConfig = path.resolve(cwd, 'only_includes_map.yml')

// Options
const verboseOption = new Option('-v, --verbose',
  'print full linting results')
  .default(false)
const sourceOption = new Option('-s, --source <path-to-sources>',
  'source directory')
  .default(defaultSrc)
const configOption = new Option('-c, --config <path-to-config>',
  'path to custom config')
  .default('')
const projectOption = new Option('-p, --project <project-name>',
  'project name')
  .default('')
const debugOption = new Option('-d, --debug',
  'print executing command')
  .default(false)
const allowFailureOption = new Option('-a, --allow-failure',
  'allow exit with failure if errors')
  .default(false)
const clearConfigOption = new Option('-l, --clear-config',
  'remove markdownlint config after execution')
  .default(false)
const fixOption = new Option('-f, --fix',
  'fix errors with markdownlint')
  .default(false)
const markdownlintModeOption = new Option('-m, --markdownlint-mode <mode-name>',
  'set mode for markdownlint')
  .choices(['full', 'slim', 'typograph', 'mdlint-default'])
  .default('slim')
const foliantConfigOption = new Option('--foliant-config <config-path>',
  'the configuration file is a foliant from which chapters')
  .default('foliant.yml')
const nodeModulesOption = new Option('--node-modules <node-modules-path>',
  'custom path to node modules')
  .default('')
const workingDirOption = new Option('-w --working-dir <working-dir>',
  'working directory (required when using the extension for vs code)')
  .default('')
const formatOptions = new Option('--format <format>',
  'format of the config file')
  .default('jsonc').conflicts(['project', 'working-dir', 'node-modules'])

// The path to execution
let execPath = path.resolve(__dirname, '../.bin/')
let exitCode = 0

if (fs.existsSync(path.join(__dirname, '/node_modules/.bin/markdownlint-cli2'))) {
  execPath = path.join(__dirname, '/node_modules/.bin/')
}

// Utils
function printErrors (logFile) {
  let regex
  let file
  let fileTmp
  let fileLink
  if (logFile.match(markdownLintLog)) {
    regex = /^(?!Finding: |Linting: |Summary: |markdownlint-cli2| ).+/gm
  } else {
    regex = /^\s*\[✖].* Status:/gm
  }
  const linkCheckFile = /^FILE: (.*)$/
  try {
    const text = readFileSync(logFile).toString('utf-8').split(/\r?\n/)
    text.forEach((line) => {
      if (line.match(linkCheckFile)) {
        fileLink = line.match(linkCheckFile)[0]
      }
      if (line.match(regex)) {
        file = line.split(':')[0]
        if (fileTmp !== file && logFile.match(markdownLintLog)) {
          fileTmp = file
          console.log(`\n${'-'.repeat(80)}\n\nFILE: ${fileTmp}\n`)
        } else if (!logFile.match(markdownLintLog)) {
          console.log(`\n${'-'.repeat(80)}\n\n${fileLink}\n`)
        }
        console.log(`    ${line}`)
      }
    })
  } catch (err) {

  }
}

function numberFromLog (logFile, regex, counterror = true) {
  try {
    const text = readFileSync(logFile).toString('utf-8')
    let m
    let number = 0

    while ((m = regex.exec(text)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }
      m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
          number += Number(match)
        }
      })
    }
    if (counterror === true && number > 0) {
      exitCode = 1
    }
    return number
  } catch (err) {
  }
}

const printLintResults = function (verbose = false) {
  const markdownlintLogPath = path.resolve(cwd, markdownLintLog)
  const markdownFiles = /Linting: (\d+) file/g
  const files = fs.readdirSync(__dirname).filter(fn => fn.match(markdownLintLog))
  const markdownFilesCount = numberFromLog(files[0], markdownFiles, false)

  // Log numbers of files
  if (markdownFilesCount !== null && markdownFilesCount !== undefined) {
    console.log(`Checked ${markdownFilesCount} files\n`)
  }

  // Markdown Lint
  const markdownLintErrors = /Summary: (\d+) error/g
  const markdownLintErrorsCount = numberFromLog(markdownlintLogPath, markdownLintErrors)

  // Markdown Link Check
  const markdownLinkCheckErrors = /ERROR: (\d+) dead links found!/g
  const markdownlinkcheckLog = path.resolve(cwd, markdownLinkCheckLog)
  const markdownlinkCheckErrorsCount = numberFromLog(markdownlinkcheckLog, markdownLinkCheckErrors)

  // Log
  if (markdownLintErrorsCount !== null && markdownLintErrorsCount !== undefined) {
    console.log(`\nFound ${markdownLintErrorsCount} formatting errors`)
    if (verbose) {
      printErrors(markdownlintLogPath)
    }
    console.log(`Full markdownlint log see in ${markdownlintLogPath}\n`)
    if (markdownlinkCheckErrorsCount !== null && markdownlinkCheckErrorsCount !== undefined) {
      console.log(`\n${'='.repeat(80)}\n`)
    }
  }

  if (markdownlinkCheckErrorsCount !== null && markdownlinkCheckErrorsCount !== undefined) {
    console.log(`\nFound ${markdownlinkCheckErrorsCount} broken external links`)
    if (verbose) {
      printErrors(markdownlinkcheckLog)
    }
    console.log(`Full markdown-link-check log see in ${markdownlinkcheckLog}\n`)
  }
}

function writeLog (logFile) {
  return (isWin === true) ? `>> ${logFile} 2>&1` : `2>&1 | tee ${logFile}`
}

function removeFinding (logFile) {
  const regexFinding = /^(Finding: ).+/gm
  try {
    const text = readFileSync(logFile).toString('utf-8').split(/\r?\n/)
    const lines = []
    text.forEach((line) => {
      if (!line.match(regexFinding)) {
        lines.push(line)
      } else {
        console.log(line)
      }
    })
    fs.writeFileSync(logFile, lines.join('\r\n'))
  } catch (error) {
    console.log(error)
  }
}

const commandsGen = function (src = defaultSrc, configPath = '', project = '',
  markdownlintMode = 'slim', foliantConfig = defaultFoliantConfig,
  nodeModules = '', workinDir = '', isFix = false, debug = false, format = '') {
  const commands = {}
  const fix = (isFix === true) ? '-fix' : ''
  const args = []
  let filesArgMdLint = `"${src}/**/*.md"`
  let filesArgMdLinkCheck = (isWin === true) ? `${src}` : `${src}/`
  let existIncludesMap = false
  let listOfFiles = []

  if (project) {
    args.push(`-p "${project}"`)
  }

  if (debug) {
    console.log('command gen params:\n',
      `src: ${src}`,
      `configPath: ${configPath}`,
      `project: ${project}`,
      `markdownlintMode: ${markdownlintMode}`,
      `foliantConfig: ${foliantConfig}`,
      `nodeModules: ${nodeModules}`,
      `workinDir: ${workinDir}`,
      `isFix: ${isFix}`,
      `debug: ${debug}`
    )
  }

  // Working directory and node_modules
  if (nodeModules) {
    args.push(`--node-modules ${nodeModules}`)
  }
  if (workinDir) {
    args.push(`--working-dir ${workinDir}`)
  }

  // Format jsonc and cjs
  if (format) {
    args.push(`--format ${format}`)
  }

  // Get list of files and creat includes map
  if (fs.existsSync(foliantConfig)) {
    listOfFiles = parseChapters(foliantConfig, src, listOfFiles)
    existIncludesMap = existIncludes(foliantConfig)
    args.push(`--foliant-config ${foliantConfig}`)
  }

  // Create includes map
  if (existIncludesMap) {
    generateIncludesMap(foliantConfig)
    updateListOfFiles(src, defaultIncludesMap, listOfFiles)
    args.push(`--includes-map ${defaultIncludesMap}`)
  }

  if (configPath && fs.existsSync(configPath)) {
    args.push(`-c ${configPath}`)
  }

  if (debug) {
    args.push('-d')
  }

  if (listOfFiles.length > 0 && !isWin) {
    filesArgMdLint = ''
    listOfFiles.forEach((file) => {
      if (file) {
        filesArgMdLint = `${filesArgMdLint} "${file}"`
      }
    })
    filesArgMdLinkCheck = filesArgMdLint
  }

  // Create config
  commands.createMarkdownlintConfig = (markdownlintMode !== 'mdlint-default') ? `node ${path.join(__dirname, '/generate.js')} -m ${markdownlintMode} -s ${src} ${args.join(' ')}` : 'echo "using default markdownlint config"'
  if (debug) {
    console.log(commands.createMarkdownlintConfig)
  }

  // Markdownlint
  commands.markdownlint = `${commands.createMarkdownlintConfig} && ${execPath}/markdownlint-cli2${fix} ${filesArgMdLint} ${writeLog(markdownLintLog)}`

  // Markdownlintcheck
  commands.markdownlinkcheckSrcUnix = `find ${filesArgMdLinkCheck} -type f -name '*.md' -print0 | xargs -0 -n1 ${execPath}/markdown-link-check -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}`
  commands.markdownlinkcheckSrcWin = `del ${path.join(cwd, markdownLinkCheckLog)} & forfiles /P ${filesArgMdLinkCheck} /S /M *.md /C "cmd /c npx markdown-link-check @file -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}"`

  commands.markdownlinkcheck = (isWin === true) ? commands.markdownlinkcheckSrcWin : commands.markdownlinkcheckSrcUnix

  // Merge comands markdownlint and markdownlinkcheck
  commands.lintSrcFull = `${commands.markdownlint} & ${commands.markdownlinkcheck}`

  return {
    commands
  }
}

function generateIncludesMap (foliantConfig) {
  createConfigIncludesMap(foliantConfig)
  const genIncludesMapCommand = `foliant make --config ${usedFoliantConfig} pre --logs .temp_project_logs ${writeLog(genIncludesMapLog)} && rm -rf temp_project.pre/ && rm -rf .temp_project_logs/`

  execSync(genIncludesMapCommand, { shell: shell }, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

function clearConfigFile (clearConfig, format) {
  if (clearConfig === true) {
    console.log(`removing ${defaultConfig}.${format} ...`)
    unlink(`${defaultConfig}.${format}`, (err) => {
      if (err && err.syscall === 'unlink') {
        console.log(`${defaultConfig}.${format} is absent`)
      }
    })
  }
}

function checkExitCode (allowfailure) {
  if ((allowfailure === false) && (exitCode > 0)) {
    process.exit(1)
  }
}

function afterLint (verbose = false, clearConfig = false, allowFailure = false, debug = false, format = '') {
  if (format === 'cjs') {
    removeFinding(path.resolve(cwd, markdownLintLog))
  }
  printLintResults(verbose)
  clearConfigFile(clearConfig, format)
  if (!debug) {
    rmIncludesMap(clearConfig)
  }
  checkExitCode(allowFailure)
}

function execute (command, verbose = false, debug = false, allowFailure = false, clearConfig = false, format = '') {
  if (debug) {
    console.log('executed command: ')
    console.log(command)
    console.log(
      'command execute params:\n',
      `verbose: ${verbose}`,
      `debug: ${debug}`,
      `allowFailure: ${allowFailure}`,
      `clearConfig: ${clearConfig}`,
      `format: ${format}`
    )
  }
  if (verbose === false) {
    exec(command, { shell: shell }, (err, stdout, stderror) => {
      if (err || stderror || stdout) {
        afterLint(verbose, clearConfig, allowFailure, debug, format)
      } else {
        console.log('Command completed with no errors!')
      }
    })
  } else {
    const spawnCommand = spawn(command, { shell: shell })

    spawnCommand.stdout.on('data', (data) => {
      console.log(`${data}`)
    })

    spawnCommand.stderr.on('data', (data) => {
      console.error(`${data}`)
    })

    spawnCommand.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
      console.log(`\n${'='.repeat(80)}\n\n${' '.repeat(37)}RESULTS\n\n${'='.repeat(80)}\n`)
      afterLint(verbose, clearConfig, allowFailure, debug, format)
    })
  }
}

function createConfigIncludesMap (foliantConfig) {
  /* eslint-disable no-useless-escape */
  const onlyIncludesMapConf = `title: !include ${foliantConfig}#title
chapters: !include ${foliantConfig}#chapters
preprocessors:
  - includes:
      includes_map:
        - anchors
  - runcommands:
      commands:
        - cp $\{WORKING_DIR\}/static/includes_map.json ./
      targets:
        - pre
backend_config:
  pre:
    slug: temp_project
`
  /* eslint-enable no-useless-escape */
  fs.writeFileSync(usedFoliantConfig, onlyIncludesMapConf, (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(`The foliant configuration file ${usedFoliantConfig} for creating the includes map has been successfully generated`)
  })
}

function rmIncludesMap (clearConfig = false) {
  if (fs.existsSync(usedFoliantConfig)) {
    fs.rmSync(usedFoliantConfig, { force: true })
  }
  if (clearConfig && fs.existsSync(defaultIncludesMap)) {
    fs.rmSync(defaultIncludesMap, { force: true })
  }
  if (fs.existsSync(genIncludesMapLog)) {
    fs.rmSync(genIncludesMapLog, { force: true })
  }
}

// Variants of program execution
program
  .name('foliant-md-linter')
  .description('CLI tool for linting Foliant markdown sources')
  .version('0.1.10')

program.command('full-check')
  .description('check md files with markdownlint and markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowFailureOption)
  .addOption(clearConfigOption)
  .addOption(fixOption)
  .addOption(markdownlintModeOption)
  .addOption(foliantConfigOption)
  .addOption(nodeModulesOption)
  .addOption(workingDirOption)
  .addOption(formatOptions)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project,
      options.markdownlintmode, options.foliantConfig, options.nodeModules,
      options.workingDir, options.fix, options.debug, options.format).commands.lintSrcFull,
    options.verbose, options.debug, options.allowFailure, options.clearConfig, options.format)
  })

program.command('markdown')
  .description('check md files for errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowFailureOption)
  .addOption(clearConfigOption)
  .addOption(fixOption)
  .addOption(markdownlintModeOption)
  .addOption(foliantConfigOption)
  .addOption(nodeModulesOption)
  .addOption(workingDirOption)
  .addOption(formatOptions)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project,
      options.markdownlintMode, options.foliantConfig, options.nodeModules,
      options.workingDir, options.fix, options.debug, options.format).commands.markdownlint,
    options.verbose, options.debug, options.allowFailure, options.clearConfig, options.format)
  })

program.command('urls')
  .description('validate external links with markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(debugOption)
  .addOption(allowFailureOption)
  .addOption(clearConfigOption)
  .addOption(workingDirOption)
  .addOption(formatOptions)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.nodeModules,
      options.workingDir, options.debug, options.format).commands.markdownlinkcheck,
    options.verbose, options.debug, options.allowFailure, options.clearConfig, options.format)
  })

program.command('print')
  .description('print linting results')
  .addOption(verboseOption)
  .action((options) => {
    printLintResults(options.verbose)
  })

program.command('create-config')
  .description('create markdownlint config')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(projectOption)
  .addOption(markdownlintModeOption)
  .addOption(debugOption)
  .addOption(foliantConfigOption)
  .addOption(nodeModulesOption)
  .addOption(workingDirOption)
  .addOption(formatOptions)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project,
      options.markdownlintMode, options.foliantConfig, options.nodeModules,
      options.workingDir, options.fix, options.debug, options.format).commands.createMarkdownlintConfig,
    options.verbose, options.debug)
  })

program.parse()
