const path = require('path')
const {
  exec,
  execSync
} = require('child_process')
const fs = require('fs')
// const { v4 } = require('uuid')
// const { cwd, chdir } = require('process')
// const originalCwd = cwd()

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

const cli = (args, cwd, clearLogs = true, tempDir = '') => {
  let clearLogsCmd = ''
  const originalCwd = '.'

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
    if (tempDir.length > 0) {
      // change directory
      cwd = originalCwd
      // remove <tempDir>
      fs.rmSync(tempDir)
    }
  })
}

// const mkTempDir = () => {
//   const tempDir = v4()
//   chdir(originalCwd)
//   console.log(tempDir)
//   // make directory <tempDir>
//   fs.mkdirSync(`temp/${tempDir}`, { recursive: true })
//   // copy test to <tempDir>
//   fs.cpSync('test', `temp/${tempDir}/test/`, { recursive: true })
//   // change directory <tempDir>
//   chdir(`temp/${tempDir}/test/`)
// }

// const rmTempDir = () => {
//   // change directory original
//   chdir(originalCwd)
//   // remove temp directory
//   fs.rmdirSync('temp', { force: true, recursive: true })
// }

// Export functions
module.exports = {
  cli,
  linkCheckFilePrint,
  linuxSwapString,
  copyTestSrcDir
  // mkTempDir,
  // rmTempDir
}
