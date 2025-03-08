import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { timeHandler } from "../utils/utils.js";
import { Notifier } from "../structures/Notifier.js";
import Language from "../structures/Language.js";
export const consoleNotify = (commandsCount, textsCount, captchaCount, readyTimestamp) => {
    logger.log("data", "");
    logger.log("data", chalk.greenBright(Language.__("message.totalCommand", { len: chalk.reset(commandsCount) })));
    logger.log("data", chalk.greenBright(Language.__("message.totalText", { len: chalk.reset(textsCount) })));
    logger.log("data", chalk.greenBright(Language.__("message.totalCaptchasSolved", { len: chalk.reset(captchaCount.resolved) })));
    logger.log("data", chalk.redBright(Language.__("message.totalCaptchasUnsolved", { len: chalk.reset(captchaCount.unsolved) })));
    logger.log("data", chalk.greenBright(Language.__("message.totalActive", { time: chalk.reset(timeHandler(readyTimestamp, Date.now())) })));
    logger.log("data", chalk.cyanBright(Language.__("message.terminated")));
    logger.log("data", "");
};
export const selfbotNotify = (message, config, solved = false) => new Notifier(message, config, solved).notify();
