import axios from "axios";
import { Solver } from "2captcha";
import { logger } from "../utils/logger.js";
export const solveImage = async (attachmentUrl, config) => {
    logger.debug("Found Captcha Image with URL: " + attachmentUrl);
    const response = await axios.get(attachmentUrl, {
        responseType: "arraybuffer",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Content-Type": "application/octet-stream",
        }
    });
    if (config.captchaAPI == "2captcha") {
        const solver = new Solver(config.apiKey);
        const res = await solver.imageCaptcha(Buffer.from(response.data, "binary").toString("base64"), {
            numeric: 2,
            min_len: 3,
            max_len: 6,
        });
        return res.data;
    }
};
export const solveLink = async (provider, apiKey, sitekey = "a6a1d5ce-612d-472d-8e37-7601408fbc09", siteurl = "https://owobot.com") => {
    if (provider == "2captcha") {
        const solver = new Solver(apiKey);
        const res = await solver.hcaptcha(sitekey, siteurl);
        return res.data;
    }
};
