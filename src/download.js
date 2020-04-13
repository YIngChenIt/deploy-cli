const fs = require('fs')
const {
    deployPath,
    deployConfigPath,
    deployGit,
} = require('./constants')
const {
    infoLog,
    successLog,
    errorLog,
} = require('./../utils/index')
const downloadGitRepo = require('download-git-repo')
const Inquirer = require('inquirer')
const ora = require('ora')

const downloadErrHandle = async () => {
    const {
        operate
    } = await Inquirer.prompt({
        name: 'operate',
        type: 'list',
        message: '\n配置文件下载失败 请选择将要进行的操作',
        choices: ['exit', 'try again']
    })
    if (operate === 'exit') {
        process.exit(1)
    } else {
        downloadConfigTemplate()
    }
}

const downloadConfigTemplate = async () => {
    const spinner = ora('开始下载配置文件')
    spinner.start()
    downloadGitRepo(deployGit, 'deploy', {
        clone: false
    }, async (err) => {
        if (err) {
            console.log()
            errorLog(err)
            spinner.stop()
            await downloadErrHandle()
            return
        }
        spinner.stop()
        successLog('配置文件下载成功，位置：deploy/deploy.config.js')
        process.exit(0)
    })
    
}

const checkDeployExists = () => {
    if (fs.existsSync(deployPath) && fs.existsSync(deployConfigPath)) {
        infoLog('deploy目录下的deploy.config.js配置文件已经存在，请勿重新下载')
        process.exit(1)
    }
    downloadConfigTemplate()
}

module.exports = {
    downloadConfigTemplate,
    checkDeployExists,
}