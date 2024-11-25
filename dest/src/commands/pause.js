const pauseCommand = {
    name: "pause",
    description: "Pause the Tool",
    execute: (agent, message, ...args) => {
        if (agent.captchaDetected) {
            message.reply(agent.paused
                ? "Tool is already paused!"
                : "**ACTION REQUIRED!** You must solve the captcha before pausing the tool");
        }
        else {
            agent.captchaDetected = true;
            agent.paused = true;
            message.reply("Tool is paused!");
        }
    }
};
export default pauseCommand;
