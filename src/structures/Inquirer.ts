import { Configuration } from "../typings/typings.js";

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { checkbox, confirm, input, select } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";
import { Guild } from "discord.js-selfbot-v13";
import { BaseAgent } from "./BaseAgent.js";
import Language from "./Language.js";
type DataFile = Record<string, Configuration>;

export class ConfigManager {
  private folderPath = path.resolve(os.homedir(), "b2ki-ados");
  private dataPath = path.resolve(this.folderPath, "data.json");

  private static instance: ConfigManager;
  private rawData: DataFile;
  private agent: BaseAgent;

  config = {} as Configuration;
  cache?: Configuration;

  // /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/g
  private webhookRegex = /https:\/\/discord.com\/api\/webhooks\/\d{17,19}\/[a-zA-Z0-9_-]{60,68}/;
  private audioRegex = /\.(mp3|wav|ogg|flac|aac|wma)$/;

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
    }
    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, JSON.stringify({}, null, 4));
    }
    const oldPath = path.resolve(os.homedir(), "data", "data.json");
    if (fs.existsSync(oldPath)) {
      try {
        const data = fs.readFileSync(oldPath);
        fs.writeFileSync(path.resolve(this.dataPath), data);
      } catch (error) {
        logger.error(Language.__("fail.bringOldData"));
        logger.error(error as Error);
      }
      try {
        fs.rmdirSync(path.resolve(os.homedir(), "data"), { recursive: true });
      } catch (error) {}
    }
    this.rawData = JSON.parse(fs.readFileSync(this.dataPath, "utf-8")) as DataFile;
  }

  private listAccount = (accounts: DataFile & Record<string, { username?: string; tag?: string }>) => {
    console.clear();
    return select<"token" | undefined | string>({
      message: `${Language.__("question.selectAccount")}: `,
      choices: [
        ...Object.keys(accounts).map((id) => ({
          name: accounts[id].username || accounts[id].tag || id,
          value: accounts[id].token
        })),
        {
          name: `${Language.__("answer.newAccount")}`,
          value: "!token"
        },

        {
          name: `${Language.__("answer.newAccountQR")}`,
          value: undefined
        },
        {
          name: `${Language.__("answer.selectLanguage")}`,
          value: "!language"
        }
      ]
    });
  };

  private accountAction = () => {
    console.clear();
    return select<"run" | "edit" | "export" | "delete">({
      message: `${Language.__("question.selectAction")}`,
      choices: [
        {
          name: `${Language.__("answer.runAccount")}`,
          value: "run",
          disabled: this.cache ? false : Language.__("fail.noExistsConfig")
        },
        {
          name: "Edit config",
          value: "edit"
        },
        {
          name: Language.__("answer.exportAccount"),
          value: "export",
          disabled: this.cache ? false : Language.__("fail.noExistsConfig")
        },
        {
          name: Language.__("answer.deleteAccount"),
          value: "delete",
          disabled: this.cache ? false : Language.__("fail.noExistsConfig")
        }
      ]
    });
  };

  private getToken = (cache?: string) => {
    console.clear();
    return input({
      message: Language.__("question.enterToken"),
      validate: (token) =>
        // /^(mfa\.[a-z0-9_-]{20,})|([a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})$/.test(
        //     token
        // )
        token.split(".").length === 3 ? true : Language.__("fail.invalidToken"),
      default: cache
    });
  };

  private listGuild = (cache?: string) => {
    const guilds = this.agent.guilds.cache;
    console.clear();
    return select<Guild>({
      message: Language.__("select.guildToFarm"),
      choices: [
        ...guilds.map((guild) => ({
          name: guild.name,
          value: guild
        }))
      ],

      default: cache ? guilds.get(cache) : undefined
    });
  };

  private listChannel = (guild: Guild, cache?: string[]) => {
    console.clear();
    return checkbox<string>({
      required: true,
      message: Language.__("select.channelToFarm"),
      //blud forgot to add permission
      choices: [
        ...guild.channels.cache
          .filter((c) => c.type == "GUILD_TEXT")
          .filter(
            (c) =>
              c.permissionsFor(guild.client.user!)?.has("SEND_MESSAGES") &&
              c.permissionsFor(guild.client.user!)?.has("VIEW_CHANNEL")
          )
          .map((channel) => ({
            name: channel.name,
            value: channel.id,
            checked: cache?.includes(channel.id)
          }))
      ]
    });
  };

  private wayNotify = (cache?: Configuration["wayNotify"]) => {
    console.clear();
    return checkbox<Configuration["wayNotify"][number]>({
      message: Language.__("select.wayNotify"),
      choices: [
        {
          name: Language.__("option.wayNotifyPopup"),
          value: "popup" as Configuration["wayNotify"][number]
        },
        {
          name: Language.__("option.wayNotifyMusic"),
          value: "music" as Configuration["wayNotify"][number]
        },
        {
          name: Language.__("option.wayNotifyWebhook"),
          value: "webhook" as Configuration["wayNotify"][number]
        },
        {
          name: Language.__("option.wayNotifyDirectMessage"),
          value: "dms" as Configuration["wayNotify"][number]
        },
        {
          name: Language.__("option.wayNotifyCall"),
          value: "call" as Configuration["wayNotify"][number]
        }
      ].map((c) => ({ ...c, checked: cache?.includes(c.value) }))
    });
  };

  private musicNotify = (cache?: string) => {
    console.clear();
    return input({
      message: Language.__("question.musicPath"),
      validate: (path) => {
        if (!fs.existsSync(path)) return Language.__("file.nonReadable");
        const stat = fs.statSync(path);
        if (stat.isDirectory()) return true;
        return this.audioRegex.test(path) ? true : Language.__("fail.invalidMusic");
      },
      default: cache || path.resolve()
    });
  };

  private musicNotify2 = (dir: string) => {
    console.clear();
    return select<string>({
      message: Language.__("question.musicPath"),
      choices: [
        { name: "..", value: path.resolve(dir, ".."), description: Language.__("option.backPreviousDir") },
        ...(() => {
          const subs = fs.readdirSync(dir);
          if (!subs.length) return [{ name: Language.__("fail.noMusicOrDirFound"), value: dir, disabled: true }];
          return subs.map((sub) => {
            const subPath = path.resolve(dir, sub);
            const name = fs.statSync(subPath).isDirectory() ? `${sub}\\\\` : sub;
            return {
              name,
              value: subPath
            };
          });
        })()
      ]
    });
  };

  private webhookURL = (cache?: string) => {
    console.clear();
    return input({
      message: Language.__("question.enterWebhook"),
      validate: (url) => (this.webhookRegex.test(url) ? true : Language.__("fail.invalidWebhookURL")),
      default: cache
    });
  };

  private getAdminID = (cache?: string) => {
    console.clear();

    const criticalWayNotify = (<Configuration["wayNotify"]>["call", "dms"]).some((w) =>
      this.config.wayNotify.includes(w)
    );

    const subquestion =
      "\n" +
      (this.config.autoCookie ? Language.__("subquestion.cookie") + (this.config.autoClover ? "\n" : "") : "") +
      (this.config.autoClover ? Language.__("subquestion.clover") + (criticalWayNotify ? "\n" : "") : "") +
      (criticalWayNotify ? Language.__("subquestion.notify") : "");
    const message = Language.__("question.enterAdminID", {
      action: subquestion
    });
    //(<Configuration["wayNotify"]>["webhook", ...criticalWayNotify]).some(w => this.config.wayNotify.includes(w))

    return input({
      required: criticalWayNotify || this.config.autoCookie || this.config.autoClover,
      message,
      validate: async (id) => {
        if (!/^\d{17,19}$/.test(id)) return Language.__("fail.invalidUserID");
        if (this.config.wayNotify.includes("call") || this.config.wayNotify.includes("dms")) {
          if (id == this.agent.user?.id) return Language.__("fail.cannotUseSelfbotAccount");
          const user = await this.agent.users.fetch(id).catch(() => null);
          if (!user) return Language.__("fail.invalidUserID");
          switch (user.relationship.toString()) {
            case "FRIEND":
              return true;
            case "PENDING_INCOMING":
              return await user.sendFriendRequest().catch(() => Language.__("fail.sendFriendRequest"));
            case "PENDING_OUTGOING":
              return Language.__("fail.acceptUserRequest");
            default:
              try {
                await user.sendFriendRequest();
                return Language.__("fail.acceptUserRequest");
              } catch (error) {
                return Language.__("fail.sendFriendRequest");
              }
          }
        }
        return true;
      },
      default: cache
    });
  };

  private captchaAPI = (cache?: string) => {
    console.clear();
    return select<Configuration["captchaAPI"]>({
      message: Language.__("select.captchaSolvingService"),
      choices: [
        {
          name: Language.__("option.skip"),
          value: undefined
        },
        {
          name: "2Captcha",
          value: "2captcha" as Configuration["captchaAPI"]
        }
        // {
        //     name: "AntiCaptcha",
        //     value: "anticaptcha" as Configuration["captchaAPI"],
        //     disabled: true
        // }
      ],
      default: cache
    });
  };

  private getAPIKey = (cache?: string) => {
    console.clear();
    return input({
      required: true,
      message: Language.__("question.enterAPIKey"),
      default: cache
    });
  };

  private getPrefix = (cache?: string) => {
    console.clear();
    return input({
      message: Language.__("question.selfbotPrefix"),
      validate: (answer: string) => {
        if (!answer) return true;
        return /^[^0-9\s]{1,5}$/.test(answer) ? true : Language.__("fail.invalidPrefix");
      },
      default: cache
    });
  };
  private getOwOPrefix = (cache?: string) => {
    console.clear();
    return input({
      message: Language.__("question.owoPrefix"),
      validate: (answer: string) => {
        if (!answer) return true;
        return /^[^0-9\s]{1,5}$/.test(answer) ? true : Language.__("fail.invalidPrefix");
      },
      default: cache
    });
  };
  private gemUsage = (cache?: Configuration["autoGem"]) => {
    console.clear();
    return select<Configuration["autoGem"]>({
      message: Language.__("select.gemUsage"),
      choices: [
        {
          name: Language.__("option.skip"),
          value: 0
        },
        {
          name: Language.__("option.fabledtocommon"),
          value: 1
        },
        {
          name: Language.__("option.commontofabled"),
          value: -1
        }
      ],
      default: cache
    });
  };

  private prayCurse = (cache?: string[]) => {
    console.clear();
    return checkbox<string>({
      message: Language.__("select.prayCurse"),
      choices: [
        { name: Language.__("option.praySelf"), value: `pray` },
        { name: Language.__("option.curseSelf"), value: `curse` },
        ...(this.config.adminID
          ? [
              { name: Language.__("option.prayAdmin"), value: `pray ${this.config.adminID}` },
              { name: Language.__("option.curseAdmin"), value: `curse ${this.config.adminID}` }
            ]
          : [])
      ].map((c) => ({ ...c, checked: cache?.includes(c.value) }))
    });
  };

  private quoteAction = (cache?: Configuration["autoQuote"]) => {
    console.clear();
    return checkbox<Configuration["autoQuote"][number]>({
      message: Language.__("select.quote"),
      choices: [
        {
          name: Language.__("option.owo"),
          value: "owo" as Configuration["autoQuote"][number]
        },
        {
          name: Language.__("option.random"),
          value: "quote" as Configuration["autoQuote"][number]
        }
      ].map((c) => ({ ...c, checked: cache?.includes(c.value) }))
    });
  };

  private otherAction = (cache?: Configuration["autoOther"]) => {
    console.clear();
    return checkbox<Configuration["autoOther"][number]>({
      message: Language.__("select.other"),
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
        }
      ].map((c) => ({ ...c, checked: cache?.includes(c.value) }))
    });
  };

  private trueFalse = (message: string, cache?: boolean) => {
    console.clear();
    return confirm({
      message: message + ": ",
      default: cache
    });
  };

  private saveData = (data: DataFile) => fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 4));

  private editConfig = async () => {
    this.config.username = this.agent.user?.username!;
    this.config.token = this.agent.token!;

    const guild = await this.listGuild(this.cache?.guildID);
    this.config.guildID = guild.id;
    this.config.channelID = await this.listChannel(guild, this.cache?.channelID);

    this.config.wayNotify = await this.wayNotify(this.cache?.wayNotify);
    if (this.config.wayNotify.includes("music")) {
      this.config.musicPath = await this.musicNotify(this.cache?.musicPath);
      while (fs.statSync(this.config.musicPath).isDirectory()) {
        this.config.musicPath = await this.musicNotify2(this.config.musicPath);
      }
    }
    if (this.config.wayNotify.includes("webhook"))
      this.config.webhookURL = await this.webhookURL(this.cache?.webhookURL);
    if ((["webhook", "dms", "call"] as Configuration["wayNotify"]).some((w) => this.config.wayNotify.includes(w)))
      this.config.adminID = await this.getAdminID(this.cache?.adminID);

    this.config.captchaAPI = await this.captchaAPI(this.cache?.captchaAPI);
    if (this.config.captchaAPI) this.config.apiKey = await this.getAPIKey(this.cache?.apiKey);

    this.config.prefix = await this.getPrefix(this.cache?.prefix);
    this.config.owoPrefix = await this.getOwOPrefix(this.cache?.owoPrefix);

    this.config.autoGem = await this.gemUsage(this.cache?.autoGem);
    if (this.config.autoGem)
      this.config.autoCrate = await this.trueFalse(Language.__("toggle.autoCrate"), this.cache?.autoCrate);
    if (this.config.autoGem)
      this.config.autoFCrate = await this.trueFalse(Language.__("toggle.autoFCrate"), this.cache?.autoFCrate);

    this.config.autoCookie = await this.trueFalse(Language.__("toggle.autoCookie"), this.cache?.autoCookie);

    this.config.autoClover = await this.trueFalse(Language.__("toggle.autoClover"), this.cache?.autoClover);
    if (
      (this.config.autoCookie || this.config.autoClover) &&
      (!this.config.adminID || this.config.adminID.length === 0)
    )
      this.config.adminID = await this.getAdminID(this.cache?.adminID);

    this.config.autoOther = await this.otherAction(
      Array.isArray(this.cache?.autoOther) ? this.cache?.autoOther : undefined
    );
    this.config.autoQuote = await this.quoteAction(
      Array.isArray(this.cache?.autoQuote) ? this.cache.autoQuote : undefined
    );
    this.config.autoPray = await this.prayCurse(this.cache?.autoPray);
    this.config.huntBattleSameTime = await this.trueFalse(
      Language.__("toggle.huntBattleSameTime"),
      this.cache?.huntBattleSameTime
    );
    this.config.autoSell = await this.trueFalse(Language.__("toggle.autoSell"), this.cache?.autoSell);
    this.config.autoSleep = await this.trueFalse(Language.__("toggle.autoSleep"), this.cache?.autoSleep);
    this.config.autoReload = await this.trueFalse(Language.__("toggle.autoReload"), this.cache?.autoReload);
    if (this.config.autoReload)
      this.config.autoDaily = await this.trueFalse(Language.__("toggle.autoDaily"), this.cache?.autoDaily);

    this.config.showRPC = await this.trueFalse(Language.__("toggle.showRPC"), this.cache?.showRPC);
    this.config.autoResume = await this.trueFalse(Language.__("toggle.autoResume"), this.cache?.autoResume);

    this.config.token = this.agent.token!;
  };

  public collectData = async (newLanguage = false): Promise<Configuration> => {
    console.clear();

    if (Object.keys(this.rawData).length === 0 || newLanguage) {
      const confirm = await this.trueFalse(Language.__("greet"), false);
      if (!confirm) process.exit(0);
    }

    let account = await this.listAccount(this.rawData);
    let language = false;
    switch (account) {
      case undefined:
        break;
      case "!language":
        language = true;
        break;
      case "!token":
        account = await this.getToken();

      default:
        this.cache = this.rawData[Buffer.from(account.split(".")[0], "base64").toString("utf-8")];
    }
    if (language) {
      await Language.initialize(true);
      return this.collectData(true);
    }
    try {
      await this.agent.checkAccount(account);
    } catch (error) {
      logger.error(error as Error);
      logger.warn(Language.__("fail.login"));
      process.exit(-1);
    }

    if (!this.cache) await this.editConfig();
    else
      switch (await this.accountAction()) {
        case "run":
          this.config = this.cache!;
          break;
        case "edit":
          await this.editConfig();
          break;
        case "export":
          const exportPath = path.resolve(process.cwd(), this.agent.user?.username + ".json");
          fs.writeFileSync(exportPath, JSON.stringify(this.cache || this.config, null, 4));
          logger.info(Language.__("success.exportConfig", { file: exportPath }));
          process.exit(0);
        case "delete":
          if (this.rawData[String(this.agent.user?.id)]) {
            delete this.rawData[String(this.agent.user?.id)];
            fs.writeFileSync(this.dataPath, JSON.stringify(this.rawData, null, 4));
            logger.info(Language.__("success.deleted"));
          } else logger.warn(Language.__("fail.noExistConfigForAccount"));
          process.exit(0);
      }

    this.rawData[String(this.agent.user?.id)] = this.config;
    this.saveData(this.rawData);
    logger.info(Language.__("success.saved", { file: this.dataPath }));

    return this.config;
  };
}

export const InquirerConfig = ConfigManager.getInstance;
