import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
export const mapInt = (number, fromMIN, fromMAX, toMIN, toMAX) => { return Math.floor(((number - fromMIN) / (fromMAX - fromMIN)) * (toMAX - toMIN) + toMIN); };
export const ranInt = (min, max, abs = true) => { return abs ? Math.abs(Math.floor(Math.random() * (max - min) + min)) : Math.floor(Math.random() * (max - min) + min); };
export const timeHandler = (startTime, endTime, removeDay = false) => {
    const ms = Math.abs(startTime - endTime);
    const sc = Math.round(ms % 86400000 % 3600000 % 60000 / 1000);
    const mn = Math.floor(ms % 86400000 % 3600000 / 60000);
    const hr = Math.floor(ms % 86400000 / 3600000);
    const dy = Math.floor(ms / 86400000);
    return (removeDay ? "" : dy + (dy > 1 ? " days " : " day ")) + hr + ":" + mn + ":" + sc;
};
export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
export const getFiles = (dir, suffix) => {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });
    let commandFiles = [];
    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(path.join(dir, file.name), suffix)
            ];
        }
        else if (file.name.endsWith(suffix))
            commandFiles.push(path.join(dir, file.name));
    }
    return commandFiles;
};
export const copyDirectory = (sourceDir, destDir) => {
    if (!fs.existsSync(destDir))
        fs.mkdirSync(destDir, { recursive: true });
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        if (fs.statSync(sourcePath).isDirectory())
            copyDirectory(sourcePath, destPath);
        else
            fs.copyFileSync(sourcePath, destPath);
    }
};
export const getQuestType = (name) => {
    const questTypeLookup = {
        "xp": "xp",
        "hunt": "hunt",
        "battle": "battle",
        "'owo'": "owo",
        "gamble": "gamble",
        "action command on someone": "action",
    };
    for (const [key, value] of Object.entries(questTypeLookup)) {
        if (name.includes(key))
            value;
    }
    return "unsupported";
    /**
     * Earn  125000 xp from hunting and battling!
     * Manually hunt 100 times!
     * Battle 50 times!
     * Hunt 3 animals that are mythical rank!
     *
     * Use an action command on someone 3 times!
     *
     * Gamble 10 times!
     * Have a friend use an action command on you 1 times!
     * Have a friend pray to you 3 times!
     * Have a friend curse you 3 times!
     * Receive a cookie from 2 friends!
     */
};
export const loadQuestCommand = (callback) => {
    return {
        condition: () => true,
        action: callback
    };
};
export const getHWID = () => {
    return crypto.createHash("sha256").update([
        os.platform(),
        os.hostname(),
        os.userInfo().username,
    ].join("")).digest("hex");
};
