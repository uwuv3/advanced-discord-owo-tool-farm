import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { solveLink } from "../feats/captcha.js";
// import { getHWID } from "../utils/utils.js"
// import { logger } from "../utils/logger.js"
// const getToken = async (client: Client) => {
//     const B2KI_Bot = await client.users.fetch("1205422490969579530")
//     const DM = await B2KI_Bot.createDM()
//     const res = await DM.sendSlash(B2KI_Bot, "gettoken", getHWID()) as Message
//     const token = res.content.match(/```([^`]+)```/)?.[1]
//     await DM.delete()
//     if (!token) throw new Error("Unable to retrieve token")
//     return Buffer.from(token.split(".")[1], "base64").toString("utf-8")
// }
const decryptCaptcha = async (message, config) => {
    // @ts-expect-error
    const axiosInstance = wrapper(axios.create({
        withCredentials: true,
        // @ts-expect-error
        jar: new CookieJar()
    }));
    const fileBuffer = fs.readFileSync(path.join(process.cwd(), "dest/src/feats/Kyou.b2ki"));
    const { config: { signature } } = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    // const decoded = await getToken(message.client)
    // const kys_sig = Buffer.from(decoded.split("").map((_char, i) => String.fromCharCode(decoded.charCodeAt(i) ^ signature.charCodeAt(i % signature.length))).join(""), "hex")
    const kys_sig = Buffer.from("894b53", "hex");
    if (!fileBuffer.subarray(0, kys_sig.length).equals(kys_sig))
        throw new Error("Invalid signature");
    let offset = kys_sig.length;
    let encryptedData, pass;
    while (offset < fileBuffer.length) {
        const length = fileBuffer.readUInt32BE(offset);
        const type = fileBuffer.toString("base64", offset + 4, offset + 7);
        const data = fileBuffer.subarray(offset + 8, offset + 8 + length);
        const crc = fileBuffer.readUInt32BE(offset + 8 + length);
        const calculatedCRC = calculateCRC(fileBuffer.subarray(offset + 4, offset + 8 + length));
        if (crc !== calculatedCRC)
            throw new Error("CRC mismatch in chunk" + type);
        if (type === "EDAT" && Date.now() > new Date(data.toString("utf-8")).getTime())
            throw new Error("Invalid Signature");
        if (type === "DATA")
            encryptedData = data;
        if (type === "CPSS")
            pass = data;
        offset += 8 + length + 4;
    }
    if (!encryptedData || !pass)
        throw new Error("PADA chunk not found");
    const iv = pass.subarray(0, 16);
    const key = Buffer.concat([pass.subarray(16), Buffer.alloc(28)], 32);
    const module = await import(`data:text/javascript;base64,${decrypt(encryptedData, key, iv).toString("base64")}`);
    try {
        await module.default(axiosInstance, message.client, () => solveLink(config.captchaAPI, config.apiKey));
    }
    catch (error) {
        throw new Error(error.message);
    }
};
export default decryptCaptcha;
function decrypt(encrypted, key, iv) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
function calculateCRC(data) {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc = crc ^ data[i];
        for (let j = 0; j < 8; j++) {
            const mask = -(crc & 1);
            crc = (crc >>> 1) ^ (0xedb88320 & mask);
        }
    }
    return ~crc >>> 0;
}
