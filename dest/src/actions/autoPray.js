import { getRandom, ranInt } from "../utils/utils.js";
export async function autoPray() {
    this.toutPray = new Date().setMinutes(new Date().getMinutes() + 5, ranInt(0, 59));
    await this.send(getRandom(this.config.autoPray));
}
