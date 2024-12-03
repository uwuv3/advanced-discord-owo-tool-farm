import { ClientOptions, DMChannel, Message, TextChannel } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";

export type agentOptions = {
    options?: ClientOptions;
};

export type sendOptions = {
    withPrefix?: boolean;
    channel?: TextChannel | DMChannel;
    delay?: number;
};

export type CommandCondition = {
    condition: () => boolean;
    action: () => Promise<any>;
};
export type Commands = {
    name: string;
    description: string;
    // usage: string;
    execute: (agent: BaseAgent, message: Message, ...args: string[]) => any;
};

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
    autoSell: true,
    autoOther: ["run", "pup", "piku"],
    autoSleep: true,
    autoReload: true,
    autoResume: true
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
    autoSell: boolean
    autoOther: Array<"run" | "pup" | "piku">
    autoSleep: boolean
    autoReload: boolean
    autoResume: boolean
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