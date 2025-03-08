import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { CommandCondition, QuestTypes } from "../typings/typings.js";
import { Message } from "discord.js-selfbot-v13";
import Language from "../structures/Language.js";
export const mapInt = (number: number, fromMIN: number, fromMAX: number, toMIN: number, toMAX: number) => {
  return Math.floor(((number - fromMIN) / (fromMAX - fromMIN)) * (toMAX - toMIN) + toMIN);
};
export const findUserName = (msg:Message<boolean>) => msg.content.includes(msg.guild?.members.me?.displayName!) || msg.embeds.some(embed=>embed.author?.name.includes(msg.guild?.members.me?.displayName!))
export const ranInt = (min: number, max: number, abs: boolean = true) => {
  return abs ? Math.abs(Math.floor(Math.random() * (max - min) + min)) : Math.floor(Math.random() * (max - min) + min);
};
export const timeHandler = (startTime: number, endTime: number, removeDay = false) => {
  const ms = Math.abs(startTime - endTime);
  const sc = Math.round((((ms % 86400000) % 3600000) % 60000) / 1000);
  const mn = Math.floor(((ms % 86400000) % 3600000) / 60000);
  const hr = Math.floor((ms % 86400000) / 3600000);
  const dy = Math.floor(ms / 86400000);
  return (removeDay ? "" : dy + (dy > 1 ? Language.__("format.days") :Language.__("format.day"))) + hr + ":" + mn + ":" + sc;
};
export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
export const getRandom = <T>(array: T[]): T => {
  return array[ranInt(0, array.length)];
};
export const getFiles = (dir: string, suffix: string): string[] => {
  const files: fs.Dirent[] = fs.readdirSync(dir, {
    withFileTypes: true
  });

  let commandFiles: string[] = [];

  for (const file of files) {
    if (file.isDirectory()) {
      commandFiles = [...commandFiles, ...getFiles(path.join(dir, file.name), suffix)];
    } else if (file.name.endsWith(suffix)) commandFiles.push(path.join(dir, file.name));
  }
  return commandFiles;
};
export const copyDirectory = (sourceDir: string, destDir: string) => {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    if (fs.statSync(sourcePath).isDirectory()) copyDirectory(sourcePath, destPath);
    else fs.copyFileSync(sourcePath, destPath);
  }
};
export const getQuestType = (name: string): QuestTypes => {
  const questTypeLookup: Record<string, QuestTypes> = {
    xp: "xp",
    hunt: "hunt",
    battle: "battle",
    "'owo'": "owo",
    gamble: "gamble",
    "action command on someone": "action"
  };

  for (const [key, value] of Object.entries(questTypeLookup)) {
    if (name.includes(key)) value;
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
export const loadQuestCommand = (callback: CommandCondition["action"]): CommandCondition => {
  return {
    condition: () => true,
    action: callback
  };
};

export const getHWID = () => {
  return crypto
    .createHash("sha256")
    .update([os.platform(), os.hostname(), os.userInfo().username].join(""))
    .digest("hex");
};
