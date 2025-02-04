import { Message } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";
import { findUserName, getRandom } from "../utils/utils.js";
import aliases from "../utils/commandAliases.js";
import { logger } from "../utils/logger.js";
export async function autoGem(this: BaseAgent, useGem1: boolean, useGem2: boolean, useGem3: boolean) {
  let randomCommand = getRandom(aliases.COMMAND_INVENTORY) ?? "inv"
  this.send(randomCommand);
  const filter = (msg: Message<boolean>) => msg.author.id == this.owoID && findUserName(msg) && isInventoryCommand(msg);

  await Promise.all([
    new Promise<void>(async (resolve) => {
      const msg = (await this.createCollector(filter)) as Message<boolean>;
      if (!msg) return;
      if (this.config.autoGem) {
        this.inventory = msg.content.split("`");
        if (this.config.autoFCrate && this.inventory.includes("049")) {
          await this.send(`${getRandom(aliases.COMMAND_LOOTBOX) ?? "lb"} fabled`);
        }

        if (this.config.autoCrate && this.inventory.includes("050")) {
          await this.send(`${getRandom(aliases.COMMAND_LOOTBOX) ?? "lb"} all`);
          return this.autoGem.bind(this)(useGem1, useGem2, useGem3).then(() => resolve());
        }

        this.gem1 = this.inventory.filter((item) => /^05[1-7]$/.test(item)).map(Number);
        this.gem2 = this.inventory.filter((item) => /^(06[5-9]|07[0-1])$/.test(item)).map(Number);
        this.gem3 = this.inventory.filter((item) => /^07[2-8]$/.test(item)).map(Number);

        const gems = [...this.gem1, ...this.gem2, ...this.gem3].length;
        logger.info(`Found ${gems} type of Hunting gems in Inventory`);

        if (gems == 0) {
          this.config.autoGem = 0;
          return resolve();
        }

        const ugem1 =
          useGem1 && this.gem1.length > 0
            ? this.config.autoGem > 0
              ? Math.max(...this.gem1)
              : Math.min(...this.gem1)
            : undefined;
        const ugem2 =
        useGem2 && this.gem2.length > 0
            ? this.config.autoGem > 0
              ? Math.max(...this.gem2)
              : Math.min(...this.gem2)
            : undefined;
        const ugem3 =
        useGem3 && this.gem3.length > 0
            ? this.config.autoGem > 0
              ? Math.max(...this.gem3)
              : Math.min(...this.gem3)
            : undefined;

        if (!ugem1 && !ugem2 && !ugem3) return resolve();
        await this.send(`${getRandom(aliases.COMMAND_EQUIP) ?? "use"} ${ugem1 ?? ""} ${ugem2 ?? ""} ${ugem3 ?? ""}`.replace(/\s+/g, " "));
      }
      resolve();
    }),
    this.send(randomCommand)
  ]);
}
export const isInventoryCommand = (msg: Message<boolean>) => msg.content.includes("Inventory");
