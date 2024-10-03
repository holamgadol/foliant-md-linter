#!/usr/bin/env node

const {
  Command,
  Option
} = require('commander')
const { exec, spawn } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')
const fs = require('fs')
const { unlink } = require('fs')
const program = new Command()
const cwd = process.cwd().toString()
const isWin = process.platform === 'win32'
const shell = (isWin === true) ? 'cmd.exe' : '/bin/bash'

const markdownLintSlimLog = '.markdownlint_slim.log'
const markdownLintFullLog = '.markdownlint_full.log'
const markdownLinkCheckLog = '.markdownlinkcheck.log'
const defaultConfig = path.resolve(cwd, '.markdownlint-cli2.jsonc')
const markdownLintLogs = /\.markdownlint_.*\.log/
const defaultSrc = 'src'

let execPath = path.resolve(__dirname, '../.bin/')
let exitCode = 0

if (fs.existsSync(path.join(__dirname, '/node_modules/.bin/markdownlint-cli2'))) {
  execPath = path.join(__dirname, '/node_modules/.bin/')
}

function printErrors (logFile) {
  let regex
  let file
  let fileTmp
  let fileLink
  if (logFile.match(markdownLintLogs)) {
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
        if (fileTmp !== file && logFile.match(markdownLintLogs)) {
          fileTmp = file
          console.log(`\n${'-'.repeat(80)}\n\nFILE: ${fileTmp}\n`)
        } else if (!logFile.match(markdownLintLogs)) {
          console.log(`\n${'-'.repeat(80)}\n\n${fileLink}\n`)
        }
        console.log(line)
      }
    })
    console.log()
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
  const markdownlintSlim = path.resolve(cwd, markdownLintSlimLog)
  const markdownFiles = /Linting: (\d+) file/g
  const files = fs.readdirSync(__dirname).filter(fn => fn.match(markdownLintLogs))
  const markdownFilesCount = numberFromLog(files[0], markdownFiles, false)

  if (markdownFilesCount !== null && markdownFilesCount !== undefined) {
    console.log(`Checked ${markdownFilesCount} files`)
  }

  const markdownLintErrors = /Summary: (\d+) error/g
  let markdownLintErrorsCount = numberFromLog(markdownlintSlim, markdownLintErrors)

  if (markdownLintErrorsCount !== null && markdownLintErrorsCount !== undefined) {
    console.log(`Found ${markdownLintErrorsCount} critical formatting errors`)
    if (verbose) {
      printErrors(markdownlintSlim)
    }
    console.log(`Full markdownlint log see in ${markdownlintSlim}\n`)
  }

  const markdownlintFull = path.resolve(cwd, markdownLintFullLog)
  markdownLintErrorsCount = numberFromLog(markdownlintFull, markdownLintErrors)

  if (markdownLintErrorsCount !== null && markdownLintErrorsCount !== undefined) {
    console.log(`Found ${markdownLintErrorsCount} styleguide and formatting errors`)
    console.log(`Full markdownlint log see in ${markdownlintFull}\n`)
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

const commandsGen = function (src = defaultSrc, customConfig = false, project = '', includesMap = '', listOfFiles = '') {
  let findCommandUnix = `${src}/ -type f -name '*.md'`
  let findCommandWin = `del ${path.join(cwd, markdownLinkCheckLog)} & forfiles /P ${src} /S /M *.md`
  if (listOfFiles !== '*.md' && listOfFiles !== '') {
    findCommandUnix = `$(${listOfFiles})`
    findCommandWin = `${listOfFiles}`
  }
  const commands = {}
  const and = (isWin === true) ? '&' : ';'
  commands.createFullMarkdownlintConfig = (customConfig === false) ? `node ${path.join(__dirname, '/generate.js')} -m full -s ${src} --includes-map ${includesMap} -p "${project}"` : 'echo "using custom config"'
  commands.createSlimMarkdownlintConfig = (customConfig === false) ? `node ${path.join(__dirname, '/generate.js')} -m slim -s ${src} --includes-map ${includesMap} -p "${project}"` : 'echo "using custom config"'
  commands.createTypographMarkdownlintConfig = (customConfig === false) ? `node ${path.join(__dirname, '/generate.js')} -m typograph -s ${src} -p "${project}"` : 'echo "using custom config"'
  commands.markdownlintSrcSlim = `${commands.createSlimMarkdownlintConfig} && ${execPath}/markdownlint-cli2 "${src}/**/*.md" ${writeLog(markdownLintSlimLog)}`
  commands.markdownlintSrcFull = `${commands.markdownlintSrcSlim} ${and} ${commands.createFullMarkdownlintConfig} && ${execPath}/markdownlint-cli2 "${src}/**/*.md" ${writeLog(markdownLintFullLog)}`
  commands.markdownlintSrcFix = `${commands.markdownlintSrcSlim} ${and} ${commands.createFullMarkdownlintConfig} && ${execPath}/markdownlint-cli2-fix "${src}/**/*.md" ${writeLog(markdownLintFullLog)}`
  commands.markdownlintSrcTypograph = `${commands.createTypographMarkdownlintConfig} && ${execPath}/markdownlint-cli2-fix "${src}/**/*.md" ${writeLog(markdownLintFullLog)}`
  commands.markdownlinkcheckSrcUnix = `find ${findCommandUnix} -print0 | xargs -0 -n1 ${execPath}/markdown-link-check -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}`
  commands.markdownlinkcheckSrcWin = `${findCommandWin} /C "cmd /c npx markdown-link-check @file -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}"`
  commands.markdownlinkcheckSrc = (isWin === true) ? commands.markdownlinkcheckSrcWin : commands.markdownlinkcheckSrcUnix
  commands.lintSrcEssential = `${commands.markdownlintSrcSlim} & ${commands.markdownlinkcheckSrc}`
  commands.lintSrcFull = `${commands.markdownlintSrcFull} & ${commands.markdownlinkcheckSrc}`
  return {
    commands
  }
}

function clearConfig (clearconfig) {
  if (clearconfig === true) {
    console.log(`removing ${defaultConfig} ...`)
    unlink(defaultConfig, (err) => {
      if (err && err.syscall === 'unlink') {
        console.log(`${defaultConfig} is absent`)
      }
    })
  }
}

function checkExitCode (allowfailure) {
  if ((allowfailure === true) && (exitCode > 0)) {
    process.exit(1)
  }
}

function afterLint (verbose, clearconfig, allowfailure) {
  printLintResults(verbose)
  clearConfig(clearconfig)
  checkExitCode(allowfailure)
}

function execute (command, verbose = false, debug = false, allowfailure = false, clearconfig = false) {
  if (debug) {
    console.log('executed command: ')
    console.log(command)
  }
  if (verbose === false) {
    exec(command, { shell: shell }, (err, stdout, stderror) => {
      if (err || stderror || stdout) {
        afterLint(verbose, clearconfig, allowfailure)
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
      afterLint(verbose, clearconfig, allowfailure)
    })
  }
}

const verboseOption = new Option('-v, --verbose', 'Print full linting results').default(false)
const sourceOption = new Option('-s, --source <path-to-sources>', 'source directory').default(defaultSrc)
const configOption = new Option('-c, --config', 'use custom markdownlint config').default(false)
const projectOption = new Option('-p, --project <project-name>', 'project name').default('')
const debugOption = new Option('-d, --debug', 'print executing command').default(false)
const allowfailureOption = new Option('-f, --allowfailure', 'allow exit with failure if errors').default(false)
const clearconfigOption = new Option('-l, --clearconfig', 'remove markdownlint config after execution').default(false)
const includesMap = new Option('--includes-map <includes-map>', 'includes map path').default('./includes_map.json')
const listOfFiles = new Option('--ext-links-check <list-of-files>', 'the list of files to be checked').default('*.md')

program
  .name('foliant-md-linter')
  .description('CLI tool for linting Foliant markdown sources')
  .version('0.1.10')

program.command('full-check')
  .description('Check md files with markdownlint and markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .addOption(includesMap)
  .addOption(listOfFiles)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.lintSrcFull, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('essential')
  .description('Check md files for critical formatting errors with markdownlint and validate external links ith markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .addOption(includesMap)
  .addOption(listOfFiles)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.lintSrcEssential, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('urls')
  .description('Validate external links with markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config).commands.markdownlinkcheckSrc, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('styleguide')
  .description('Check for styleguide adherence with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .addOption(includesMap)
  .addOption(listOfFiles)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.markdownlintSrcFull, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('slim')
  .description('Check for critical errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .addOption(includesMap)
  .addOption(listOfFiles)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.markdownlintSrcSlim, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('fix')
  .description('Fix formatting errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .addOption(includesMap)
  .addOption(listOfFiles)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.markdownlintSrcFix, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('typograph')
  .description('Fix typographic errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project).commands.markdownlintSrcTypograph, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('print')
  .description('Print linting results')
  .addOption(verboseOption)
  .action((options) => {
    printLintResults(options.verbose)
  })

program.command('create-full-config')
  .description('Create full markdownlint config')
  .addOption(sourceOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.createFullMarkdownlintConfig, options.verbose, options.debug)
  })

program.command('create-slim-config')
  .description('Create slim markdownlint config')
  .addOption(sourceOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.createSlimMarkdownlintConfig, options.verbose, options.debug)
  })

program.command('create-typograph-config')
  .description('Create typograph markdownlint config')
  .addOption(sourceOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.includesMap, options.extLinksCheck).commands.createTypographMarkdownlintConfig, options.verbose, options.debug)
  })

program.parse()
