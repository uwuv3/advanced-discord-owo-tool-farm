import { RichPresence } from "discord.js-selfbot-v13";
export const loadPresence = async (client) => {
    const rpc = new RichPresence(client)
        .setApplicationId("1205422490969579530")
        .setType("PLAYING")
        .setName("Mirai Kuriyama")
        .setDetails("The day the emperor returns!")
        .setStartTimestamp(client.readyTimestamp ?? Date.now())
        .setAssetsLargeImage("1312264004382621706")
        .setAssetsLargeText("Oct updates coming, check 'em out!")
        .setAssetsSmallImage("1306938859552247848")
        .setAssetsSmallText("Kyou Izumi")
        .addButton("GitHub", "https://github.com/Kyou-Izumi/advanced-discord-owo-tool-farm")
        .addButton("YouTube", "https://www.youtube.com/@daongotau");
    client.user?.setPresence({ activities: [rpc] });
};
