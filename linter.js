#!/usr/bin/env node

// Third-party modules
const {
  Command,
  Option
} = require('commander')
const { spawn, spawnSync } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')
const fs = require('fs')
const { unlink } = require('fs')
const Spinner = require('cli-spinner').Spinner
const clc = require('cli-color')
const os = require('os')

// Import utils.js
const {
  parseChapters,
  updateListOfFiles,
  existIncludes,
  parseAnchorsFromDir,
  trimEmptyLines
} = require('./utils.js')

// The subprocess
const program = new Command()
const cwd = process.cwd().toString()
const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const shell = (isWin === true) ? 'cmd.exe' : '/bin/bash'
let logicalProcessorCount = 1
if (os.cpus().length > 2) {
  logicalProcessorCount = os.cpus().length - 2
}

// Spinner

const spinnerDelay = 200
const spinnerString = ' |/-\\'

const spinnerPrepare = new Spinner('prepare includes map...%s')
spinnerPrepare.setSpinnerString(spinnerString)
spinnerPrepare.setSpinnerDelay(spinnerDelay)

const spinnerLint = new Spinner('checking...%s')
spinnerLint.setSpinnerString(spinnerString)
spinnerLint.setSpinnerDelay(spinnerDelay)

// The log paths
const markdownLintLog = '.markdownlint.log'
const markdownLinkCheckLog = '.markdownlinkcheck.log'
const genIncludesMapLog = '.gen_includes_map.log'

// Default paths
const defaultConfig = path.resolve(cwd, '.markdownlint-cli2')
const defaultSrc = 'src'
const defaultFoliantConfig = path.resolve(cwd, 'foliant.yml')
const defaultIncludesMap = './includes_map.json'
const defaultAnchorsMap = './anchors_map.json'
const usedFoliantConfig = path.resolve(cwd, 'only_includes.yml')

// Regex
const regexFinding = /^(Finding: ).+/gm

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
const extendPreprocessorsOption = new Option('--ext-prep <file-path>',
  'an extended list of preprocessors that runs before building the includes map')
  .default('')

// The path to execution
let execPath = path.resolve(__dirname, '../.bin/')
let exitCode = 0

if (fs.existsSync(path.join(__dirname, '/node_modules/.bin/markdownlint-cli2'))) {
  execPath = path.join(__dirname, '/node_modules/.bin/')
}

// Utils
function printErrorsFile (logFile) {
  try {
    const data = readFileSync(logFile)
    const markdownlintMode = logFile.match(markdownLintLog)
    printErrors(data, markdownlintMode)
  } catch (err) {
    console.error(err)
  }
}

function printErrors (data, mode) {
  const linkCheckFile = /^FILE: (.*)$/
  let regex
  let file
  let fileTmp
  let fileLink
  if (mode) {
    regex = /^(?!Finding: |Linting: |Summary: |markdownlint-cli2| ).+/gm
  } else {
    regex = /^\s*\[✖].* Status:/gm
  }

  try {
    const lines = data.toString('utf-8').split(/\r?\n/)
    lines.forEach((line) => {
      if (line.match(linkCheckFile)) {
        fileLink = line.match(linkCheckFile)[0]
      }
      if (line.match(regex)) {
        file = line.split(':')[0]
        if (fileTmp !== file && mode) {
          fileTmp = file
          console.log(`\n${'-'.repeat(80)}\n\nFILE: ${fileTmp}\n`)
        } else if (!mode) {
          console.log(`\n${'-'.repeat(80)}\n\n${fileLink}\n`)
        }
        console.log(`    ${line}`)
      }
    })
  } catch (err) {
    console.error(err)
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
  const markdownlintLogRelPath = path.relative(cwd, markdownlintLogPath)
  const markdownFiles = /Linting: (\d+) file/g
  const files = fs.readdirSync(__dirname).filter(fn => fn.match(markdownLintLog))
  const markdownFilesCount = numberFromLog(files[0], markdownFiles, false)

  // Log numbers of files
  if (markdownFilesCount !== null && markdownFilesCount !== undefined) {
    // Header
    if (verbose) {
      console.log(`\n${'='.repeat(80)}\n${' '.repeat(37)}RESULTS\n${'='.repeat(80)}\n`)
    } else {
      console.log('\nResults:')
    }

    console.log(`Checked ${markdownFilesCount} files\n`)
  }

  // Markdown Lint
  const markdownLintErrors = /Summary: (\d+) error/g
  const markdownLintErrorsCount = numberFromLog(markdownlintLogPath, markdownLintErrors)

  // Markdown Link Check
  const markdownLinkCheckErrors = /ERROR: (\d+) dead links found!/g
  const markdownlinkcheckLogPath = path.resolve(cwd, markdownLinkCheckLog)
  const markdownlinkcheckLogRelPath = path.relative(cwd, markdownlinkcheckLogPath)
  const markdownlinkCheckErrorsCount = numberFromLog(markdownlinkcheckLogPath, markdownLinkCheckErrors)

  // Log markdownlint
  if (markdownLintErrorsCount !== null && markdownLintErrorsCount !== undefined) {
    console.log(`\nFound ${markdownLintErrorsCount} formatting errors`)
    if (verbose) {
      printErrorsFile(markdownlintLogPath)
    }
    console.log(`Full markdownlint log see in ${markdownlintLogRelPath}\n`)
    if (markdownlinkCheckErrorsCount !== null && markdownlinkCheckErrorsCount !== undefined) {
      if (verbose) {
        console.log(`\n${'='.repeat(80)}\n`)
      }
    }
  }

  // Log markdownlinkcheck
  if (markdownlinkCheckErrorsCount !== null && markdownlinkCheckErrorsCount !== undefined) {
    console.log(`Found ${markdownlinkCheckErrorsCount} broken external links`)
    if (verbose) {
      printErrorsFile(markdownlinkcheckLogPath)
    }
    console.log(`Full markdown-link-check log see in ${markdownlinkcheckLogRelPath}\n`)
  }
}

function writeLog (logFile) {
  return (isWin === true) ? `>> ${logFile} 2>&1` : `2>&1 | tee ${logFile}`
}

function removeFinding (logFile) {
  if (fs.existsSync(logFile)) {
    try {
      const text = readFileSync(logFile).toString('utf-8').split(/\r?\n/)
      const lines = []
      text.forEach((line) => {
        if (!line.match(regexFinding)) {
          lines.push(line)
        }
      })
      fs.writeFileSync(logFile, lines.join('\r\n'))
    } catch (error) {
      console.error(error)
    }
  }
}

const commandsGen = function (src = defaultSrc, configPath = '', project = '',
  markdownlintMode = 'slim', foliantConfig = defaultFoliantConfig,
  nodeModules = '', workinDir = '', isFix = false, debug = false, format = '', extendPrep = '') {
  const commands = {}
  const fix = (isFix === true) ? '-fix' : ''
  const args = []
  let filesArgMdLint = `"${src}/**/*.md"`
  let filesArgMdLinkCheck = (isWin === true) ? `${src}` : `${src}/`
  let existIncludesMap = false
  let listOfFiles = []
  let multiStream = `-P${logicalProcessorCount}`

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
      `extendPrep: ${extendPrep}`,
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
  if (fs.existsSync(foliantConfig) && format === 'cjs') {
    listOfFiles = parseChapters(foliantConfig, src, listOfFiles)
    existIncludesMap = existIncludes(foliantConfig)
    if (debug) {
      console.log('need to generate an includes map', existIncludesMap)
    }
    args.push(`--foliant-config ${foliantConfig}`)
  }

  // Create includes map
  if (format === 'cjs') {
    generateIncludesMap(foliantConfig, extendPrep, listOfFiles, debug)
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
  if (isMac) {
    multiStream = `${multiStream} -S1024`
  }
  commands.markdownlinkcheckSrcUnix = `find ${filesArgMdLinkCheck} -type f -name '*.md' -print0 | xargs -0 ${multiStream} -I{} bash -c 'tempfile=$(mktemp); ${execPath}/markdown-link-check -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} {} > "$tempfile" 2>&1; cat "$tempfile"; rm "$tempfile"' | tee ${path.join(cwd, markdownLinkCheckLog)}`

  commands.markdownlinkcheckSrcWin = `del ${path.join(cwd, markdownLinkCheckLog)} & forfiles /P ${filesArgMdLinkCheck} /S /M *.md /C "cmd /c npx markdown-link-check @file -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}"`

  commands.markdownlinkcheck = (isWin === true) ? commands.markdownlinkcheckSrcWin : commands.markdownlinkcheckSrcUnix

  // Merge comands markdownlint and markdownlinkcheck
  commands.lintSrcFull = `${commands.markdownlint} && ${commands.markdownlinkcheck}`

  return {
    commands
  }
}

function generateIncludesMap (foliantConfig, extendPrep, listOfFiles, debug) {
  createConfigIncludesMap(foliantConfig, extendPrep, debug)
  const genIncludesMapCommand = `foliant make --config ${usedFoliantConfig} pre --logs .temp_project_logs ${writeLog(genIncludesMapLog)}`
  const cleanCommand = 'rm -rf temp_project.pre/ && rm -rf .temp_project_logs/'

  spinnerPrepare.start()
  const generateProcess = spawnSync(genIncludesMapCommand, { shell: shell })
  if (generateProcess.error) {
    console.error('Error generate temporary project:', generateProcess.error)
  } else {
    if (debug) {
      console.log(`Subprocess "Foliant" exited with code ${generateProcess.status}`)
    }

    const anchors = parseAnchorsFromDir('./temp_project.pre/', listOfFiles)
    fs.writeFileSync(defaultAnchorsMap, JSON.stringify(anchors, null, 4))

    const removeProcess = spawnSync(cleanCommand, { shell: shell })
    if (removeProcess.error) {
      console.error('Error remove temporary project:', removeProcess.error)
    } else {
      if (debug) {
        console.log(`Subprocess "rm -rf" exited with code ${removeProcess.status}`)
      }
    }
  }

  spinnerPrepare.stop(true)
}

function clearConfigFile (clearConfig, format) {
  if (clearConfig === true) {
    console.log(`removing ${defaultConfig}.${format} ...`)
    unlink(`${defaultConfig}.${format}`, (err) => {
      if (err && err.syscall === 'unlink') {
        console.error(`${defaultConfig}.${format} is absent`)
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
      `format: ${format}`,
      `program: ${program.args[0]}`
    )
  }

  const spawnCommand = spawn(command, { shell: shell })
  const regexBad = /\[✖\] /gm
  const regexFile = /FILE:/gm
  const regexError = /ERROR:/gm
  const regexText = /^(Finding: |Linting: |Summary: |markdownlint-cli2)/gm
  const regexFormatError = /^.+:\d+/gm

  let start = false
  let linkcheck = false
  let filename = ''
  let markdownlintResults = []
  let counterError = 0
  let markdownlintSuccessful = true
  let LinkcheckSuccessful = true

  function printLinkcheckReport (result) {
    const l = []
    if (result.match(regexBad)) {
      const arr = result.replace(/^\s+|\s+$/g, '').split('\n')
      let ver = false
      for (const i in arr) {
        const str = arr[i]
        if (str.match(regexError)) {
          ver = true
        }
        if (str.match(regexFile)) {
          filename = str
        }
        if (ver && str.match(regexBad)) {
          if (filename) {
            counterError += 1
            l.push(`${clc.red('✖')} ${counterError}. ${filename.replace(/^\s+|\s+$/g, '').substring(6)}`)
            LinkcheckSuccessful = false
          }
          l.push(`    ${str.replace(/^\s+|\s+$/g, '').substring(4)}`)
        }
      }
    }
    if (l.length > 0) {
      spinnerLint.stop(true)
      console.log(l.join('\n'))
      spinnerLint.start()
    }
  }

  function printMarkdownReport (markdownlintResults, counterError) {
    const arr = markdownlintResults.join('').split('\n')
    for (const i in arr) {
      const str = arr[i].replace(/^\s+|\s+$/g, '')
      if (str.length > 0 && str.match(regexFormatError)) {
        const strSplit = str.split(' ')
        counterError += 1
        console.log(`${clc.red('✖')} ${counterError}. ${strSplit[0]}\n    ${strSplit.slice(1).join(' ')}`)
        markdownlintSuccessful = false
      }
    }
    return counterError
  }

  if (program.args[0] === 'urls') {
    console.log('Checking external links:')
  }
  spinnerLint.start()

  spawnCommand.stdout.on('data', (data) => {
    const s = data.toString()
    if (s.length > 0) {
      if (verbose) {
        spinnerLint.stop(true)
        console.log(s)
      } else {
        if (s.match(regexFinding)) {
          if (!start) {
            spinnerLint.stop(true)
            console.log('Checking markdownlint:')
            spinnerLint.start()
          }
          start = true
        }
        if (program.args[0] === 'urls') {
          start = true
          linkcheck = true
        }
        if (start) {
          if (!s.match(regexText)) {
            if (s.match(regexFile)) {
              if (!linkcheck) {
                spinnerLint.stop(true)
                if (markdownlintResults.length > 0) {
                  counterError = printMarkdownReport(markdownlintResults, counterError)
                  markdownlintResults = []
                }
                if (markdownlintSuccessful && markdownlintResults.length === 0) {
                  console.log(`${clc.green('✅')} The markdownlint check was successful!`)
                }
                console.log('\nChecking external links:')
                spinnerLint.start()
              }
              linkcheck = true
            }
            if (linkcheck) {
              if (s.match(regexFile) && s.match(regexError)) {
                printLinkcheckReport(`${s}\n`)
              }
            } else {
              spinnerLint.stop(true)
              markdownlintResults.push(s)
              if (markdownlintResults.length > 20) {
                counterError = printMarkdownReport(markdownlintResults, counterError)
                markdownlintResults = []
              }
              spinnerLint.start()
            }
          }
        }
      }
    }
  })

  spawnCommand.stderr.on('data', (data) => {
    spinnerLint.stop(true)
    console.error(`${data}`)
  })

  spawnCommand.on('close', (code) => {
    if (markdownlintResults.length > 0) {
      if (program.args[0] === 'markdown') {
        spinnerLint.stop(true)
      }
      counterError = printMarkdownReport(markdownlintResults, counterError)
      markdownlintResults = []
    }
    spinnerLint.stop(true)
    if (markdownlintSuccessful && markdownlintResults.length === 0 && program.args[0] === 'markdown') {
      console.log(`${clc.green('✅')} The markdownlint check was successful!`)
    }
    if (LinkcheckSuccessful && code === 0 && (program.args[0] === 'full-check' || program.args[0] === 'urls')) {
      console.log(`${clc.green('✅')} The external links check was successful!`)
    }

    if (verbose) {
      console.log(`Subprocess "Linter" exited with code ${code}`)
    }

    afterLint(verbose, clearConfig, allowFailure, debug, format)
  })
}

function createConfigIncludesMap (foliantConfig, extendPrep, debug) {
  /* eslint-disable no-useless-escape */
  const content = fs.readFileSync(foliantConfig)
  const onlyIncludesMapConf = []
  let extendPreprocessors = ''

  onlyIncludesMapConf.push(`title: !include ${foliantConfig}#title
chapters: !include ${foliantConfig}#chapters
tmp_dir: __tempproj__
src_dir: src`)
  if (content.includes('escape_code:')) {
    onlyIncludesMapConf.push(`escape_code: !include ${foliantConfig}#escape_code`)
  }
  if (fs.existsSync(extendPrep)) {
    extendPreprocessors = fs.readFileSync(extendPrep)
    extendPreprocessors = trimEmptyLines(extendPreprocessors)
  }
  onlyIncludesMapConf.push(`preprocessors:\n${extendPreprocessors}
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
    slug: temp_project`)
  /* eslint-enable no-useless-escape */
  try {
    fs.writeFileSync(usedFoliantConfig, onlyIncludesMapConf.join('\n'))
    if (debug) {
      console.log(`The foliant configuration file ${usedFoliantConfig} for creating the includes map has been successfully generated\n`)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
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

function createSourceMaps (
  src = defaultSrc,
  foliantConfig = defaultFoliantConfig,
  debug = false, extendPrep = '') {
  let listOfFiles = []

  if (debug) {
    console.log('create source maps params:\n',
      `src: ${src}`,
      `foliantConfig: ${foliantConfig}`,
      `extendPrep: ${extendPrep}`,
      `debug: ${debug}`
    )
  }

  if (fs.existsSync(foliantConfig)) {
    listOfFiles = parseChapters(foliantConfig, src, listOfFiles)
  } else {
    console.log(`${foliantConfig} does not exist`)
    return
  }
  generateIncludesMap(
    foliantConfig, extendPrep,
    listOfFiles, debug
  )
  updateListOfFiles(
    src, defaultIncludesMap, listOfFiles
  )
  if (fs.existsSync(defaultIncludesMap)) {
    console.log(`Includes map: ${defaultIncludesMap}`)
  }
  if (fs.existsSync(defaultAnchorsMap)) {
    console.log(`Anchors map: ${defaultAnchorsMap} `)
  }
}

// Variants of program execution
function setupCommand (name, description, commandKey, optionsGroup = 'all') {
  const cmd = program.command(name).description(description)

  const options = {
    all: [verboseOption, sourceOption, configOption, projectOption, debugOption,
      allowFailureOption, clearConfigOption, fixOption, markdownlintModeOption,
      foliantConfigOption, nodeModulesOption, workingDirOption, formatOptions,
      extendPreprocessorsOption],
    basic: [verboseOption, sourceOption, debugOption, allowFailureOption,
      clearConfigOption, workingDirOption, formatOptions, extendPreprocessorsOption],
    minimal: [verboseOption],
    maps: [verboseOption, sourceOption, debugOption,
      foliantConfigOption, extendPreprocessorsOption]
  }[optionsGroup]

  options.forEach(opt => cmd.addOption(opt))

  cmd.action((options) => {
    if (commandKey === 'printLintResults') {
      printLintResults(options.verbose)
    } else if (commandKey === 'creatSourceMaps') {
      createSourceMaps(
        options.source, options.foliantConfig,
        options.debug, options.extPrep
      )
    } else {
      const command = commandsGen(
        options.source, options.config, options.project,
        options.markdownlintMode, options.foliantConfig, options.nodeModules,
        options.workingDir, options.fix, options.debug, options.format, options.extPrep
      ).commands[commandKey]

      execute(
        command,
        options.verbose, options.debug, options.allowFailure,
        options.clearConfig, options.format
      )
    }
  })
}

setupCommand('full-check', 'check md files with markdownlint and markdown-link-check', 'lintSrcFull')
setupCommand('markdown', 'check md files for errors with markdownlint', 'markdownlint')
setupCommand('urls', 'validate external links with markdown-link-check', 'markdownlinkcheck', 'basic')
setupCommand('print', 'print linting results', 'printLintResults', 'minimal')
setupCommand('create-config', 'create markdownlint config', 'createMarkdownlintConfig', 'all')
setupCommand('create-maps', 'generating a includes map and anchors map', 'creatSourceMaps', 'maps')

program.parse()
