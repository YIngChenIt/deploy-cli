const {
    successLog,
    errorLog,
    underlineLog,
} = require('./../utils/index')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const ora = require('ora')
const node_ssh = require('node-ssh')
const archiver = require('archiver')

const projectDir = process.cwd()

let ssh = new node_ssh()

const deploy = async (config) => {
    const {
        script,
        webDir,
        distPath,
        name
    } = config
    try {
        execBuild(script)
        await startZip(distPath)
        await connectSSH(config)
        await uploadFile(webDir)
        await unzipFile(webDir)
        await deleteLocalZip()
        successLog(`\n 恭喜您，项目${underlineLog(name)}部署成功了^_^\n`)
        process.exit(0)
    } catch (err) {
        errorLog(`  部署失败 ${err}`)
        process.exit(1)
    }
}

const execBuild = (script) => {
    try {
        console.log(`\n（1）${script}`)
        const spinner = ora('正在打包中')
        spinner.start()
        console.log()
        childProcess.execSync(script, {
            cwd: projectDir
        })
        spinner.stop()
        successLog('  打包成功')
    } catch (err) {
        errorLog(err)
        // process.exit(1)
    }
}

const startZip = (distPath) => {
    return new Promise((resolve, reject) => {
        distPath = path.resolve(projectDir, distPath)
        console.log('（2）打包成zip')
        const archive = archiver('zip', {
            zlib: {
                level: 9
            },
        }).on('error', err => {
            throw err
        })
        const output = fs.createWriteStream(`${projectDir}/dist.zip`)
        output.on('close', err => {
            if (err) {
                errorLog(`  关闭archiver异常 ${err}`)
                reject(err)
                process.exit(1)
            }
            successLog('  zip打包成功')
            resolve()
        })
        archive.pipe(output)
        archive.directory(distPath, '/')
        archive.finalize()
    })
}

const connectSSH = async (config) => {
    const {
        host,
        port,
        username,
        password,
        privateKey,
        passphrase,
    } = config
    const sshConfig = {
        host,
        port,
        username,
        password,
        privateKey,
        passphrase
    }
    try {
        console.log(`（3）连接${underlineLog(host)}`)
        await ssh.connect(sshConfig)
        successLog('  SSH连接成功')
    } catch (err) {
        errorLog(`  连接失败 ${err}`)
        process.exit(1)
    }
}

const uploadFile = async (webDir) => {
    try {
        console.log(`（4）上传zip至目录${underlineLog(webDir)}`)
        await ssh.putFile(`${projectDir}/dist.zip`, `${webDir}/dist.zip`)
        successLog('  zip包上传成功')
    } catch (err) {
        errorLog(`  zip包上传失败 ${err}`)
        process.exit(1)
    }
}

async function runCommand(command, webDir) {
    await ssh.execCommand(command, { cwd: webDir });
}

const unzipFile = async (webDir) => {
    try {
        console.log('（5）开始解压zip包')
        await runCommand(`cd ${webDir}`, webDir)
        await runCommand('unzip -o dist.zip && rm -f dist.zip', webDir)
        successLog('  zip包解压成功')
    } catch (err) {
        errorLog(`  zip包解压失败 ${err}`)
        process.exit(1)
    }
}

const deleteLocalZip = async () => {
    return new Promise((resolve, reject) => {
        console.log('（6）开始删除本地zip包')
        fs.unlink(`${projectDir}/dist.zip`, err => {
            if (err) {
                errorLog(`  本地zip包删除失败 ${err}`, err)
                reject(err)
                process.exit(1)
            }
            successLog('  本地zip包删除成功\n')
            resolve()
        })
    })
}

module.exports = deploy