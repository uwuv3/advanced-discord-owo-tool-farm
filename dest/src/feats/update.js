import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import axios from "axios";
import { confirm } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";
import { exec, execSync, spawn } from "node:child_process";
import AdmZip from "adm-zip";
import { copyDirectory } from "../utils/utils.js";
import { promisify } from "node:util";
class selfUpdate {
    baseHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'
    };
    constructor() {
        this.checkUpdate = this.checkUpdate.bind(this);
    }
    async checkUpdate(autoUpdate = false) {
        logger.info("Checking for update...");
        const { version: currentVersion } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
        const { data: { version: latestVersion } } = await axios.get("https://github.com/Kyou-Izumi/advanced-discord-owo-tool-farm/raw/refs/heads/main/package.json", {
            headers: this.baseHeaders
        });
        if (currentVersion < latestVersion) {
            console.clear();
            logger.info(`New version available: v${latestVersion} (current: v${currentVersion})`);
            const result = autoUpdate ? true : await confirm({
                message: "Would you like to update?",
                default: true
            });
            if (result) {
                logger.info("Updating...");
                await this.performUpdate();
                logger.info("Installing libraries...");
                await this.installDependencies();
                logger.info("Update completed!");
                this.restart();
            }
        }
        else {
            logger.info(`You are running the latest version: ${currentVersion}`);
        }
    }
    performUpdate = async () => {
        if (fs.existsSync(".git")) {
            try {
                execSync("git --version");
                logger.info("Git detected, updating with Git!");
                await this.gitUpdate();
            }
            catch (error) {
                logger.info("Git not found, updating manually...");
                await this.manualUpdate();
            }
        }
        else {
            await this.manualUpdate();
        }
    };
    gitUpdate = async () => {
        try {
            logger.debug("Stashing local changes...");
            execSync("git stash");
            logger.debug("Pulling latest changes from Git...");
            execSync("git pull --force");
            logger.debug("Resetting to latest commit...");
            execSync("git reset --hard");
        }
        catch (error) {
            logger.error("Error updating with Git:");
            logger.error(error);
        }
    };
    manualUpdate = async () => {
        try {
            const res = await axios.get("https://github.com/Kyou-Izumi/advanced-discord-owo-tool-farm/archive/master.zip", {
                responseType: "arraybuffer",
                headers: this.baseHeaders
            });
            const zip = new AdmZip(res.data);
            zip.extractAllTo(os.tmpdir(), true);
            const tempFolder = path.join(os.tmpdir(), zip.getEntries()[0].entryName);
            copyDirectory(tempFolder, process.cwd());
        }
        catch (error) {
            logger.error("Error updating project manually:");
            logger.error(error);
        }
    };
    installDependencies = async () => {
        logger.info("Installing dependencies...");
        try {
            await promisify(exec)("npm install");
            logger.info("Dependencies installed successfully.");
        }
        catch (error) {
            logger.error("Error installing dependencies:");
            logger.error(error);
        }
    };
    restart = () => {
        const child = spawn("start", ["cmd.exe", "/K", "npm start"], {
            cwd: process.cwd(),
            shell: true,
            detached: true,
            stdio: "ignore"
        });
        child.unref();
        process.exit(1);
    };
}
export const checkUpdate = new selfUpdate().checkUpdate;
