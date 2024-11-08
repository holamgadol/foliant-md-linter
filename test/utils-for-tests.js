const path = require('path')
const {
  exec,
  execSync
} = require('child_process')

const isWin = process.platform === 'win32'

const linkCheckFilePrint = (file) => {
  if (process.platform === 'win32') {
    file = path.posix.basename(file)
  } else if (process.platform === 'linux') {
    file = file.replace('//', '/')
  }
  return file
}

const linuxSwapString = (originalString, linuxString) => {
  if (process.platform === 'linux') {
    return linuxString
  } else {
    return originalString
  }
}

const copyTestSrcDir = (dirname) => {
  execSync((isWin === true ? `xcopy test\\${dirname} ${dirname} /E/S/I/C/Y` : `yes | cp -rf './test/${dirname}/.' ./${dirname}/`))
}

const testSrcDirs = ['src', 'alt-src', 'no-errors-src']

testSrcDirs.forEach(srcDir => copyTestSrcDir(srcDir))

const cli = (args, cwd, clearLogs = true) => {
  let clearLogsCmd = ''

  if (clearLogs) {
    clearLogsCmd = (isWin === true) ? 'DEL /Q /F ".markdownlin*" &&' : 'rm -f .markdownlin* &&'
  }

  return new Promise(resolve => {
    exec(`${clearLogsCmd} node ${path.resolve('./linter')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        })
      })
  })
}

// Export functions
module.exports = {
  cli,
  linkCheckFilePrint,
  linuxSwapString,
  copyTestSrcDir
}
