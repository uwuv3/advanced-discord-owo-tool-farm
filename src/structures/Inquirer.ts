import { Configuration } from "../typings/typings.js";

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { checkbox, confirm, input, select } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";
import { Guild } from "discord.js-selfbot-v13";
import { BaseAgent } from "./BaseAgent.js";
import { checkUpdate } from "../feats/update.js";

type DataFile = Record<string, Configuration>;

export class ConfigManager {
    private folderPath = path.resolve(os.homedir(), "b2ki-ados");
    private dataPath = path.resolve(this.folderPath, "data.json");

    private static instance: ConfigManager;
    private rawData: DataFile;
    private agent: BaseAgent;

    config = {} as Configuration
    cache?: Configuration;

    // /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/g
    private webhookRegex = /https:\/\/discord.com\/api\/webhooks\/\d{17,19}\/[a-zA-Z0-9_-]{60,68}/
    private audioRegex = /\.(mp3|wav|ogg|flac|aac|wma)$/

    public static getInstance(agent: BaseAgent) {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager(agent);
        }
        return ConfigManager.instance.collectData();
    }

    constructor(agent: BaseAgent) {
        this.agent = agent;

        if (!fs.existsSync(this.folderPath)) {
            fs.mkdirSync(this.folderPath, { recursive: true });
            fs.writeFileSync(this.dataPath, JSON.stringify({}, null, 4));
        }
        const oldPath = path.resolve(os.homedir(), "data", "data.json");
        if (fs.existsSync(oldPath)) {
            try {
                const data = fs.readFileSync(oldPath);
                fs.writeFileSync(path.resolve(this.dataPath), data);
            } catch (error) {
                logger.error("Failed to bring back old config");
                logger.error(error as Error);
            }
            try {
                fs.rmdirSync(path.resolve(os.homedir(), "data"), { recursive: true });
            } catch (error) { }
        }
        this.rawData = JSON.parse(fs.readFileSync(this.dataPath, "utf-8")) as DataFile;
    }

    private listAccount = (accounts: DataFile & Record<string, { username?: string; tag?: string }>) => {
        console.clear()
        return select<"token" | undefined | string>({
            message: "Select an account: ",
            choices: [
                ...Object.keys(accounts).map((id) => ({
                    name: accounts[id].username || accounts[id].tag || id,
                    value: accounts[id].token,
                })),
                {
                    name: "New account (Sign in with Token)",
                    value: "token",
                },
                {
                    name: "New account (Sign in with QR code)",
                    value: undefined,
                },
            ],
        });
    };

    private accountAction = () => {
        console.clear()
        return select<"run" | "edit" | "export" | "delete">({
            message: "Select an action: ",
            choices: [
                {
                    name: "Run",
                    value: "run",
                    disabled: this.cache ? false : "No existing config found",
                },
                {
                    name: "Edit config",
                    value: "edit",
                },

                /**
                 * @todo export account
                 */
                {
                    name: "Export config into auto-run file",
                    value: "export",
                    disabled: this.cache ? false : "No existing config found",
                },

                /**
                 * @todo delete account selection
                 */
                {
                    name: "Delete account",
                    value: "delete",
                    disabled: this.cache ? false : "No existing config found",
                },
            ],
        });
    };

    private getToken = (cache?: string) => {
        console.clear()
        return input({
            message: "Enter your token: ",
            validate: (token) =>
                // /^(mfa\.[a-z0-9_-]{20,})|([a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})$/.test(
                //     token
                // )
                token.split(".").length === 3 ? true
                    : "Invalid Token",
            default: cache
        });
    };

    private listGuild = (cache?: string) => {
        const guilds = this.agent.guilds.cache;
        console.clear()
        return select<Guild>({
            message: "Select a guild to farm: ",
            choices: [
                ...guilds.map((guild) => ({
                    name: guild.name,
                    value: guild
                }))
            ],
            default: cache ? guilds.get(cache) : undefined

        });
    }

    private listChannel = (guild: Guild, cache?: string[]) => {
        console.clear()
        return checkbox<string>({
            required: true,
            message: "Select channels to farm (Randomly if multiple channels are selected): ",
            choices: [
                ...guild.channels.cache.filter(c => c.type == "GUILD_TEXT").map((channel) => ({
                    name: channel.name,
                    value: channel.id,
                    checked: cache?.includes(channel.id)
                }))
            ],
        });
    }

    private wayNotify = (cache?: Configuration["wayNotify"]) => {
        console.clear()
        return checkbox<Configuration["wayNotify"][number]>({
            message: "Select how you want to be notified when selfbot receives a captcha: ",
            choices: [
                {
                    name: "Music",
                    value: "music" as Configuration["wayNotify"][number],
                },
                {
                    name: "Webhook",
                    value: "webhook" as Configuration["wayNotify"][number],
                },
                {
                    name: "Direct Message (Friends Only)",
                    value: "dms" as Configuration["wayNotify"][number],
                },
                {
                    name: "Call (Friends Only)",
                    value: "call" as Configuration["wayNotify"][number],
                    disabled: true
                }
            ].map(c => ({ ...c, checked: cache?.includes(c.value) }))
        })
    }

    private musicNotify = (cache?: string) => {
        console.clear()
        return input({
            message: "Enter your music file path: ",
            validate: (path) => {
                if (!fs.existsSync(path)) return "File does not exist or unreadable"
                const stat = fs.statSync(path)
                if (stat.isDirectory()) return true
                return this.audioRegex.test(path) ? true : "Invalid music file"
            },
            default: cache || path.resolve()
        })
    }

    private musicNotify2 = (dir: string) => {
        console.clear()
        return select<string>({
            message: "Select a music file: ",
            choices: [
                { name: "..", value: path.resolve(dir, ".."), description: "Back to previous directory" },
                ...(() => {
                    const subs = fs.readdirSync(dir)
                    if (!subs.length) return [{ name: "No supported music file or directory Found", value: dir, disabled: true }]
                    return subs.map(sub => {
                        const subPath = path.resolve(dir, sub)
                        const name = fs.statSync(subPath).isDirectory() ? `${sub}\\\\` : sub
                        return {
                            name,
                            value: subPath
                        }
                    })
                })()
            ]
        })
    }

    private webhookURL = (cache?: string) => {
        console.clear()
        return input({
            message: "Enter your webhook URL: ",
            validate: (url) => this.webhookRegex.test(url) ? true : "Invalid Webhook URL",
            default: cache
        })
    }

    private getAdminID = (cache?: string) => {
        console.clear()
        return input({
            required: this.config.wayNotify.includes("call") || this.config.wayNotify.includes("dms"),
            message: "Enter user ID you want to be notified via Webhook/Call/Direct Message: ",
            validate: async (id) => {
                if (!/^\d{17,19}$/.test(id)) return "Invalid User ID"
                if (this.config.wayNotify.includes("call") || this.config.wayNotify.includes("dms")) {
                    if (id == this.agent.user?.id) return "Selfbot ID is not valid for Call/DMs option"
                    const user = await this.agent.users.fetch(id).catch(() => null)
                    if (!user) return "User not found"
                    switch (user.relationship.toString()) {
                        case "FRIEND":
                            return true
                        case "PENDING_INCOMING":
                            return await user.sendFriendRequest().catch(() => "Failed to send friend request")
                        case "PENDING_OUTGOING":
                            return "Please accept selfbot's friend request!"
                        default:
                            try {
                                await user.sendFriendRequest()
                                return "Please accept selfbot's friend request!"
                            } catch (error) {
                                return "Could not send friend request to user!"
                            }
                    }
                }
                return true
            },
            default: cache
        })
    }

    private captchaAPI = (cache?: string) => {
        console.clear()
        return select<Configuration["captchaAPI"]>({
            message: "Select a captcha solving service (Selfbot will try once): ",
            choices: [
                {
                    name: "Skip",
                    value: undefined
                },
                {
                    name: "2Captcha",
                    value: "2captcha" as Configuration["captchaAPI"]
                },
                {
                    name: "AntiCaptcha",
                    value: "anticaptcha" as Configuration["captchaAPI"],
                    disabled: true
                }
            ],
            default: cache
        })
    }

    private getAPIKey = (cache?: string) => {
        console.clear()
        return input({
            required: true,
            message: "Enter your API key: ",
            default: cache
        })
    }

    private getPrefix = (cache?: string) => {
        console.clear()
        return input({
            message: "Enter your Selfbot Prefix, Empty to skip: ",
            validate: (answer: string) => {
                if (!answer) return true;
                return /^[^0-9\s]{1,5}$/.test(answer) ? true : "Invalid Prefix"
            },
            default: cache
        })
    }

    private gemUsage = (cache?: Configuration["autoGem"]) => {
        console.clear()
        return select<Configuration["autoGem"]>({
            message: "Select gem usage: ",
            choices: [
                {
                    name: "Skip",
                    value: 0
                },
                {
                    name: "Fabled -> Common",
                    value: 1
                },
                {
                    name: "Common -> Fabled",
                    value: -1
                }
            ],
            default: cache
        })
    }

    private prayCurse = (cache?: string[]) => {
        console.clear()
        return checkbox<string>({
            message: "Select to pray/curse (randomly if multiple), Empty to skip: ",
            choices: [
                { name: "Pray selfbot account", value: `pray` },
                { name: "Curse selfbot account", value: `curse` },
                ...(this.config.adminID ? [
                    { name: "Pray notification reception", value: `pray ${this.config.adminID}` },
                    { name: "Curse notification reception", value: `curse ${this.config.adminID}` }
                ] : [])
            ].map(c => ({ ...c, checked: cache?.includes(c.value) }))
        })
    }

    private quoteAction = (cache?: Configuration["autoQuote"]) => {
        console.clear()
        return checkbox<Configuration["autoQuote"][number]>({
            message: "Select quote action: ",
            choices: [
                {
                    name: "OwO",
                    value: "owo" as Configuration["autoQuote"][number]
                },
                {
                    name: "Quote",
                    value: "quote" as Configuration["autoQuote"][number]
                },
            ].map(c => ({ ...c, checked: cache?.includes(c.value) }))
        })
    }

    private otherAction = (cache?: Configuration["autoOther"]) => {
        console.clear()
        return checkbox<Configuration["autoOther"][number]>({
            message: "Select additional command action: ",
            choices: [
                {
                    name: "Run",
                    value: "run" as Configuration["autoOther"][number]
                },
                {
                    name: "Pup",
                    value: "pup" as Configuration["autoOther"][number]
                },
                {
                    name: "Piku",
                    value: "piku" as Configuration["autoOther"][number]
                },
            ].map(c => ({ ...c, checked: cache?.includes(c.value) }))
        })
    }

    private trueFalse = (message: string, cache?: boolean) => {
        console.clear()
        return confirm({
            message: message + ": ",
            default: cache
        })
    }

    private saveData = (data: DataFile) => fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 4))

    private editConfig = async () => {
        this.config.username = this.agent.user?.username!
        this.config.token = this.agent.token!

        const guild = await this.listGuild(this.cache?.guildID)
        this.config.guildID = guild.id
        this.config.channelID = await this.listChannel(guild, this.cache?.channelID)

        this.config.wayNotify = await this.wayNotify(this.cache?.wayNotify)
        if (this.config.wayNotify.includes("music")) {
            this.config.musicPath = await this.musicNotify(this.cache?.musicPath)
            while (fs.statSync(this.config.musicPath).isDirectory()) {
                this.config.musicPath = await this.musicNotify2(this.config.musicPath)
            }
        }
        if (this.config.wayNotify.includes("webhook")) this.config.webhookURL = await this.webhookURL(this.cache?.webhookURL)
        if ((["webhook", "dms", "call"] as Configuration["wayNotify"]).some(w => this.config.wayNotify.includes(w))) 
            this.config.adminID = await this.getAdminID(this.cache?.adminID)

        this.config.captchaAPI = await this.captchaAPI(this.cache?.captchaAPI)
        if (this.config.captchaAPI) this.config.apiKey = await this.getAPIKey(this.cache?.apiKey)

        this.config.prefix = await this.getPrefix(this.cache?.prefix)

        this.config.autoGem = await this.gemUsage(this.cache?.autoGem)
        if (this.config.autoGem) this.config.autoCrate = await this.trueFalse("Toggle Automatically Use Gem Crate", this.cache?.autoCrate)
        if (this.config.autoGem) this.config.autoFCrate = await this.trueFalse("Toggle Automatically Use Fabled Crate", this.cache?.autoFCrate)

        this.config.autoOther = await this.otherAction(Array.isArray(this.cache?.autoOther) ? this.cache?.autoOther : undefined)
        this.config.autoQuote = await this.quoteAction(Array.isArray(this.cache?.autoQuote) ? this.cache.autoQuote : undefined)
        this.config.autoPray = await this.prayCurse(this.cache?.autoPray)
        this.config.autoDaily = await this.trueFalse("Toggle Automatically Claim Daily Reward", this.cache?.autoDaily)
        this.config.autoSell = await this.trueFalse("Toggle Automatically Sell once cash runs out", this.cache?.autoSell)
        this.config.autoSleep = await this.trueFalse("Toggle Automatically pause after times", this.cache?.autoSleep)
        this.config.autoReload = await this.trueFalse("Toggle Automatically reload config daily", this.cache?.autoReload)
        this.config.autoResume = await this.trueFalse("Toggle Automatically resume after captcha is solved", this.cache?.autoResume)

        this.config.token = this.agent.token!
    }

    public collectData = async () => {
        console.clear()
        await checkUpdate()

        if (Object.keys(this.rawData).length === 0) {
            const confirm = await this.trueFalse(
                `Copyright 2023 © Eternity_VN x aiko-chan-ai. All rights reserved.
Made by Vietnamese, From Github with ❤️
By using this module, you agree to our Terms of Use and accept any associated risks.
Please note that we do not take any responsibility for accounts being banned due to the use of our tools.

Do you want to continue?`, false
            )
            if (!confirm) process.exit(0)
        }

        let account = await this.listAccount(this.rawData);
        switch (account) {
            case undefined:
                break;
            case "token":
                account = await this.getToken();
            default:
                this.cache = this.rawData[Buffer.from(account.split(".")[0], "base64").toString("utf-8")]
        }

        try {
            await this.agent.checkAccount(account)
        } catch (error) {
            logger.error(error as Error)
            logger.warn("Failed to login, please try again")
            process.exit(-1)
        }

        if (!this.cache) await this.editConfig()
        else switch (await this.accountAction()) {
            case "run":
                this.config = this.cache!
                break;
            case "edit":
                await this.editConfig()
                break;
            case "export":
                const exportPath = path.resolve(process.cwd(), this.agent.user?.username + ".json")
                fs.writeFileSync(exportPath, JSON.stringify(this.cache || this.config, null, 4))
                logger.info("Config exported to: " + exportPath)
                process.exit(0)
            case "delete":
                if (this.rawData[String(this.agent.user?.id)]) {
                    delete this.rawData[String(this.agent.user?.id)]
                    fs.writeFileSync(this.dataPath, JSON.stringify(this.rawData, null, 4))
                    logger.info("Account deleted")
                } else logger.warn("No existing config found for this account, skipping deletion")
                process.exit(0)
        }

        this.rawData[String(this.agent.user?.id)] = this.config;
        this.saveData(this.rawData);
        logger.info("Data saved to: " + this.dataPath)

        return this.config;
    }
}

export const InquirerConfig = ConfigManager.getInstance;