import path from "path";
import { getFiles } from "../utils/utils.js";
import { fileURLToPath } from "url";
import { Collection } from "discord.js-selfbot-v13";
import { logger } from "../utils/logger.js";
export const loadCommands = async () => {
    const suffix = ".js";
    const files = getFiles(path.resolve(fileURLToPath(import.meta.url), "..", "..", "commands"), suffix);
    const commands = new Collection();
    for (const file of files) {
        let command = await import(`file://${file}`);
        if (command.default)
            command = command.default;
        commands.set(command.name, command);
    }
    logger.info(`Loaded ${commands.size} commands`);
    return commands;
};
