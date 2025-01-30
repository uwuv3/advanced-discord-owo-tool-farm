import { consoleNotify } from "../feats/notify.js"
import { Commands } from "../typings/typings.js"
import { logger } from "../utils/logger.js"

const stopCommand: Commands = {
    name: "stop",
    description: "Stop the Tool from Running",
    execute: (agent, message, ...args) => {
        message.reply("Shutting down...")
        logger.info("User executed STOP command, shutting down...")

        consoleNotify(agent.totalCommands, agent.totalTexts, agent.readyTimestamp ?? 0)
        return process.exit(0)
    }
}

export default stopCommand;