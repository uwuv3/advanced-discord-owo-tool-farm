import { consoleNotify } from "../feats/notify.js";
import { logger } from "../utils/logger.js";
const stopCommand = {
    name: "stop",
    description: "Stop the Tool from Running",
    execute: (agent, message, ...args) => {
        message.reply("Shutting down...");
        logger.info("User executed STOP command, shutting down...");
        consoleNotify(agent.totalCommands, agent.totalTexts, agent.readyTimestamp ?? 0);
        process.exit(0);
    }
};
export default stopCommand;
