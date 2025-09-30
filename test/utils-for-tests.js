const path = require('path')
const {
  exec,
  execSync
} = require('child_process')

const isWin = process.platform === 'win32'

const linkCheckFilePrint = (file) => {
  if (process.platform === 'win32') {
    file = path.posix.basename(file)
  } else if (process.platform === 'linux' || process.platform === 'darwin') {
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

const copyTestSrcDir = (dirname, config = '') => {
  execSync((isWin === true ? `rmdir /s /q temp && mkdir temp` : `rm -rf temp & mkdir -p temp`))
  execSync((isWin === true ? `xcopy test\\${dirname} temp\\${dirname} /E/S/I/C/Y` : `yes | cp -rf './test/${dirname}/.' ./temp/${dirname}/`))
  if (config) {
    execSync((isWin === true ? `xcopy test\\${dirname}\\${config} temp\\ /E/S/I/C/Y` : `yes | cp './test/${dirname}/${config}' ./temp`))
  }
}

// const testSrcDirs = ['src', 'alt-src', 'no-errors-src']

// testSrcDirs.forEach(srcDir => copyTestSrcDir(srcDir))

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
