import { Commands } from "../typings/typings.js";

const resumeCommand:Commands = {
    name: "resume",
    description: "Resume the Tool",
    execute: (agent, message, ...args) => {
        if(agent.paused) {
            agent.paused = false
            agent.captchaDetected = false
            message.reply("Tool will be resumed in a few seconds!")
       //     agent.main()
        } else message.reply(
            agent.captchaDetected 
            ? "**ACTION REQUIRED!** You must solve the captcha before resuming the tool" 
            : "Tool is not paused!"
        )
    }
}

export default resumeCommand;