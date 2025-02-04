import { Message } from "discord.js-selfbot-v13";
import { BaseAgent } from "../structures/BaseAgent.js";
import { findUserName, getRandom, ranInt } from "../utils/utils.js";
import aliases from "../utils/commandAliases.js";
export async function autoOther(this: BaseAgent) {
  const command = getRandom(this.config.autoOther);
  const filter = (msg: Message<boolean>) => msg.author.id == this.owoID && isFinishOther(msg);
  this.toutOther = new Date().setMinutes(new Date().getMinutes() + 1, ranInt(0, 59));

  this.lastTime = Date.now();
  await this.send(command);
  this.createCollector(filter).then((msg) => {
    if (!msg) return;
    this.config.autoOther = this.config.autoOther.filter((c) => c != command);
  });
}
export const isFinishOther = (msg: Message<boolean>) =>
  msg.content.startsWith("🚫 **|** ") || msg.content.startsWith(":no_entry_sign: **|** ");
