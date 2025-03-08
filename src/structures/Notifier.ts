import { Message, MessageEmbed, WebhookClient } from "discord.js-selfbot-v13";
import { Configuration, NotifierCondition, popupOptions } from "../typings/typings.js";
import { exec, spawn } from "child_process";
import { logger } from "../utils/logger.js";
import notifier from "node-notifier";
import path from "path";
import Language from "./Language.js";

const createMusic = (musicPath: string) => {
  let command = "";
  switch (process.platform) {
    case "win32":
      command = `start ""`;
      break;
    case "linux":
      command = `xdg-open`;
      break;
    case "darwin":
      command = `afplay`;
      break;
    case "android":
      command = `termux-media-player play`;
      break;
    default:
      throw new Error(Language.__("fail.unsupportedPlatform"));
  }
  command += ` "${musicPath}"`;
  return spawn(command, { shell: true, detached: true }).unref();
};

const createPopUp = async (timestamp = Date.now(), url: string) => {
  return notifier.notify(
    {
      title: Language.__("message.captchaFound"),
      message: Language.__("message.solveBefore", { date: new Date(timestamp + 10 * 60 * 1000).toLocaleString() }),
      icon: path.resolve("doc/B2KI.png"),
      wait: true,
      ...(() => {
        switch (process.platform) {
          case "win32":
            return {
              appID: "[B2KI] Advanced Discord OwO Tool Farm",
              id: 1266,
              sound: "Notification.Looping.Call"
            };
          case "darwin":
            return {
              sound: true
            };
          default:
            return {};
        }
      })()
    },
    (err, response, metadata) => {
      if (err) {
        logger.error(Language.__("fail.showPopup"));
        logger.error(err as Error);
      }
      if (response != "dismissed" && response != "timeout") exec(`start ${url}`).unref();
    }
  );
};

export class Notifier {
  private message: Message;
  private config: Configuration;
  private status: boolean = false;
  private attachmentUrl?: string;
  private content: string;
  private unixTime: string;

  constructor(message: Message, config: Configuration, solved = false) {
    this.unixTime = `<t:${Math.floor(message.createdTimestamp / 1000 + 600)}:f>`;
    this.message = message;
    this.config = config;
    this.status = solved;
    this.attachmentUrl = message.attachments.first()?.url;
    this.content = `${config.adminID ? `<@${config.adminID}>` : ""} ${Language.__("message.captchaFoundChannel", {
      channel: `${message.channel.toString()}`
    })}`;
  }

  public playSound = async () => {
    if (!this.config.musicPath) return logger.debug(Language.__("skip.noMusicPath"));
    try {
      createMusic(this.config.musicPath);
    } catch (error) {
      logger.error(Language.__("fail.playingMusic"));
      logger.error(error as Error);
    }
  };

  public sendWebhook = async () => {
    if (!this.config.webhookURL) return logger.debug(Language.__("skip.noWebhook"));
    try {
      const webhook = new WebhookClient({ url: this.config.webhookURL });
      const embed = new MessageEmbed()
        .setTitle(Language.__("message.captchaFound"))
        .setURL(this.message.url)
        .setDescription(
          Language.__("message.status", {
            status: this.status ? Language.__("message.solved") : Language.__("message.unsolved")
          })
        )
        .addFields([
          {
            name: Language.__("message.captchaType"),
            value: this.attachmentUrl
              ? `[${Language.__("message.imageCaptcha")}](${this.message.url})`
              : `[${Language.__("message.linkCaptcha")}](https://owobot.com/captcha)`,
            inline: true
          }
        ])
        .setColor(this.status ? "GREEN" : "RED")
        .setFooter({
          text: Language.__("copyright"),
          iconURL: this.message.guild?.iconURL({ format: "png" }) ?? "https://i.imgur.com/EqChQK1.png"
        })
        .setTimestamp();

      if (this.attachmentUrl) embed.setImage(this.attachmentUrl);
      if (!this.status)
        embed.addFields({ name: Language.__("message.solveBefore", { date: "" }), value: this.unixTime });

      webhook.send({
        avatarURL: this.message.client.user?.avatarURL({ dynamic: true }) ?? "https://i.imgur.com/9wrvM38.png",
        username: "Captcha The Detective",
        content: this.config.adminID ? `<@${this.config.adminID}>` : "" + this.content,
        embeds: embed ? [embed] : embed
      });
    } catch (error) {
      logger.error(Language.__("fail.sendWebhook"));
      logger.error(error as Error);
    }
  };

  public sendDM = async () => {
    if (!this.config.adminID) return logger.debug(Language.__("skip.noAdmin"));
    const admin = this.message.client.users.cache.get(this.config.adminID);

    if (!admin) return logger.debug(Language.__("skip.noAdmin"));
    try {
      if (!admin.dmChannel) await admin.createDM();
      await admin.send({
        content:
          this.content +
          "\n" +
          Language.__("message.status", {
            status: this.status ? Language.__("message.solved") : Language.__("message.unsolved")
          }),
        files: this.attachmentUrl ? [this.attachmentUrl] : []
      });
    } catch (error) {
      logger.error(Language.__("fail.sendDM"));
      logger.error(error as Error);
    }
  };

  public callDM = async () => {
    if (!this.config.adminID) return logger.debug("skip.noAdmin");
    const admin = this.message.client.users.cache.get(this.config.adminID);

    if (!admin) return logger.debug("skip.noAdmin");
    try {
      const DM = await admin.createDM();
      await this.message.client.voice
        .joinChannel(DM, {
          selfVideo: false,
          selfDeaf: false,
          selfMute: true
        })
        .then((connection) => setTimeout(() => connection.disconnect(), 60000));
      await DM.ring();
    } catch (error: Error | any) {
      logger.error(Language.__("fail.callUser"));
      logger.error(error);
    }
  };

  public popUp = async () => {
    try {
      const message = `${Language.__("message.captchaFound")} ${Language.__("message.solveBefore", {
        date: new Date(this.message.createdTimestamp + 10 * 60 * 1000).toLocaleString()
      })}`;
      if (process.platform == "android") {
        return spawn("termux-notification", [
          "--title",
          Language.__("message.captchaFound"),
          "--content",
          message,
          "--priority",
          "high",
          "--sound",
          "--ongoing",
          "--vibrate",
          "1000,1000,1000,1000,1000",
          "--id",
          "1266",
          "--action",
          `termux-open-url ${this.message.url}`
        ]).unref();
      } else if (process.platform == "win32" || process.platform == "darwin" || process.platform == "linux") {
        return createPopUp(this.message.createdTimestamp, this.message.url.replace("https", "discord"));
      } else throw new Error(Language.__("fail.unsupportedPlatform"));
    } catch (error) {
      logger.error(Language.__("fail.showPopup"));
      logger.error(error as Error);
    }
  };

  public notify = async () => {
    const wayNotify = this.config.wayNotify;
    logger.debug(Language.__("message.enabledNotifications", { nof: wayNotify.join(", ") }));

    const notifier: NotifierCondition[] = [
      {
        condition: "music",
        callback: this.playSound
      },
      {
        condition: "webhook",
        callback: this.sendWebhook
      },
      {
        condition: "dms",
        callback: this.sendDM
      },
      {
        condition: "call",
        callback: this.callDM
      },
      {
        condition: "popup",
        callback: this.popUp
      }
    ];

    for (const { condition, callback } of notifier) if (wayNotify.includes(condition)) callback();
  };
}
