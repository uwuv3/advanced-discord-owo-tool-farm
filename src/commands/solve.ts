import { Commands } from "../typings/typings.js"
let find = false;
let decryptCaptcha = async (...args:any)=>{
    console.log(`No Captcha solver provided`)
}
const solveCommand: Commands = {
    name: "solve",
    description: "Retry solving HCaptcha",
    execute: async (agent, message, ...args) => {
        if(!agent.captchaDetected) return message.reply("No captcha detected")
        try {
            if(!find) {
                try {
                    //@ts-ignore
                    decryptCaptcha = await import("../security/decrypt.js");
                    find = true
    
                    console.log(decryptCaptcha.toString())
                    
                } catch (error) {
                    
                }
            }
            await decryptCaptcha(message, agent.config)
            message.reply("✅ Captcha solved!")
        } catch (error) {
            console.error(error)
            message.reply("❌ Attempt to solve captcha failed.")
        }
    }
}

export default solveCommand;