#!/usr/bin/env node

const {
  Command,
  Option
} = require('commander')
const { exec } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')
const fs = require('fs')
const program = new Command()
const cwd = process.cwd().toString()
const isWin = process.platform === 'win32'

const markdownLintSlimLog = '.markdownlint_slim.log'
const markdownLintFullLog = '.markdownlint_full.log'
const markdownLinkCheckLog = '.markdownlinkcheck.log'
const markdownLintLogs = /\.markdownlint_.*\.log/
const defaultSrc = 'src'

let execPath = path.resolve(__dirname, '../.bin/')

if (fs.existsSync(path.join(__dirname, '/node_modules/.bin/markdownlint-cli2'))) {
  execPath = path.join(__dirname, '/node_modules/.bin/')
}

function printErrors (logFile) {
  let regex
  if (logFile.match(markdownLintLogs)) {
    regex = /^(?!Finding: |Linting: |Summary: |markdownlint-cli2| ).+/gm
  } else {
    regex = /^\s*\[✖].* Status:/gm
  }
  try {
    const text = readFileSync(logFile).toString('utf-8').split(/\r?\n/)
    text.forEach((line) => {
      if (line.match(regex)) {
        console.log(line)
      }
    })
  } catch (err) {

  }
}

function numberFromLog (logFile, regex) {
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

    return number
  } catch (err) {
  }
}

const printLintResults = function (verbose = false) {
  const markdownlintSlim = path.resolve(cwd, markdownLintSlimLog)
  const markdownFiles = /Linting: (\d+) file/g
  const files = fs.readdirSync(__dirname).filter(fn => fn.match(markdownLintLogs))
  const markdownFilesCount = numberFromLog(files[0], markdownFiles)

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
    console.log(`Full markdownlint log see in ${markdownlintSlim}`)
  }

  const markdownlintFull = path.resolve(cwd, markdownLintFullLog)
  markdownLintErrorsCount = numberFromLog(markdownlintFull, markdownLintErrors)

  if (markdownLintErrorsCount !== null && markdownLintErrorsCount !== undefined) {
    console.log(`Found ${markdownLintErrorsCount} styleguide and formatting errors`)
    console.log(`Full markdownlint log see in ${markdownlintFull}`)
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
  return (isWin === true) ? `> ${logFile} 2>&1` : `&> ${logFile}`
}

const commandsGen = function (src = defaultSrc, customConfig = false, project = '') {
  const commands = {}
  const and = (isWin === true) ? '&' : ';'
  commands.createFullMarkdownlintConfig = (customConfig === false) ? `node ${path.join(__dirname, '/generate.js')} -m full -s ${src} -p '${project}'` : 'echo "using custom config"'
  commands.createSlimMarkdownlintConfig = (customConfig === false) ? `node ${path.join(__dirname, '/generate.js')} -m slim -s ${src} -p '${project}'` : 'echo "using custom config"'
  commands.markdownlintSrcSlim = `${commands.createSlimMarkdownlintConfig} && ${execPath}/markdownlint-cli2 "${src}/**/*.md" ${writeLog(markdownLintSlimLog)}`
  commands.markdownlintSrcFull = `${commands.markdownlintSrcSlim} ${and} ${commands.createFullMarkdownlintConfig} && ${execPath}/markdownlint-cli2 "${src}/**/*.md" ${writeLog(markdownLintFullLog)}`
  commands.markdownlintSrcFix = `${commands.markdownlintSrcSlim} ${and} ${commands.createFullMarkdownlintConfig} && ${execPath}/markdownlint-cli2-fix "${src}/**/*.md" ${writeLog(markdownLintFullLog)}`
  commands.markdownlinkcheckSrcUnix = `find ${src}/ -type f -name '*.md' -print0 | xargs -0 -n1 ${execPath}/markdown-link-check -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}`
  commands.markdownlinkcheckSrcWin = `forfiles /P ${src} /S /M *.md /C "cmd /c npx markdown-link-check @file -p -c ${path.join(__dirname, '/configs/mdLinkCheckConfig.json')} ${writeLog(path.join(cwd, markdownLinkCheckLog))}"`
  commands.markdownlinkcheckSrc = (isWin === true) ? commands.markdownlinkcheckSrcWin : commands.markdownlinkcheckSrcUnix
  commands.lintSrc = `${commands.markdownlintSrcFull} & ${commands.markdownlinkcheckSrc}`
  return {
    commands
  }
}

function execute (command, verbose = false, debug = false) {
  const shell = (isWin === true) ? 'cmd.exe' : '/bin/bash'
  if (debug) {
    console.log('executed command: ')
    console.log(command)
  }
  exec(command, { shell: shell }, (err, stdout, stderror) => {
    if (err || stderror || stdout) {
      printLintResults(verbose)
    } else {
      console.log('Command completed with no errors!')
    }
  })
}

const verboseOption = new Option('-v, --verbose', 'Print full linting results').default(false)
const sourceOption = new Option('-s, --source <path-to-sources>', 'source directory').default(defaultSrc)
const configOption = new Option('-c, --config', 'use custom markdownlint config').default(false)
const projectOption = new Option('-p, --project <project-name>', 'project name').default('')
const debugOption = new Option('-d, --debug', 'print executing command').default(false)

program
  .name('foliant-md-linter')
  .description('CLI tool for linting Foliant markdown sources')
  .version('0.0.1')

program.command('full-check')
  .description('Check md files with markdownlint and markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project).commands.lintSrc, options.verbose, options.debug)
  })
program.command('urls')
  .description('Validate external links with markdown-link-check')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config).commands.markdownlinkcheckSrc, options.verbose, options.debug)
  })

program.command('styleguide')
  .description('Check for styleguide adherence with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project).commands.markdownlintSrcFull, options.verbose, options.debug)
  })

program.command('slim')
  .description('Check for critical errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project).commands.markdownlintSrcSlim, options.verbose, options.debug)
  })

program.command('fix')
  .description('Fix formatting errors with markdownlint')
  .addOption(verboseOption)
  .addOption(sourceOption)
  .addOption(configOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project).commands.markdownlintSrcFix, options.verbose, options.debug)
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
    execute(commandsGen(options.source, options.config, options.project).commands.createFullMarkdownlintConfig, options.verbose, options.debug)
  })

program.command('create-slim-config')
  .description('Create slim markdownlint config')
  .addOption(sourceOption)
  .addOption(projectOption)
  .addOption(debugOption)
  .action((options) => {
    execute(commandsGen(options.source, options.config, options.project).commands.createSlimMarkdownlintConfig, options.verbose, options.debug)
  })

program.parse()
