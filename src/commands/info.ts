import { timeHandler } from "../utils/utils.js";
import { Commands } from "../typings/typings.js";

const infoCommand: Commands = {
    name: "info",
    description: "Tool Information",
    execute: (agent, message, ...args) => {
        const status = agent.captchaDetected ? agent.paused ? "**PAUSED**" : "**PENDING CAPTCHA**" : "HUNTING";
        const summary = `__Total commands/texts sent:__ **${agent.totalCommands}/${agent.totalTexts}**`;
        const uptime = timeHandler(agent.readyTimestamp ?? 0, Date.now());
        message.reply([status, summary, uptime].join("\n"));
    }
}

export default infoCommand;