import { BaseAgent } from "../structures/BaseAgent.js";
export async function autoDaily(this: BaseAgent) {
    await this.send("daily");
    this.config.autoDaily = false;
}