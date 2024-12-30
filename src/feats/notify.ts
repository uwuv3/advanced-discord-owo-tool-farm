import chalk from "chalk"
import { Message } from "discord.js-selfbot-v13"

import { logger } from "../utils/logger.js"
import { timeHandler } from "../utils/utils.js"
import { Notifier } from "../structures/Notifier.js"
import { Configuration } from "../typings/typings.js"

export const consoleNotify = (commandsCount:number, textsCount: number, readyTimestamp: number) => {
    logger.log("data", "")
    logger.log("data", chalk.greenBright("Total command sent: ") + commandsCount)
    logger.log("data", chalk.greenBright("Total text sent: ") + textsCount)
    logger.log("data", chalk.greenBright("Total active time: ") + timeHandler(readyTimestamp, Date.now()))
    logger.log("data", chalk.cyanBright("SELFBOT HAS BEEN TERMINATED!"))
    logger.log("data", "")
}

export const selfbotNotify = (message: Message, config: Configuration, solved = false) => new Notifier(message, config, solved).notify()