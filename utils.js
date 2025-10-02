const fs = require('fs')
const YAML = require('yaml')

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
const slug = {
  tag: '!slug',
  resolve: str => ''
}
const date = {
  tag: '!date',
  resolve: str => ''
}

// Exported functions
const parseChapters = (foliantConfig, sourceDir, listOfFiles) => {
  // Get foliant config
  const config = getFoliantConfig(foliantConfig)

  eachRecursive(config.chapters, listOfFiles, sourceDir)

  return listOfFiles
}

const existIncludes = (foliantConfig) => {
  // Exist includes in list of preprocessors
  const config = getFoliantConfig(foliantConfig)
  let exist = false
  config.preprocessors.forEach(function (item) {
    if (item.constructor === String) {
      if (item === 'includes') {
        exist = true
      }
    } else if (item.constructor === Object) {
      Object.keys(item).forEach(function (key) {
        if (key === 'includes') {
          exist = true
        }
      })
    }
  })
  return exist
}

const getFoliantConfig = (foliantConfig) => {
  // Get foliant config
  const configContent = fs.readFileSync(foliantConfig, 'utf8')
  return YAML.parse(configContent, { customTags: [env, include, path, from, slug, date] })
}

const updateListOfFiles = (sourceDir, IncludesMapPath, listOfFiles) => {
  // Get files from includes map
  try {
    const includesMapContent = JSON.parse(fs.readFileSync(IncludesMapPath, 'utf8'))
    eachRecursive(includesMapContent, listOfFiles, sourceDir)
    // Remove duplicates
    listOfFiles = [...new Set(listOfFiles)]
    return listOfFiles
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
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
  if (fs.existsSync(`${sourceDir}/index.md`)) {
    list.push(`${sourceDir}/index.md`)
  }
}

function parseAnchorsFromDir (dir, listOfFiles, headers = false) {
  const results = []
  listOfFiles.forEach(file => {
    const content = fs.readFileSync(`${dir}${file.substring(4)}`, 'utf8')
    const anchors = new Set()
    const result = {}

    content.replace(/^\s*#{1,6}[^{]*\{#([^}]+)\}/gm, (_, id) => anchors.add(`${id}`)) // custom id
    content.replace(/<anchor>(.+)<\/anchor>/gm, (_, id) => anchors.add(`${id}`)) // tag <anchor></anchors>
    if (headers) {
      content.replace(/^#+\s+([^({#|\n)]+)$/gm, (_, title) => { // headers
        const anchor = trimEmptyLines(title.toLowerCase())
          .replace(/\s+/g, '-')
          .replace(/[^a-zа-яё\-0-9]/g, '')
        anchors.add(anchor)
      })
    }
    content.replace(/\sid=(?:"([^"]*)"|'([^']*)')/gm, (_, id1, id2) => anchors.add(id1 || id2)) // html-tag with id

    if (anchors.size) {
      result.file = `${file}`
      result.anchors = [...anchors]
      results.push(result)
    }
  })

  return results
}

const trimEmptyLines = text => String(text).replace(/^\n+|\n+$/g, '')

// Export functions
module.exports = {
  parseChapters,
  updateListOfFiles,
  getFoliantConfig,
  existIncludes,
  parseAnchorsFromDir,
  trimEmptyLines
}
