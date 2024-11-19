import chalk from "chalk"
import { createLogger, format, transports, Logger, LogEntry } from "winston"

class CustomLogger {
    public logger: Logger
    private static instance: CustomLogger

    constructor() {
        const { combine, printf, timestamp, errors, uncolorize } = format

        const levelFormats: { [key: string]: string } = {
            alert: chalk.red("[ALERT]"),
            error: chalk.redBright("[ERROR]"),
            runtime: chalk.blue("[RUNTIME]"),
            warn: chalk.yellowBright("[WARNING]"),
            info: chalk.cyanBright("[INFO]"),
            sent: chalk.greenBright("[SENT]"),
            debug: chalk.blackBright("[DEBUG]"),
        };

        const consoleFormat = printf(({ level, message, timestamp, stack }: LogEntry & { stack?: string }) => {
            const formattedTimestamp = chalk.bgYellow.black(timestamp)
            const levelLabel = levelFormats[level] || chalk.magenta(`[${level.toUpperCase()}]`)
            return stack
                ? `${formattedTimestamp} ${levelLabel} ${message}\n${chalk.redBright(stack)}`
                : `${formattedTimestamp} ${levelLabel} ${level == "debug" ? chalk.blackBright(message) : message}`;
        })

        const fileFormat = printf(({ level, message, timestamp, stack }) => {
            return stack 
            ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n  Stack trace:\n    ${stack}`
            : `[${timestamp}] [${level.toUpperCase()}] ${message}`
        })

        this.logger = createLogger({
            level: "sent",
            levels: {
                alert: 0,
                error: 1,
                runtime: 2,
                warn: 3,
                info: 4,
                data: 5,
                sent: 6,
                debug: 7
            },
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                errors({ stack: true })
            ),
            transports: [
                new transports.Console({
                    format: consoleFormat,
                }),
                new transports.File({
                    level: "debug",
                    filename: "logs/console.log",
                    maxsize: 1024 * 1024 * 10,
                    maxFiles: 5,
                    zippedArchive: true,
                    format: combine(uncolorize(), fileFormat)
                })
            ],
            exitOnError: false,
            handleRejections: true,
            handleExceptions: true
        })

    }

    public static getInstance() {
        if (!CustomLogger.instance) {
            CustomLogger.instance = new CustomLogger()
        }
        return CustomLogger.instance
    }

    public log(level: string, message: string | Error) {
        if (message instanceof Error) {
            this.logger.log(level, message.message, { stack: message.stack });
        } else {
            this.logger.log(level, message);
        }
    }

    public alert(message: string) {
        this.log("alert", message)
    }

    public error(message: string | Error) {
        this.log("error", message)
    }

    public warn(message: string) {
        this.log("warn", message)
    }

    public info(message: string) {
        this.log("info", message)
    }

    public sent(message: string) {
        this.log("sent", message)
    }

    public debug(message: string) {
        this.log("debug", message)
    }
}

export const logger = CustomLogger.getInstance()