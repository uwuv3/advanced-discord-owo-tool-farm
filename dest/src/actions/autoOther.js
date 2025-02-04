import { getRandom, ranInt } from "../utils/utils.js";
export async function autoOther() {
    const command = getRandom(this.config.autoOther);
    const filter = (msg) => msg.author.id == this.owoID && isFinishOther(msg);
    this.toutOther = new Date().setMinutes(new Date().getMinutes() + 1, ranInt(0, 59));
    this.lastTime = Date.now();
    await this.send(command);
    this.createCollector(filter).then((msg) => {
        if (!msg)
            return;
        this.config.autoOther = this.config.autoOther.filter((c) => c != command);
    });
}
export const isFinishOther = (msg) => msg.content.startsWith("🚫 **|** ") || msg.content.startsWith(":no_entry_sign: **|** ");
