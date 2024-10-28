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
const YAML = require('yaml')

// The subprocess
const program = new Command()
const cwd = process.cwd().toString()
const isWin = process.platform === 'win32'
const shell = (isWin === true) ? 'cmd.exe' : '/bin/bash'
let listOfFiles = []

// The log paths
const markdownLintLog = '.markdownlint.log'
const markdownLinkCheckLog = '.markdownlinkcheck.log'
const genIncludesMapLog = '.gen_includes_map.log'

// Default paths
const defaultConfig = path.resolve(cwd, '.markdownlint-cli2.jsonc')
const defaultSrc = 'src'
const defaultFoliantConfig = './foliant.yml'
const defaultIncludesMap = './includes_map.json'
const usedFoliantConfig = './only_includes_map.yml'

// Options
const verboseOption = new Option('-v, --verbose', 'print full linting results').default(false)
const sourceOption = new Option('-s, --source <path-to-sources>', 'source directory').default(defaultSrc)
const configOption = new Option('-c, --config <path-to-config>', 'path to custom config').default('')
const projectOption = new Option('-p, --project <project-name>', 'project name').default('')
const debugOption = new Option('-d, --debug', 'print executing command').default(false)
const allowFailureOption = new Option('-a, --allow-failure', 'allow exit with failure if errors').default(false)
const clearConfigOption = new Option('-l, --clear-config', 'remove markdownlint config after execution').default(false)
const fixOption = new Option('-f, --fix', 'fix errors with markdownlint').default(false)
const markdownlintModeOption = new Option('-m, --markdownlint-mode <mode-name>', 'set mode for markdownlint').choices(['full', 'slim', 'typograph', 'mdlint-default']).default('slim')
const foliantConfigOption = new Option('--foliant-config <config-path>', 'the configuration file is a foliant from which chapters').default(defaultFoliantConfig)

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
        console.log(line)
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

  if (markdownFilesCount !== null && markdownFilesCount !== undefined) {
    console.log(`Checked ${markdownFilesCount} files`)
  }

  const markdownLintErrors = /Summary: (\d+) error/g
  const markdownLintErrorsCount = numberFromLog(markdownlintLogPath, markdownLintErrors)

  if (markdownLintErrorsCount !== null && markdownLintErrorsCount !== undefined) {
    console.log(`Found ${markdownLintErrorsCount} formatting errors`)
    if (verbose) {
      printErrors(markdownlintLogPath)
    }
    console.log(`Full markdownlint log see in ${markdownlintLogPath}`)
  }

  const markdownLinkCheckErrors = /ERROR: (\d+) dead links found!/g
  const markdownlinkcheckLog = path.resolve(cwd, markdownLinkCheckLog)
  const markdownlinkCheckErrorsCount = numberFromLog(markdownlinkcheckLog, markdownLinkCheckErrors)
  if (markdownlinkCheckErrorsCount !== null && markdownlinkCheckErrorsCount !== undefined) {
    console.log(`Found ${markdownlinkCheckErrorsCount} broken external links`)
    if (verbose) {
      printErrors(markdownlinkcheckLog)
    }
    console.log(`Full markdown-link-check log see in ${markdownlinkcheckLog}`)
  }
}

function writeLog (logFile) {
  return (isWin === true) ? `>> ${logFile} 2>&1` : `2>&1 | tee ${logFile}`
}

const commandsGen = function (src = defaultSrc, configPath = '', project = '', markdownlintMode = 'slim', foliantConfig = defaultFoliantConfig, isFix = false, debug = false) {
  const commands = {}
  const fix = (isFix === true) ? '-fix' : ''

  let includesMapArg = ''
  let configPathArg = ''
  let projectArg = ''
  let debugArg = ''
  let filesArgMdLint = `"${src}/**/*.md"`
  let filesArgMdLink = `${src}/`
  let includesMap = false

  if (project) {
    projectArg = `-p "${project}"`
  }

  if (debug) {
    console.log('command gen params:\n',
      'src: ', src,
      'configPath: ', configPath,
      'project: ', project,
      'markdownlintMode: ', markdownlintMode,
      'foliantConfig: ', foliantConfig,
      'isFix: ', isFix,
      'debug: ', debug)
  }

  // Get list of files and creat includes map
  if (fs.existsSync(foliantConfig)) {
    includesMap = prepare(foliantConfig, src)
  }

  // Create includes map
  if (includesMap) {
    includesMapArg = `--includes-map ${defaultIncludesMap}`
  }

  if (configPath && fs.existsSync(configPath)) {
    configPathArg = `-c ${configPath}`
  }

  if (debug) {
    debugArg = '-d'
  }

  if (listOfFiles.length > 0 && !isWin) {
    filesArgMdLint = ''
    listOfFiles.forEach((file) => {
      if (file) {
        filesArgMdLint = `${filesArgMdLint} "${file}"`
      }
    })
    filesArgMdLink = filesArgMdLint
  }

  // Create config
  commands.createMarkdownlintConfig = (markdownlintMode !== 'mdlint-default') ? `node ${path.join(__dirname, '/generate.js')} -m ${markdownlintMode} -s ${src} ${projectArg} ${configPathArg} ${debugArg} ${includesMapArg}` : 'echo "using default markdownlint config"'

  // Markdownlint
  commands.markdownlint = `${commands.createMarkdownlintConfig} && ${execPath}/markdownlint-cli2${fix} ${filesArgMdLint} ${writeLog(markdownLintLog)}`

  // Markdownlintcheck
  commands.markdownlinkcheckSrcUnix = `find ${filesArgMdLink} -type f -name '*.md' -print0 | xargs -0 -n1 ${execPath}/markdown-link-check -q -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}`
  commands.markdownlinkcheckSrcWin = `${filesArgMdLink} "cmd /c npx markdown-link-check @file -q -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}"`

  commands.markdownlinkcheck = (isWin === true) ? commands.markdownlinkcheckSrcWin : commands.markdownlinkcheckSrcUnix

  // Merge comands markdownlint and markdownlinkcheck
  commands.lintSrcFull = `${commands.markdownlint} & ${commands.markdownlinkcheck}`

  return {
    commands
  }
}

function prepare (foliantConfig, sourceDir) {
  // Def custom tags
  const env = {
    tag: '!env',
    resolve: str => str
  }
  const include = {
    tag: '!include',
    resolve: str => ''
  }
  const path = {
    tag: '!path',
    resolve: str => str
  }
  const from = {
    tag: '!from',
    resolve: str => ''
  }

  // Get foliant config
  const configPath = fs.readFileSync(foliantConfig, 'utf8')
  const config = YAML.parse(configPath, { customTags: [env, include, path, from] })
  eachRecursive(config.chapters, listOfFiles, sourceDir)

  // Exist includes in list of preprocessors
  const existInclude = config.preprocessors.includes('includes')

  // Create includes map
  if (existInclude) {
    createConfigIncludesMap(foliantConfig)
    const genIncludesMapCommand = `foliant make --config ${usedFoliantConfig} pre --logs .temp_project_logs ${writeLog(genIncludesMapLog)} && rm -rf temp_project.pre/ && rm -rf .temp_project_logs/`
    execSync(genIncludesMapCommand, { shell: shell }, (err) => {
      if (err) {
        console.error(err)
      }
    })

    // Get files from includes map
    const includesMapContent = JSON.parse(fs.readFileSync(defaultIncludesMap, 'utf8'))
    eachRecursive(includesMapContent, listOfFiles, sourceDir)
  }
  //
  listOfFiles = [...new Set(listOfFiles)]

  return existInclude
}

function eachRecursive (obj, list, sourceDir) {
  for (const k in obj) {
    if (typeof obj[k] === 'string') {
      const s = obj[k]
      if (s.endsWith('.md')) {
        if (s.startsWith(sourceDir)) {
          if (fs.existsSync(s)) {
            list.push(s)
          }
        } else {
          if (!s.startsWith('http')) {
            if (fs.existsSync(`${sourceDir}/${s}`)) {
              list.push(`${sourceDir}/${s}`)
            }
          }
        }
      }
    } else {
      eachRecursive(obj[k], list, sourceDir)
    }
  }
}

function clearConfigFile (clearConfig) {
  if (clearConfig === true) {
    console.log(`removing ${defaultConfig} ...`)
    unlink(defaultConfig, (err) => {
      if (err && err.syscall === 'unlink') {
        console.log(`${defaultConfig} is absent`)
      }
    })
  }
}

function checkExitCode (allowfailure) {
  if ((allowfailure === false) && (exitCode > 0)) {
    process.exit(1)
  }
}

function afterLint (verbose = false, clearConfig = false, allowFailure = false, debug = false) {
  printLintResults(verbose)
  clearConfigFile(clearConfig)
  if (!debug) {
    rmIncludesMap()
  }
  checkExitCode(allowFailure)
}

function execute (command, verbose = false, debug = false, allowFailure = false, clearConfig = false) {
  if (debug) {
    console.log('executed command: ')
    console.log(command)
  }
  if (verbose === false) {
    exec(command, { shell: shell }, (err, stdout, stderror) => {
      if (err || stderror || stdout) {
        afterLint(verbose, clearConfig, allowFailure, debug)
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
      console.log(`\n${'='.repeat(80)}\n\nRESULTS:\n\n${'='.repeat(80)}\n`)
      afterLint(verbose, clearConfig, allowFailure, debug)
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

function rmIncludesMap () {
  if (fs.existsSync(usedFoliantConfig)) {
    fs.rmSync(usedFoliantConfig, { force: true })
  }
  if (fs.existsSync(defaultIncludesMap)) {
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
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.markdownlintmode, options.foliantConfig, options.fix, options.debug).commands.lintSrcFull, options.verbose, options.debug, options.allowFailure, options.clearConfig)
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
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.markdownlintMode, options.foliantConfig, options.fix, options.debug).commands.markdownlint, options.verbose, options.debug, options.allowFailure, options.clearConfig)
  })

program.command('urls')
  .description('validate external links with markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(debugOption)
  .addOption(allowFailureOption)
  .addOption(clearConfigOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.debug).commands.markdownlinkcheck, options.verbose, options.debug, options.allowFailure, options.clearConfig)
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
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.markdownlintMode, options.foliantConfig, options.debug).commands.createMarkdownlintConfig, options.verbose, options.debug)
  })

program.parse()
