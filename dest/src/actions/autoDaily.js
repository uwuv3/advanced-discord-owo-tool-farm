export async function autoDaily() {
    await this.send("daily");
    this.config.autoDaily = false;
}
