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

const markdownLintLog = '.markdownlint.log'
const markdownLinkCheckLog = '.markdownlinkcheck.log'
const defaultConfig = path.resolve(cwd, '.markdownlint-cli2.jsonc')
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
    console.log(`Full markdownlint log see in ${markdownlintLogPath}\n`)
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

const commandsGen = function (src = defaultSrc, customConfig = false, project = '', markdownlintmode, isFix) {
  const commands = {}
  const fix = (isFix === true) ? '-fix' : ''
  commands.createMarkdownlintConfig = (customConfig === false) ? `node ${path.join(__dirname, '/generate.js')} -m ${markdownlintmode} -s ${src} -p "${project}"` : 'echo "using custom config"'
  commands.markdownlint = `${commands.createMarkdownlintConfig} && ${execPath}/markdownlint-cli2${fix} "${src}/**/*.md" ${writeLog(markdownLintLog)}`
  commands.markdownlinkcheckSrcUnix = `find ${src}/ -type f -name '*.md' -print0 | xargs -0 -n1 ${execPath}/markdown-link-check -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}`
  commands.markdownlinkcheckSrcWin = `del ${path.join(cwd, markdownLinkCheckLog)} & forfiles /P ${src} /S /M *.md /C "cmd /c npx markdown-link-check @file -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}"`
  commands.markdownlinkcheck = (isWin === true) ? commands.markdownlinkcheckSrcWin : commands.markdownlinkcheckSrcUnix
  commands.lintSrcFull = `${commands.markdownlint} & ${commands.markdownlinkcheck}`
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
const allowfailureOption = new Option('-a, --allowfailure', 'allow exit with failure if errors').default(false)
const clearconfigOption = new Option('-l, --clearconfig', 'remove markdownlint config after execution').default(false)
const fixOption = new Option('-f, --fix', 'fix errors with markdownlint').default(false)
const markdownlintmodeOption = new Option('-m, --markdownlintmode <mode-name>', 'set mode for markdownlint').choices(['full', 'slim', 'typograph']).default('slim')

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
  .addOption(fixOption)
  .addOption(markdownlintmodeOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.markdownlintmode, options.fix).commands.lintSrcFull, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('markdown')
  .description('Check md files for errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .addOption(fixOption)
  .addOption(markdownlintmodeOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.markdownlintmode, options.fix).commands.markdownlint, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('urls')
  .description('Validate external links with markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(debugOption)
  .addOption(allowfailureOption)
  .addOption(clearconfigOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config).commands.markdownlinkcheck, options.verbose, options.debug, options.allowfailure, options.clearconfig)
  })

program.command('print')
  .description('Print linting results')
  .addOption(verboseOption)
  .action((options) => {
    printLintResults(options.verbose)
  })

program.command('create-config')
  .description('Create markdownlint config')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(projectOption)
  .addOption(markdownlintmodeOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project, options.markdownlintmode).commands.createMarkdownlintConfig, options.verbose, options.debug)
  })

program.parse()
