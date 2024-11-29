import { Commands } from "../typings/typings.js";
import { logger } from "../utils/logger.js";

const pauseCommand: Commands = {
    name: "pause",
    description: "Pause the Tool",
    execute: (agent, message, ...args) => {
        if(agent.captchaDetected) {
            message.reply(
                agent.paused 
                ? "Tool is already paused!" 
                : "**ACTION REQUIRED!** You must solve the captcha before pausing the tool"
            )
        } else {
            agent.captchaDetected = true
            agent.paused = true
            logger.info("Tool paused (user request)")
            message.reply("Tool is paused!")
        }
    }
}

export default pauseCommand;