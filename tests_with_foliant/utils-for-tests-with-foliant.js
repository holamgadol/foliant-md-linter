const {
  execSync
} = require('child_process')


const cli = (args, cwd) => {
  return new Promise(resolve => {
    exec(`node ${path.resolve('./linter')} ${args.join(' ')}`,
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

const copyTestSrcDir = (dirname, config = '') => {
  execSync((`rm -rf temp & mkdir -p temp`))
  execSync((`yes | cp -rf './test/${dirname}/.' ./temp/${dirname}/`))
  if (config) {
    execSync((`yes | cp './test/${dirname}/${config}' ./temp`))
  }
}

// Export functions
module.exports = {
  cli,
  copyTestSrcDir
}
