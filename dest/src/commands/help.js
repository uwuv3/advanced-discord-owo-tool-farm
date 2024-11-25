const helpCommand = {
    name: "help",
    description: "List of Tool Commands",
    execute: (agent, message, ...args) => {
        let document = "";
        const listCommand = Object.keys(agent.commands);
        for (const command of listCommand)
            document += `**${command}:** ${agent.commands.get(command)?.description}\n`;
        document += "Join Our Support Server For Help: https://discord.gg/Yr92g5Zx3e";
        if (args[0])
            message.reply(listCommand.includes(args[0])
                ? `**${args[0]}:** ${agent.commands.get(args[0])?.description}`
                : "Command Not Found!");
        else
            message.reply(document);
    }
};
export {};
