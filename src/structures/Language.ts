import { I18n } from "i18n";
import { homedir } from "os";
import path from "path";
import fs from "fs";
import { select } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";
class Language extends I18n {
  private folderPath = path.resolve(homedir(), "b2ki-ados");
  private languagePath = path.resolve(this.folderPath, "language");

  defaultLocale: string;
  language: string;
  constructor(defalutLocale: string) {
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
  public initialize = async (force = false) => {
    if (!this.language.length || force) {
      this.language = await this.selectLaunguage();
      this.setLanguage(this.language);
    } else {
      this.setLocale(this.language || this.defaultLocale);
    }
  };
  private selectLaunguage = (cache?: string) => {
    console.clear();
    return select<string>({
      message: "Select your language: ",
      choices: [...this.getLocales().map((l) => ({ name: l, value: l }))],
      default: cache
    });
  };
  public setLanguage = (cache?: string) => {
    fs.writeFileSync(this.languagePath, cache || "en");
    logger.debug("Language changed to: " + cache);
    this.setLocale(cache || "en");
  };
  public getLanguage = () => {
    return fs.readFileSync(this.languagePath, "utf-8");
  };
}

export default new Language("en");
