const resumeCommand = {
    name: "resume",
    description: "Resume the Tool",
    execute: (agent, message, ...args) => {
        if (agent.paused) {
            agent.paused = false;
            agent.captchaDetected = false;
            message.reply("Tool is resume!");
            agent.main();
        }
        else
            message.reply(agent.captchaDetected
                ? "**ACTION REQUIRED!** You must solve the captcha before resuming the tool"
                : "Tool is not paused!");
    }
};
export default resumeCommand;
