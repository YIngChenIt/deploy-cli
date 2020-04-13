const program = require('commander')
const path = require('path')
const {
    version
} = require('./constants')

const mapActions = {
    init: {
        alias: 'i',
        description: 'fetch config template',
    },
    '*': {
        alias: '',
        description: 'command not found',
    },
    run: {
        alias: 'r',
        description: 'start build',
    }
}

Reflect.ownKeys(mapActions).forEach(action => {
    program
        .command(action)
        .alias(mapActions[action].alias)
        .description(mapActions[action].description)
        .action(() => {
            if (action === '*') {
                console.log(mapActions[action].description)
            } else {
                require(path.resolve(__dirname, action))()
            }
        })
})

program.version(version).parse(process.argv)