var path = require('path')
const archiver = require('archiver')
const fs = require('fs')

const {logger} = require('@SalesforceCommerceCloud/b2c-tools')
const {findCartridges} = require('@SalesforceCommerceCloud/b2c-tools/lib/code')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

function buildCommand(excludeCartridges = []) {
    // create dist of cartridges (and other assets)
    logger.info('Zipping cartridges...')

    const output = fs.createWriteStream(resolveApp('cartridges.zip'))
    var cartridges = findCartridges()
    logger.debug(`Excluding cartridges ${excludeCartridges.join(',')}`)
    cartridges = cartridges.filter((c) => !excludeCartridges.includes(c.dest))
    cartridges.forEach((c) => logger.info(`\t${c.dest}`))
    var archive = archiver('zip', {
        zlib: {level: 9} // Sets the compression level.
    })
    archive.pipe(output)
    output.on('close', function () {
        logger.info('Cartridges written to cartridges.zip; ' + archive.pointer() + ' total bytes')
    })
    cartridges.forEach((c) => {
        console.log(c.src, c.dest)
        archive.directory(c.src, `${c.dest}`)
    })

    archive.finalize()
}

module.exports = {
    command: 'package',
    desc: 'production cartridge build',
    builder: (yargs) => yargs,
    handler: (argv) => buildCommand(argv['exclude-cartridges'])
}
