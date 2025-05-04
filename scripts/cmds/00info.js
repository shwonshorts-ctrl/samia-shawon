const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "botinfo",
    aliases: ["info", "btinfo"],
    version: "1.0",
    author: "BADHON",
    role: 0,
    shortDescription: {
      en: "Get the Bot information such as uptime, ping, and group info."
    },
    longDescription: {
      en: "Get the Bot information such as uptime, ping, and group info."
    },
    category: "Info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      // Download image from Imgur
      const imgURL = "https://i.imgur.com/uSfFuCp.jpeg";
      const imgPath = path.join(__dirname, "botinfo.png");
      const response = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // Group info
      let threadInfo = await api.getThreadInfo(event.threadID);
      let threadMem = threadInfo.participantIDs.length;
      let maleCount = 0, femaleCount = 0;

      for (let user of threadInfo.userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
      }

      let qtvList = threadInfo.adminIDs;
      let qtvCount = qtvList.length;
      let messageCount = threadInfo.messageCount;
      let threadName = threadInfo.threadName;
      let threadID = threadInfo.threadID;

      let adminNames = '';
      for (let admin of qtvList) {
        let info = await api.getUserInfo(admin.id);
        adminNames += `• ${info[admin.id].name}\n`;
      }

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      const timeStart = Date.now();
      await api.sendMessage("𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝗕𝗼𝘁'𝘀 𝗜𝗻𝗳𝗼...", event.threadID);
      const ping = Date.now() - timeStart;

      const message = `╭────────────────⭓
├─「𝐔𝐏𝐓𝐈𝐌𝐄」
│» 𝗕𝗼𝘁 𝗥𝘂𝗻𝗻𝗶𝗻𝗴 𝗶𝗻 
│${uptimeString}.
├────────────────
├─「𝐏𝐈𝐍𝐆」
│» 𝗧𝗵𝗲 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗣𝗶𝗻𝗴 𝗜𝘀:
│${ping}ms.
├────────────────
├─「𝐆𝐑𝐎𝐔𝐏 𝐈𝐧𝐟𝐨」
│» 𝗚𝗖 𝗡𝗮𝗺𝗲: 
│${threadName}
│» 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: 
│${threadID}
│» 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗠𝗲𝗺𝗯𝗲𝗿:
│${threadMem}
│» 𝗠𝗮𝗹𝗲: ${maleCount} | 𝗙𝗲𝗺𝗮𝗹𝗲: ${femaleCount}
│» 𝗔𝗱𝗺𝗶𝗻𝘀: ${qtvCount}
│» 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${messageCount}
╰────────────────⭓`;

      // Send message with attachment
      api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath) // delete after sending
      );

    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
