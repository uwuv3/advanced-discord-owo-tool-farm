import { Message } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";

import { logger } from "../utils/logger.js";
import { consoleNotify, selfbotNotify } from "../feats/notify.js";
import { solveImage } from "../feats/captcha.js";
//@ts-ignore
import decryptCaptcha from "../security/decrypt.js";
import Language from "../structures/Language.js";

export const owoHandler = async (agent: BaseAgent) => {
  agent.on("messageCreate", async (message) => {
    if (message.author.id != agent.owoID) return;
    if (
      !(
        message.channel.type == "DM" ||
        message.content.includes(message.client.user?.id!) ||
        message.content.includes(message.client.user?.username!) ||
        message.content.includes(message.client.user?.displayName!) ||
        message.content.includes(message.guild?.members.me?.displayName!)
      )
    )
      return;

    const normalized = message.content.replace(/[\p{Cf}\p{Cc}\p{Zl}\p{Zp}\p{Cn}]/gu, "");

    if (/are you a real human|(check|verify) that you are.{1,3}human!/gim.test(normalized)) {
      logger.alert(
        Language.__("message.captchaFoundChannel", {
          channel: `${message.channel.type == "DM" ? message.channel.recipient.displayName : message.channel.name}`
        })
      );
      consoleNotify(agent.totalCommands, agent.totalTexts, agent.totalCaptcha, agent.readyTimestamp ?? 0);

      if (!agent.config.autoResume && !agent.config.captchaAPI) {
        if (agent.config.wayNotify.length) await selfbotNotify(message, agent.config);
        process.emit("SIGINT");
      }
      agent.captchaDetected = true;

      if (!agent.config.captchaAPI) {
        await selfbotNotify(message, agent.config);
        return logger.info(Language.__("message.waitingCaptcha"));
      }

      try {
        const attachmentUrl = message.attachments.first()?.url;
        if (attachmentUrl) {
          const res = (await solveImage(attachmentUrl, agent.config)) as string;

          const owo = message.client.users.cache.get(agent.owoID);
          if (!owo) throw new Error(Language.__("fail.reachOwODmChannel"));

          const owoDM = await owo.createDM();
          await agent.send(res, { withPrefix: false, channel: owoDM });

          await new Promise((resolve, reject) => {
            const collector = owoDM.createMessageCollector({
              filter: (msg: Message) =>
                msg.author.id == agent.owoID && /verified that you are.{1,3}human!/gim.test(msg.content),
              max: 1,
              time: 30_000
            });
            collector.once("end", (collection) => {
              if (collection.size === 0) reject(Language.__("fail.timedOutCaptchaAnswer"));
              resolve(collection.size);
            });
          });
        } else if (
          /(https?:\/\/[^\s]+)/g.test(normalized) ||
          (message.components.length > 0 &&
            message.components[0].components[0] &&
            message.components[0].components[0].type == "BUTTON" &&
            message.components[0].components[0].style == "LINK" &&
            message.components[0].components[0].label?.includes("Verify"))
        )
          await decryptCaptcha(message, agent.config);
        else throw new Error(Language.__("fail.noSourceDetedted"));

        agent.totalCaptcha.resolved++;
        selfbotNotify(message, agent.config, true);
      } catch (error: Error | any) {
        logger.warn(Language.__("fail.solveCaptcha")  + error.message);
        logger.alert(Language.__("fail.attemptSolveCaptcha"));
        logger.info(Language.__("message.waitingCaptcha"));

        agent.totalCaptcha.unsolved++;
        selfbotNotify(message, agent.config);
      }
    } else if (/verified that you are.{1,3}human!/gim.test(normalized)) {
      logger.info(
       Language.__("message.captchaSolved",{next: agent.config.autoResume ? Language.__("message.restartig") : Language.__("message.exiting")})
      );
      if (!agent.config.autoResume) process.exit(0);
      agent.captchaDetected = false;
      agent.main();
    } else if (/have been banned/.test(normalized)) {
      logger.alert(`${Language.__("message.banned")}, ${Language.__("message.exiting")}...`);
      process.exit(-1);
    } else if (normalized.includes("You don't have enough cowoncy!")) {
      if (agent.config.autoSell) await agent.send("sell all");
      else {
        logger.warn(Language.__("message.cowoncyRanOut"));
        consoleNotify(agent.totalCommands, agent.totalTexts, agent.totalCaptcha, agent.readyTimestamp ?? 0);
        process.exit(-1);
      }
    }
  });
};
