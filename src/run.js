const {
    errorLog,
    infoLog,
    underlineLog,
} = require('./../utils/index')
const {
    deployConfigPath
} = require('./constants')
const fs = require('fs')
const Inquirer = require('inquirer')

const deploy = () => {
    const argvs = process.argv.slice(2)
    if (!argvs[1]) {
        errorLog('command err! try "deplot-cli run <config type>"')
    }
    const deployConfigs = checkDeployConfig(argvs[1])
    if (!deployConfigs) {
        process.exit(1)
    }

}

const checkDeployConfig = async (type) => {
    if (fs.existsSync(deployConfigPath)) {
        const config = require(deployConfigPath)
        const currentConfig = config[type]
        const nullConfig = []
        for (let key in currentConfig) {
            if (!currentConfig[key]) {
                nullConfig.push(key)
            }
        }
        if (nullConfig.length === 0) {
            await Inquirer.prompt([{
                type: 'confirm',
                message: `是否将项目部署到   ${underlineLog(currentConfig.host)}  ?`,
                name: 'sure'
            }])
            .then(answer => {
                const { sure } = answer
                if (!sure) {
                    process.exit(1)
                } else {
                    const deploy = require('./deploy')
                    deploy(currentConfig)
                }
            })
        } else {
            nullConfig.forEach(item => {
                infoLog(`${type}缺少  ${item}  配置，请设置该配置项`)
                return
            })
        }
    } else {
        infoLog(`缺少配置文件deploy.config.js , 请执行 "deploy-cli init" 下载配置文件`)
    }
}

module.exports = () => {
    deploy()
}