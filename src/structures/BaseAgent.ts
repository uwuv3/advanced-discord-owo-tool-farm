import {
	Client,
	Collection,
	Message,
	TextChannel,
} from "discord.js-selfbot-v13";
import { mapInt, ranInt, shuffleArray, timeHandler } from "../utils/utils.js";
import {
	agentOptions,
	CommandCondition,
	Commands,
	Configuration,
	sendOptions,
} from "../typings/typings.js";
import { logger } from "../utils/logger.js";
import { quotes } from "../typings/quotes.js";
import { loadPresence } from "../feats/presence.js";
import { owoHandler } from "../handler/owoHandler.js";
import { loadCommands } from "../feats/command.js";
import { commandHandler } from "../handler/commandHandler.js";
import { dmsHandler } from "../handler/dmsHandler.js";
import { loadSweeper } from "../feats/sweeper.js";

export class BaseAgent extends Client {
	public config!: Configuration;
	public cache!: Configuration;
	public activeChannel!: TextChannel;

	totalCommands = 0;
	totalTexts = 0;

	owoID = "408785106942164992";
	prefix = "owo ";
	private owoCommands = shuffleArray([
		...Array<string>(7).fill("hunt"),
		...Array<string>(3).fill("battle"),
	]);
	public commands: Collection<string, Commands> = new Collection();
	captchaDetected = false;
	paused = false;

	private coutChannel = ranInt(17, 51);
	private coutSleep = ranInt(38, 92);

	private lastTime = 0;
	private sleepTime = mapInt(this.coutSleep, 38, 92, 150_000, 1_000_000);
	private reloadTime = new Date().setUTCHours(24, ranInt(0, 30), ranInt(0, 59));

	private toutOther = 0;
	private toutPray = 0;

	private inventory: string[] = [];
	private gem1?: number[];
	private gem2?: number[];
	private gem3?: number[];

	RETAINED_USERS_IDS = [this.owoID]

	constructor({ options }: agentOptions = {}) {
		super(options);
	}
	public registerEvents = () => {
		this.on("ready", async () => {
			logger.info("Logged in as " + this.user?.displayName);
			loadPresence(this);
			loadSweeper(this);
			if (this.config.prefix) this.commands = await loadCommands();
			this.activeChannel = this.channels.cache.get(
				this.config.channelID[0]
			) as TextChannel;
			this.main();
		});
		owoHandler(this);
		commandHandler(this);
		dmsHandler(this);
	};

	public checkAccount = (token?: string): Promise<Client> => {
		return new Promise((resolve, reject) => {
			logger.info("Checking account...");
			this.once("ready", () => {
				resolve(this);
			});
			try {
				token ? this.login(token) : this.QRLogin();
			} catch (error) {
				reject(error);
			}
		});
	};

	public send = async (
		message: string,
		{
			withPrefix = true,
			channel = this.activeChannel,
			delay = ranInt(120, 3700),
		}: sendOptions = {}
	) => {
		if (this.captchaDetected || this.paused) return;

		if (delay) await this.sleep(delay);
		if (withPrefix) message = this.prefix + message;
		await channel.send(message);
		if (withPrefix) logger.sent(message);
		withPrefix ? this.totalCommands++ : this.totalTexts++;
	};

	public aReload = async (force = false) => {
		if (!force && Date.now() > this.reloadTime) return;
		this.reloadTime = new Date().setUTCHours(
			0,
			ranInt(0, 30),
			ranInt(0, 59),
			ranInt(0, 1000)
		);
		[this.gem1, this.gem2, this.gem3] = Array<undefined>(3).fill(undefined);
		this.config = this.cache;
		if(force) return true
	};

	public aDaily = async () => {
		await this.send("daily");
		this.config.autoDaily = false;
	};

	public aPray = async () => {
		this.toutPray = new Date().setMinutes(
			new Date().getMinutes() + 5,
			ranInt(0, 59)
		);
		await this.send(
			this.config.autoPray[ranInt(0, this.config.autoPray.length)]
		);
	};

	public cChannel = async () => {
		this.activeChannel = this.channels.cache.get(
			this.config.channelID[ranInt(0, this.config.channelID.length)]
		) as TextChannel;
		this.coutChannel += ranInt(17, 51);
	};

	public aSleep = async () => {
		logger.info("Pausing for " + timeHandler(0, this.sleepTime, true));
		await this.sleep(this.sleepTime);
		
		const nextShift = ranInt(38, 92);
		this.coutSleep += nextShift;
		this.sleepTime = mapInt(nextShift, 38, 92, 150_000, 1_000_000);
	};

	public aOther = async () => {
		const command =
			this.config.autoOther[ranInt(0, this.config.autoOther.length)];
		await this.send(command);
		this.toutOther = new Date().setMinutes(
			new Date().getMinutes() + 1,
			ranInt(0, 59)
		);

		const filter = (m: Message<boolean>) =>
			m.author.id == this.owoID &&
			(m.content.startsWith("🚫 **|** ") ||
				m.content.startsWith(":no_entry_sign: **|** "));
		this.activeChannel
			.createMessageCollector({ filter, max: 1, time: 15_000 })
			.once("collect", () => {
				if (this.config.autoOther.indexOf(command) > -1)
					this.config.autoOther.splice(
						this.config.autoOther.indexOf(command),
						1
					);
			});
	};

	public aQuote = async () => {
		switch (this.config.autoQuote[ranInt(0, this.config.autoQuote.length)]) {
			case "owo":
				await this.send("owo", { withPrefix: false });
				break;
			case "quote":
				await this.send(quotes[ranInt(0, quotes.length)], {
					withPrefix: false,
				});
				break;
		}
	};

	public aGem = async (uGem1: boolean, uGem2: boolean, uGem3: boolean) => {
		await this.send("inv");
		const filter = (msg: Message<boolean>) =>
			msg.author.id == this.owoID &&
			msg.content.includes(msg.guild?.members.me?.displayName!) &&
			msg.content.includes("Inventory");
		this.activeChannel.createMessageCollector({ filter, max: 1, time: 15_000 })
			.once("collect", async (msg) => {
				this.inventory = msg.content.split("`");

				if (this.config.autoFCrate && this.inventory.includes("049")) await this.send("lb fabled");
				if (this.config.autoCrate && this.inventory.includes("050")) {
					await this.send("lb all");
					await this.sleep(ranInt(4800, 6200));
					return this.aGem(uGem1, uGem2, uGem3);
				}

				this.gem1 = this.inventory.filter((item) => /^05[1-7]$/.test(item)).map(Number);
				this.gem2 = this.inventory.filter((item) => /^(06[5-9]|07[0-1])$/.test(item)).map(Number);
				this.gem3 = this.inventory.filter((item) => /^07[2-8]$/.test(item)).map(Number);

				const gems = [...this.gem1, ...this.gem2, ...this.gem3].length;
				logger.info(`Found ${gems} type of Hunting gems in Inventory`);

				if (gems == 0) {
					this.config.autoGem = 0;
					return;
				}

				const ugem1 = (uGem1 && this.gem1.length > 0) ? this.config.autoGem > 0 
					? Math.max(...this.gem1) : Math.min(...this.gem1) : undefined;
				const ugem2 = (uGem2 && this.gem2.length > 0) ? this.config.autoGem > 0 
					? Math.max(...this.gem2) : Math.min(...this.gem2) : undefined;
				const ugem3 = (uGem3 && this.gem3.length > 0) ? this.config.autoGem > 0 
					? Math.max(...this.gem3) : Math.min(...this.gem3) : undefined;

				if (!ugem1 && !ugem2 && !ugem3) return;
				await this.send(`use ${ugem1 ?? ""} ${ugem2 ?? ""} ${ugem3 ?? ""}`.replace(/\s+/g, " "));
			});
	};

	public main = async (): Promise<any> => {
		if (this.captchaDetected || this.paused || Date.now() - this.lastTime < 15_000) return;

		const command = this.owoCommands[ranInt(0, this.owoCommands.length)];
		if (!command) {
			logger.debug("No command found");
			await this.sleep(ranInt(1000, 1000));
			this.main();
			return;
		}
		await this.send(command);
		this.lastTime = Date.now();

		if (command == "hunt" && this.config.autoGem) {
			const filter = (msg: Message<boolean>) =>
				msg.author.id == this.owoID &&
				msg.content.includes(msg.guild?.members.me?.displayName!) &&
				/hunt is empowered by| spent 5 .+ and caught a/.test(msg.content);
			this.activeChannel
				.createMessageCollector({ filter, max: 1, time: 15_000 })
				.once("collect", async (msg) => {
					let param1 = !msg.content.includes("gem1") && (!this.gem1 || this.gem1.length > 0);
					let param2 = !msg.content.includes("gem3") && (!this.gem2 || this.gem2.length > 0);
					let param3 = !msg.content.includes("gem4") && (!this.gem3 || this.gem3.length > 0);
					if (param1 || param2 || param3)
						await this.aGem(param1, param2, param3);
				});
		}

		const commands: CommandCondition[] = [
			{
				condition: () =>
					this.config.autoPray &&
					Date.now() - this.toutPray >= 360_000,
				action: this.aPray,
			},
			{
				condition: () =>
					this.config.autoDaily,
				action: this.aDaily
			},
			{
				condition: () =>
					this.config.autoOther.length > 0 &&
					Date.now() - this.toutOther >= 60_000,
				action: this.aOther,
			},
			{
				condition: () =>
					this.config.autoSleep &&
					this.totalCommands >= this.coutSleep,
				action: this.aSleep,
			},
			{
				condition: () =>
					this.config.channelID.length > 1 &&
					this.totalCommands >= this.coutChannel,
				action: this.cChannel,
			},
			{
				condition: () =>
					this.config.autoReload &&
					Date.now() > this.reloadTime,
				action: () => this.aReload(),
			},
			{
				condition: () =>
					this.config.autoQuote.length > 0,
				action: this.aQuote,
			},
		];

		for (const command of commands) {
			if (this.captchaDetected || this.paused) return;
			if (command.condition()) await command.action();
			const delay = ranInt(15000, 22000) / commands.length;
			await this.sleep(ranInt(delay, delay + 1200));
		}

		await this.sleep(ranInt(2000, 5000))
		this.main();
	};

	public run = (config: Configuration) => {
		this.config = config;
		this.cache = config;
		this.registerEvents();
		this.emit("ready", this.user?.client!)
	}
}
