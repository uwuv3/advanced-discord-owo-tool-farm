import { I18n } from "i18n";
import { homedir } from "os";
import path from "path";
import fs from "fs";
import { select } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";
class Language extends I18n {
    folderPath = path.resolve(homedir(), "b2ki-ados");
    languagePath = path.resolve(this.folderPath, "language");
    defaultLocale;
    language;
    constructor(defalutLocale) {
        super();
        this.defaultLocale = defalutLocale;
        if (!fs.existsSync(this.languagePath)) {
            fs.writeFileSync(this.languagePath, "");
        }
        this.configure({
            locales: ["en", "tr"],
            directory: path.join(process.cwd(), "/locales")
        });
        this.language = this.getLanguage();
    }
    initialize = async (force = false) => {
        if (!this.language.length || force) {
            this.language = await this.selectLaunguage();
            this.setLanguage(this.language);
        }
        else {
            this.setLocale(this.language || this.defaultLocale);
        }
    };
    selectLaunguage = (cache) => {
        console.clear();
        return select({
            message: "Select your language: ",
            choices: [...this.getLocales().map((l) => ({ name: l, value: l }))],
            default: cache
        });
    };
    setLanguage = (cache) => {
        fs.writeFileSync(this.languagePath, cache || "en");
        logger.debug("Language changed to: " + cache);
        this.setLocale(cache || "en");
    };
    getLanguage = () => {
        return fs.readFileSync(this.languagePath, "utf-8");
    };
}
export default new Language("en");
