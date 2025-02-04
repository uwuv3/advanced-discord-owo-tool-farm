import { BaseAgent } from "../structures/BaseAgent.js";
import { owo_uwu, quotes } from "../typings/quotes.js";
import { logger } from "../utils/logger.js";
import { getRandom } from "../utils/utils.js";
export async function autoQuote(this: BaseAgent) {
  try {
    switch (getRandom(this.config.autoQuote)) {
      case "owo":
        const owoquote = getRandom(owo_uwu) || "owo";
        await this.send(owoquote, { withPrefix: false });
        break;
      case "quote":
        const quote = getRandom(quotes);
        if (!quote) throw new Error("Failed to fetch quote");
        await this.send(quote, { withPrefix: false });
        break;
    }
  } catch (err) {
    logger.error(err as Error);
    logger.error("Failed to fetch quote, sending owo instead");
    await this.send("owo", { withPrefix: false });
  }
}
