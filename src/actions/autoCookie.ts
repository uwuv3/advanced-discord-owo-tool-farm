import { BaseAgent } from "../structures/BaseAgent.js";
import { logger } from "../utils/logger.js";
export async function autoCookie(this: BaseAgent) {
  await new Promise<void>(async (a) => {
    if (!this.config.adminID || this.config.adminID.length === 0) {
      logger.warn("Auto Cookie is enabled without AdminID! Skipping...");
      return a();
    }

    await this.send("cookie " + this.config.adminID);
    a();
  });
  this.config.autoCookie = false;
}
