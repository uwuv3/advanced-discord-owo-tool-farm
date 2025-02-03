import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { timeHandler } from "../utils/utils.js";
import { Notifier } from "../structures/Notifier.js";
export const consoleNotify = (commandsCount, textsCount, captchaCount, readyTimestamp) => {
    logger.log("data", "");
    logger.log("data", chalk.greenBright("Total command sent: ") + commandsCount);
    logger.log("data", chalk.greenBright("Total text sent: ") + textsCount);
    logger.log("data", chalk.greenBright("Total Captchas Resolved: ") + captchaCount.resolved);
    logger.log("data", chalk.redBright("Total Captchas Unsolved: ") + captchaCount.unsolved);
    logger.log("data", chalk.greenBright("Total active time: ") + timeHandler(readyTimestamp, Date.now()));
    logger.log("data", chalk.cyanBright("SELFBOT HAS BEEN TERMINATED!"));
    logger.log("data", "");
};
export const selfbotNotify = (message, config, solved = false) => new Notifier(message, config, solved).notify();
