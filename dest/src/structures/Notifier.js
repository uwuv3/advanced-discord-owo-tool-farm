import { MessageEmbed, WebhookClient } from "discord.js-selfbot-v13";
import { exec, spawn } from "child_process";
import { logger } from "../utils/logger.js";
import notifier from "node-notifier";
import path from "path";
const createMusic = (musicPath) => {
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
        default: throw new Error("Unsupported Platform");
    }
    command += ` "${musicPath}"`;
    return spawn(command, { shell: true, detached: true }).unref();
};
const createPopUp = async (timestamp = Date.now(), url) => {
    return notifier.notify({
        title: "CAPTCHA DETECTED!",
        message: "Please solve the captcha before: " + new Date(timestamp + 10 * 60 * 1000).toLocaleString(),
        icon: path.resolve("doc/B2KI.png"),
        wait: true,
        ...(() => {
            switch (process.platform) {
                case "win32":
                    return {
                        appID: "[B2KI] Advanced Discord OwO Tool Farm",
                        id: 1266,
                        sound: "Notification.Looping.Call",
                    };
                case "darwin":
                    return {
                        sound: true,
                    };
                default:
                    return {};
            }
        })()
    }, (err, response, metadata) => {
        if (err) {
            logger.error("Error showing popup notification");
            logger.error(err);
        }
        if (response != "dismissed" && response != "timeout")
            exec(`start ${url}`).unref();
    });
};
export class Notifier {
    message;
    config;
    status = false;
    attachmentUrl;
    content;
    unixTime;
    constructor(message, config, solved = false) {
        this.unixTime = `<t:${Math.floor(message.createdTimestamp / 1000 + 600)}:f>`;
        this.message = message;
        this.config = config;
        this.status = solved;
        this.attachmentUrl = message.attachments.first()?.url;
        this.content = `${config.adminID ? `<@${config.adminID}>` : ""} Captcha Found in Channel: ${message.channel.toString()}`;
    }
    playSound = async () => {
        if (!this.config.musicPath)
            return logger.debug("Music path not found, skipping sound notification");
        try {
            createMusic(this.config.musicPath);
        }
        catch (error) {
            logger.error("Error playing sound notification");
            logger.error(error);
        }
    };
    sendWebhook = async () => {
        if (!this.config.webhookURL)
            return logger.debug("Webhook URL not found, skipping webhook notification");
        try {
            const webhook = new WebhookClient({ url: this.config.webhookURL });
            const embed = new MessageEmbed()
                .setTitle("CAPTCHA DETECTED!")
                .setURL(this.message.url)
                .setDescription("**Status**: " + (this.status ? "✅ **SOLVED**" : "⚠ ⚠ **UNSOLVED** ⚠ ⚠"))
                .addFields([
                { name: "Captcha type: ", value: this.attachmentUrl ? `[Image Captcha](${this.message.url})` : "[Link Captcha](https://owobot.com/captcha)" }
            ])
                .setColor("#00ddff")
                .setFooter({ text: "Copyright B2KI ADOS © since 2022", iconURL: this.message.guild?.iconURL({ format: "png" }) ?? "https://i.imgur.com/EqChQK1.png" })
                .setTimestamp();
            if (this.attachmentUrl)
                embed.setImage(this.attachmentUrl);
            if (!this.status)
                embed.addFields({ name: "Please solve the captcha before: ", value: this.unixTime });
            webhook.send({
                avatarURL: this.message.client.user?.avatarURL({ dynamic: true }) ?? "https://i.imgur.com/9wrvM38.png",
                username: "Captcha The Detective",
                content: (this.config.adminID ? `<@${this.config.adminID}>` : "" + this.content),
                embeds: embed ? [embed] : embed
            });
        }
        catch (error) {
            logger.error("Error sending webhook notification");
            logger.error(error);
        }
    };
    sendDM = async () => {
        if (!this.config.adminID)
            return logger.debug("Admin ID not found, skipping DM notification");
        const admin = this.message.client.users.cache.get(this.config.adminID);
        if (!admin)
            return logger.debug("Admin not found, skipping DM notification");
        try {
            if (!admin.dmChannel)
                await admin.createDM();
            await admin.send({
                content: (this.content + "\n**Status**: " + (this.status ? "✅ **SOLVED**" : "⚠ ⚠ **UNSOLVED** ⚠ ⚠")),
                files: this.attachmentUrl ? [this.attachmentUrl] : []
            });
        }
        catch (error) {
            logger.error("Error sending DM notification");
            logger.error(error);
        }
    };
    callDM = async () => {
        if (!this.config.adminID)
            return logger.debug("Admin ID not found, skipping call notification");
        const admin = this.message.client.users.cache.get(this.config.adminID);
        if (!admin)
            return logger.debug("Admin not found, skipping DM notification");
        try {
            const DM = await admin.createDM();
            await this.message.client.voice.joinChannel(DM, {
                selfVideo: false,
                selfDeaf: false,
                selfMute: true,
            }).then(connection => setTimeout(() => connection.disconnect(), 60000));
            await DM.ring();
        }
        catch (error) {
            logger.error("Error calling user");
            logger.error(error);
        }
    };
    popUp = async () => {
        try {
            const message = "CAPTCHA DETECTED! Please solve the captcha before: " + new Date(this.message.createdTimestamp + 10 * 60 * 1000).toLocaleString();
            if (process.platform == "android") {
                return spawn("termux-notification", [
                    "--title", "CAPTCHA DETECTED!",
                    "--content", message,
                    "--priority", "high",
                    "--sound", "--ongoing",
                    "--vibrate", "1000,1000,1000,1000,1000",
                    "--id", "1266",
                    "--action", `termux-open-url ${this.message.url}`,
                ]).unref();
            }
            else if (process.platform == "win32" || process.platform == "darwin" || process.platform == "linux") {
                return createPopUp(this.message.createdTimestamp, this.message.url.replace("https", "discord"));
            }
            else
                throw new Error("Unsupported Platform");
        }
        catch (error) {
            logger.error("Error showing popup notification");
            logger.error(error);
        }
    };
    notify = async () => {
        const wayNotify = this.config.wayNotify;
        logger.debug("Enabled notifications: " + wayNotify.join(", "));
        const notifier = [
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
        for (const { condition, callback } of notifier)
            if (wayNotify.includes(condition))
                callback();
    };
}
