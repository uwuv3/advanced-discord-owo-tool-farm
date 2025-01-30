import { Message } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";

import { logger } from "../utils/logger.js";
import { consoleNotify, selfbotNotify } from "../feats/notify.js";
import { solveImage } from "../feats/captcha.js";
import decryptCaptcha from "../security/decrypt.js";

export const owoHandler = async (agent: BaseAgent) => {
    agent.on("messageCreate", async (message) => {
        if (message.author.id != agent.owoID) return;
        if (!(
            message.channel.type == "DM" ||
            message.content.includes(message.client.user?.id!) ||
            message.content.includes(message.client.user?.username!) ||
            message.content.includes(message.client.user?.displayName!) ||
            message.content.includes(message.guild?.members.me?.displayName!)
        )) return;

        const normalized = message.content.replace(/[\p{Cf}\p{Cc}\p{Zl}\p{Zp}\p{Cn}]/gu, "");

        if (/are you a real human|(check|verify) that you are.{1,3}human!/img.test(normalized)) {
            logger.alert(`Captcha Found in channel: ${message.channel.type == "DM" ? message.channel.recipient.displayName : message.channel.name}!`)
            consoleNotify(agent.totalCommands, agent.totalTexts, agent.readyTimestamp ?? 0)

            if (!agent.config.autoResume && !agent.config.captchaAPI) {
                if (agent.config.wayNotify.length) await selfbotNotify(message, agent.config)
                process.emit("SIGINT")
            };
            agent.captchaDetected = true

            if (!agent.config.captchaAPI) {
                await selfbotNotify(message, agent.config)
                return logger.info("WAITING FOR THE CAPTCHA TO BE RESOLVED TO RESTART...")
            }

            try {
                const attachmentUrl = message.attachments.first()?.url
                if (attachmentUrl) {
                    const res = await solveImage(attachmentUrl, agent.config) as string

                    const owo = message.client.users.cache.get(agent.owoID)
                    if (!owo) throw new Error("Failed to Reach OwO DM Channel");

                    const owoDM = await owo.createDM()
                    await agent.send(res, { withPrefix: false, channel: owoDM })

                    await new Promise((resolve, reject) => {
                        const collector = owoDM.createMessageCollector({
                            filter: (msg: Message) => msg.author.id == agent.owoID && /verified that you are.{1,3}human!/igm.test(msg.content),
                            max: 1, time: 30_000
                        })
                        collector.once("end", (collection) => {
                            if (collection.size === 0) reject("30s Timed out, No Response For Captcha Answer")
                            resolve(collection.size)
                        })
                    })
                    
                } else if (
                    /(https?:\/\/[^\s]+)/g.test(normalized) 
                    || (
                        message.components.length > 0 && message.components[0].components[0]
                        && message.components[0].components[0].type == "BUTTON" && message.components[0].components[0].style == "LINK"
                        && message.components[0].components[0].label?.includes("Verify")
                    )
                ) await decryptCaptcha(message, agent.config)
                else throw new Error("No Image/Link Detected in Captcha Message")

                selfbotNotify(message, agent.config, true)
            } catch (error: Error | any) {
                logger.warn("Error Solving Captcha: " + error.message)
                logger.alert("Attempt to solve captcha failed!")
                logger.info("WAITING FOR THE CAPTCHA TO BE RESOLVED TO RESTART...")
                selfbotNotify(message, agent.config)
            }
        }

        else if (/verified that you are.{1,3}human!/igm.test(normalized)) {
            logger.info(`CAPTCHA HAS BEEN RESOLVED, ${agent.config.autoResume ? "RESTARTING SELFBOT" : "STOPPING SELFBOT"}...`)
            if (!agent.config.autoResume) process.exit(0)
            agent.captchaDetected = false
          //  agent.main()
        }

        else if (/have been banned/.test(normalized)) {
            logger.alert("ACCOUNT HAS BEEN BANNED, STOPPING SELFBOT...")
            process.exit(-1)
        }

        else if (normalized.includes("You don't have enough cowoncy!")) {
            if (agent.config.autoSell) await agent.send("sell all")
            else {
                logger.warn("Cowoncy ran out! Stoping Selfbot...")
                consoleNotify(agent.totalCommands, agent.totalTexts, agent.readyTimestamp ?? 0)
                process.exit(-1)
            }
        }
    })
}