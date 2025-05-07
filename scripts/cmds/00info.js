const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    aliases: ["info"],
    version: "1.0",
    author: "BADHON",
    role: 0,
    shortDescription: {
      en: "Get the Bot information such as uptime, ping, and group info."
    },
    longDescription: {
      en: "Displays bot uptime, ping, and information about the current group."
    },
    category: "Info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      // Download image from Google Drive
      const imgURL = "https://drive.google.com/uc?id=1EJia7JaD_HUksoIBy3Wxn45XLzc8v_8Y";
      const imgPath = path.join(__dirname, "botinfo.jpg");
      const response = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // Get thread info
      const threadInfo = await api.getThreadInfo(event.threadID);
      const threadMem = threadInfo.participantIDs.length;
      const messageCount = threadInfo.messageCount || 0;
      const threadName = threadInfo.threadName || "Unnamed Group";
      const threadID = threadInfo.threadID;
      const adminIDs = threadInfo.adminIDs || [];
      const qtvCount = adminIDs.length;

      // Count gender
      let maleCount = 0, femaleCount = 0;
      for (const user of threadInfo.userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
      }

      // Get admin names
      let adminNames = "";
      for (const admin of adminIDs) {
        const info = await api.getUserInfo(admin.id);
        adminNames += `• ${info[admin.id]?.name || "Unknown"}\n`;
      }

      // Bot uptime
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      // Ping
      const timeStart = Date.now();
      await api.sendMessage("𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝗕𝗼𝘁'𝘀 𝗜𝗻𝗳𝗼...", event.threadID);
      const ping = Date.now() - timeStart;

      // Message
      const message = `╭───── 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ─────⭓
├─「𝐔𝐏𝐓𝐈𝐌𝐄」
│» ${uptimeString}
├─「𝐏𝐈𝐍𝐆」
│» ${ping}ms
├─「𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎」
│» Name: ${threadName}
│» ID: ${threadID}
│» Members: ${threadMem}
│» Male: ${maleCount} | Female: ${femaleCount}
│» Admins: ${qtvCount}
│» Messages: ${messageCount}
╰────────────────────⭓`;

      // Send message with attachment
      api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath) // Clean up after sending
      );

    } catch (error) {
      console.error("ERROR in ts.js:", error);
      api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
    }
  }
};
