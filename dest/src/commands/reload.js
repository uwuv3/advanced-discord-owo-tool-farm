const reloadCommand = {
    name: "reload",
    description: "Reload The Configuration",
    execute: async (agent, message, ...args) => {
        const attempt = await agent.aReload(true);
        if (attempt)
            message.reply("The configuration has been refreshed successfully");
        else
            message.reply("Failed to refresh the configuration");
    }
};
export default reloadCommand;
