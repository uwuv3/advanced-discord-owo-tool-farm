//@ts-ignore
import decryptCaptcha from "../security/decrypt.js";
const solveCommand = {
    name: "solve",
    description: "Retry solving HCaptcha",
    execute: async (agent, message, ...args) => {
        if (!agent.captchaDetected)
            return message.reply("No captcha detected");
        try {
            await decryptCaptcha(message, agent.config);
            message.reply("✅ Captcha solved!");
        }
        catch (error) {
            console.error(error);
            message.reply("❌ Attempt to solve captcha failed.");
        }
    }
};
export default solveCommand;
