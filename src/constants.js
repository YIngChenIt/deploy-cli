const path = require('path')
const {
    version
} = require('../package')
const deployPath = path.join(process.cwd(), './deploy')
const deployConfigPath = `${deployPath}/deploy.config.js`
const deployGit = 'YIngChenIt/deploy-config-template'

module.exports = {
    version,
    deployPath,
    deployConfigPath,
    deployGit,
}