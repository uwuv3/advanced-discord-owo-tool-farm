import { ClientOptions, DMChannel, Message, TextChannel } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";

export type AgentOptions = {
    options?: ClientOptions;
};

export type SendOptions = {
    withPrefix?: boolean;
    channel?: TextChannel | DMChannel;
    delay?: number;
};

export type NotifierCondition = {
    condition: Configuration["wayNotify"][number]
    callback: () => any
}

export type CommandCondition = {
    condition: boolean;
    action: () => any;
};

export type Commands = {
    name: string;
    description: string;
    execute: (agent: BaseAgent, message: Message, ...args: string[]) => any;
};

export type QuestTypes =  "xp" | "hunt" | "battle" | "owo" | "action" | "gamble" | "unsupported"

export const defaultConfig: Configuration = {
    username: "",
    token: "",
    guildID: "",
    channelID: [""],
    wayNotify: ["webhook"],
    musicPath: "",
    webhookURL: "",
    prefix: "!",
    adminID: "",
    captchaAPI: "2captcha",
    apiKey: "",
    autoPray: ["pray"],
    autoGem: 1,
    autoCrate: true,
    autoFCrate: true,
    autoQuote: ["owo", "quote"],
    autoDaily: true,
    autoQuest: true,
    autoCookie: true,
    autoClover: true,
    autoOther: ["run", "pup", "piku"],
    autoSell: true,
    autoSleep: true,
    autoReload: true,
    autoResume: true,
    showRPC: true
}

export interface Configuration {
    username: string
    token: string
    guildID: string
    channelID: string[]
    wayNotify: Array<"webhook" | "dms" | "call" | "music">
    webhookURL?: string
    musicPath?: string
    prefix?: string
    adminID?: string
    captchaAPI?: "2captcha" | "anticaptcha"
    apiKey: string
    autoPray: string[]
    autoGem: 0 | 1 | -1
    autoCrate?: boolean
    autoFCrate?: boolean
    autoQuote: Array<"owo" | "quote">
    autoDaily: boolean
    autoQuest: boolean
    autoCookie: boolean
    autoClover: boolean
    autoSell: boolean
    autoOther: Array<"run" | "pup" | "piku">
    autoSleep: boolean
    autoReload: boolean
    autoResume: boolean
    showRPC: boolean
}
// export interface Configuration {
//     tag: string
//     token: string
//     guildID: string
//     channelID: string[]
//     wayNotify: number[]
//     musicPath?: string
//     webhookURL?: string
//     userNotify?: string
//     captchaAPI: number
//     apiUser?: string
//     apiKey?: string
//     apiNCAI?: string
//     cmdPrefix?: string
//     autoPray: string[]
//     autoGem: number
//     autoCrate?: boolean
//     autoHunt:boolean
//     upgradeTrait?: number
//     autoGamble: string[]
//     gamblingAmount: string
//     autoSell: boolean
//     autoSlash: boolean
//     autoQuote: boolean
//     autoDaily: boolean
//     autoOther: boolean
//     autoSleep: boolean
//     autoReload: boolean
//     autoResume: boolean
// }