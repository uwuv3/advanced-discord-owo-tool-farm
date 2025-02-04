import { Message } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";
import { findUserName, getRandom } from "../utils/utils.js";
import aliases from "../utils/commandAliases.js";
import actions from "./index.js";
export async function autoOrdinary(this: BaseAgent) {
  const command = getRandom(this.owoCommands);
  let randomCommand = getRandom(aliases[`COMMAND_${command}`]) ?? command.toLowerCase();
  const filter = (msg: Message<boolean>) =>
    msg.author.id == this.owoID && findUserName(msg) && (isBattleCommand(msg) || isHuntCommand(msg));

  this.lastTime = Date.now();
  await Promise.all([
    new Promise<void>(async (resolve) => {
      const msg = (await this.createCollector(filter)) as Message<boolean>;
      if (!msg) return;
      if (this.config.autoGem && isHuntCommand(msg)) {
        let param1 = !msg.content.includes("gem1") && (!this.gem1 || this.gem1.length > 0);
        let param2 = !msg.content.includes("gem3") && (!this.gem2 || this.gem2.length > 0);
        let param3 = !msg.content.includes("gem4") && (!this.gem3 || this.gem3.length > 0);
        if (param1 || param2 || param3) await actions.autoGem.bind(this)(param1, param2, param3);
      } else if (isBattleCommand(msg)) {
        //for the checklist XP
      }
      resolve();
    }),
    this.send(randomCommand)
  ]);
}
export const isHuntCommand = (msg: Message<boolean>) =>
  /hunt is empowered by| spent 5 .+ and caught a/.test(msg.content);
export const isBattleCommand = (msg: Message<boolean>) =>
  msg.embeds.some((embed) => embed.author?.name.includes("battle"));
