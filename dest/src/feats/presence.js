import { RichPresence } from "discord.js-selfbot-v13";
export const loadPresence = async (client) => {
    const externalLinks = await RichPresence.getExternal(client, "367827983903490050", "https://i.imgur.com/9wrvM38.png", "https://i.imgur.com/MO5TPzf.png");
    const rpc = new RichPresence(client)
        .setApplicationId("367827983903490050")
        .setType("PLAYING")
        .setName("Mirai")
        .setDetails("The day the emperor returns!")
        .setStartTimestamp(client.readyTimestamp ?? Date.now())
        .setAssetsLargeImage(externalLinks[0].external_asset_path)
        .setAssetsLargeText("Oct updates coming, check 'em out!")
        .setAssetsSmallImage(externalLinks[1].external_asset_path)
        .setAssetsSmallText("Kyou Izumi")
        .addButton("GitHub", "https://github.com/Kyou-Izumi/advanced-discord-owo-tool-farm")
        .addButton("YouTube", "https://www.youtube.com/@daongotau");
    client.user?.setPresence({ activities: [rpc], status: "idle" });
};
