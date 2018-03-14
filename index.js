const fs = require('fs')
const path = require('path')

const baseDirectory = process.argv[2]
if (!baseDirectory) {
  console.error('No base directory specified')
}

const changesFilename = require.resolve('./changes.txt')
const changesContent = fs.readFileSync(changesFilename, 'utf8')
const changes = changesContent.trim().split('\n').map(line => {
  const parts = line.split('\t')
  const from = `fa fa-${parts[0]}`
  const to = `${parts[2]} fa-${parts[1]}`
  return { from, to }
})

const migrateDirectory = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const filename = path.resolve(dir, file)
    if (fs.statSync(filename).isDirectory()) {
      migrateDirectory(filename)
    } else {
      migrateFile(filename);
    }
  })
}

const migrateFile = (filename) => {
  const content = fs.readFileSync(filename, 'utf8')

  // Update icons
  let result = changes.reduce((result, { from, to }) => {
    const regEx = new RegExp(from, 'g')
    return result.replace(regEx, to)
  }, content)

  // fas prefix
  result = result.replace(/fa fa-/g, 'fas fa-')

  if (result !== content) {
    console.log('updating', filename, '...')
    fs.writeFileSync(filename, result, 'utf8')
  }
}

migrateDirectory(baseDirectory)
