import { BaseAgent } from "../structures/BaseAgent.js";
import { logger } from "../utils/logger.js";
export async function autoClover(this: BaseAgent) {
  await new Promise<void>(async (a) => {
    if (!this.config.adminID || this.config.adminID.length === 0) {
      logger.warn("Auto Cookie is enabled without AdminID! Skipping...");
      return a();
    }

    await this.send("clover " + this.config.adminID);
    a();
  });
  this.config.autoClover = false;
}
