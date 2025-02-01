import path from "path";
import { getFiles } from "../utils/utils.js";
import { fileURLToPath } from "url";
import { Collection } from "discord.js-selfbot-v13";
import { Commands } from "../typings/typings.js";
// import { logger } from "../utils/logger.js";

export const loadCommands = async (): Promise<Collection<string, Commands>> => {
	const suffix = ".js";
	const files = getFiles(
		path.resolve(fileURLToPath(import.meta.url), "..", "..", "commands"),
		suffix
	);
	const commands: Collection<string, Commands> = new Collection();

	for (const file of files) {
		let command = await import(`file://${file}`);
		if (command.default) command = command.default;
		commands.set(command.name, command);
	}
	return commands;
};
