import { Commands } from "../typings/typings.js";

const pingCommand: Commands = {
    name: "ping",
    description: "Tool Website Service Ping",
    execute: (agent, message, args) => {
        message.reply(`Pong! ${message.client.ws.ping}ms~`)
    }
}

export default pingCommand;