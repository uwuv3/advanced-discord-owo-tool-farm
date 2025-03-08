import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { logger } from "./src/utils/logger.js";
import { defaultConfig } from "./src/typings/typings.js";
import { BaseAgent } from "./src/structures/BaseAgent.js";
import { InquirerConfig } from "./src/structures/Inquirer.js";
import { checkUpdate } from "./src/feats/update.js";
import Language from "./src/structures/Language.js";
const program = new Command();
const agent = new BaseAgent();
process
    .on("unhandledRejection", (error) => {
    logger.error(error);
    logger.log("runtime", "Unhandled promise rejection");
})
    .on("uncaughtException", (error) => {
    logger.error(error);
    logger.log("runtime", "Uncaught exception");
});
program
    .name("BKI Advanced Discord OwO Selfbot")
    .description("BKI Kyou Izumi Advanced Discord OwO Selfbot")
    .version(JSON.parse(fs.readFileSync("./package.json", "utf-8")).version || "3.0.0");
program
    .option("-g, --generate <filename>", "Generate new data file for autorun")
    .option("-i, --import <filename>", "Import data file for autorun")
    .option("-d, --debug", "Enable debug mode")
    .option("-u, --update", "Whether to update directly (without prompt)")
    .option("-l, --lang <language>", "Set the language")
    .action(async () => {
    if (program.opts().lang) {
        Language.setLanguage(program.opts().lang);
    }
    await Language.initialize();
    if (program.opts().debug) {
        logger.logger.level = "debug";
        logger.info(Language.__("debug.enabled"));
    }
    await checkUpdate(Boolean(program.opts()?.update));
    if (program.opts()?.generate) {
        const filename = typeof program.opts().generate === "string" ? program.opts().generate : "autorun.json";
        if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
            return logger.error(Language.__("file.alreadyExistsNoEmpty", { file: path.resolve(filename) }));
        }
        fs.writeFileSync(filename, JSON.stringify(defaultConfig, null, 4));
        logger.info(Language.__("file.generated", { file: path.resolve(filename) }));
        return;
    }
    if (program.opts()?.import) {
        if (!fs.existsSync(program.opts().import))
            return logger.error(`File ${program.opts().import} does not exist!`);
        if (path.extname(program.opts().import) !== ".json")
            return logger.error(Language.__("file.notJSON", { file: program.opts().import }));
        const data = JSON.parse(fs.readFileSync(path.resolve(program.opts().import), "utf-8"));
        if (!data)
            return logger.error(Language.__("file.empty", { file: program.opts().import }));
        try {
            await agent.checkAccount(data.token);
            agent.run(data);
        }
        catch (error) {
            logger.error(error);
            logger.error(Language.__("fail.importData"));
        }
    }
    else {
        const config = await InquirerConfig(agent);
        agent.run(config);
    }
});
program.parse(process.argv);
