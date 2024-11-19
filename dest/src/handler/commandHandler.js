import { logger } from "../utils/logger.js";
export const commandHandler = async (agent) => {
    agent.on("messageCreate", async (message) => {
        if (!agent.config.prefix || message.content.startsWith(agent.config.prefix))
            return;
        if (message.author.id != agent.config.adminID &&
            message.author.id != message.client.user?.id)
            return;
        const args = message.content
            .slice(agent.config.prefix.length)
            .trim()
            .split(/ +/);
        const command = agent.commands.get(args.shift()?.toLowerCase() ?? "");
        if (!command)
            return;
        try {
            command.execute(message, args);
        }
        catch (error) {
            logger.error("Error executing command: " + command);
            logger.error(error);
        }
    });
};
