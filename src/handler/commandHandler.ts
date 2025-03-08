import { BaseAgent } from "../structures/BaseAgent.js";
import Language from "../structures/Language.js";
import { logger } from "../utils/logger.js";

export const commandHandler = async (agent: BaseAgent) => {
    agent.on("messageCreate", async (message) => {
        if (!agent.config.prefix || !message.content.startsWith(agent.config.prefix))
            return;
        if (
            message.author.id != agent.config.adminID &&
            message.author.id != message.client.user?.id
        )
            return;

        logger.debug(Language.__("message.usedCommand",{user: message.author.username,command:message.content}));  

        const args = message.content
            .slice(agent.config.prefix.length)
            .trim()
            .split(/ +/);
        const command = agent.commands.get(args.shift()?.toLowerCase() ?? "");
        if (!command) return;
        try {
            command.execute(agent, message, ...args);
        } catch (error) {
            logger.error(Language.__("fail.executeCommand") + ": " + command);
            logger.error(error as Error);
        }
    });
};
