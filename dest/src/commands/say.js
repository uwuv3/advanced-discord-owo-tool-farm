const sayCommand = {
    name: "say",
    description: "Make the Tool Perform command/say something",
    execute: (agent, message, ...args) => {
        message.channel.send(args.join(" "));
    }
};
export default sayCommand;
