#!/usr/bin/env node

// Use b2c-tools to implement this projects CLI
const {cli, commands, logger} = require('@SalesforceCommerceCloud/b2c-tools')
require('dotenv').config({override: true})

// extend b2c-tools cli
cli.epilogue('Composable Storefront POCs')
    .command(commands)
    .commandDir('./scripts', {
        include: /command.*/
    })

    .fail(function (msg, err, yargs) {
        if (err) {
            logger.error(err.message)
            logger.debug(err.stack)
        } else {
            console.error(yargs.help())
            console.error()
            console.error(msg)
        }
        process.exit(1)
    })
    .demandCommand()
    .help()
    .parse()
