export const dmsHandler = async (agent) => {
    agent.on("messageCreate", async (message) => {
        if (!agent.captchaDetected || message.channel.type != "DM")
            return;
        if (!agent.config.adminID || message.author.id != agent.config.adminID)
            return;
        if (/^[a-zA-Z]{3,6}$/.test(message.content)) {
            const owo = message.client.users.cache.get(agent.owoID);
            const owoDM = await owo?.createDM();
            if (!owo || !owoDM) {
                message.reply("Failed to Reach OwO DM Channel");
                return;
            }
            await agent.send(message.content, { withPrefix: false, channel: owoDM });
            let filter = (m) => m.author.id === agent.owoID && m.channel.type == 'DM' && /(wrong verification code!)|(verified that you are.{1,3}human!)|(have been banned)/gim.test(m.content);
            const collector = owoDM.createMessageCollector({ filter, time: 30_000, max: 1 });
            collector.once("collect", (m) => {
                message.reply(m.content);
            });
        }
    });
};
