// Required modules
const fs = require('fs-extra');
const axios = require('axios');
const jimp = require('jimp');
const { loadImage, createCanvas, registerFont } = require('canvas');
const moment = require('moment-timezone');

// Configurable values
const ADMIN_NAME = "BADHON"; // BADHON in Math Bold
const BOT_NAME = "MELISA🦋🍓"; // MELISA in Math Italic
const FONT_LINK = 'https://drive.google.com/u/0/uc?id=1ZwFqYB-x6S9MjPfYm3t3SP1joohGl4iw&export=download';

module.exports = {
  config: {
    name: "Welcome",
    version: "1.0.0",
    description: "Sends a welcome image when someone joins the group",
    eventType: ["log:subscribe"],
    credits: "DIPTO MIRAI CONVERTED IN GOATBOT BY BADHON"
  },

  onStart: async function () {},

  onEvent: async function ({ event, api, usersData, threadsData }) {
    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName;
    const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A - DD/MM/YYYY");
    const thu = moment.tz("Asia/Dhaka").format("dddd");

    if (!event.logMessageData.addedParticipants) return;

    for (let participant of event.logMessageData.addedParticipants) {
      if (participant.userFbId == api.getCurrentUserID()) continue;

      const userID = participant.userFbId;
      const userName = participant.fullName;
      const memberCount = threadInfo.participantIDs.length;

      const avatarURL = `https://graph.facebook.com/${userID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const bgList = [
        'https://i.imgur.com/dDSh0wc.jpeg',
        'https://i.imgur.com/UucSRWJ.jpeg',
        'https://i.imgur.com/OYzHKNE.jpeg',
        'https://i.imgur.com/V5L9dPi.jpeg',
        'https://i.imgur.com/M7HEAMA.jpeg'
      ];
      const bgURL = bgList[Math.floor(Math.random() * bgList.length)];

      const pathFont = __dirname + "/cache/font.ttf";
      const pathAva = __dirname + "/cache/avt.png";
      const pathBG = __dirname + "/cache/welcome.png";

      if (!fs.existsSync(pathFont)) {
        const fontData = (await axios.get(FONT_LINK, { responseType: 'arraybuffer' })).data;
        fs.outputFileSync(pathFont, fontData);
      }

      const avatar = await jimp.read((await axios.get(avatarURL, { responseType: "arraybuffer" })).data);
      avatar.circle();
      await avatar.writeAsync(pathAva);

      const bgImg = (await axios.get(bgURL, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(pathBG, bgImg);

      const canvas = createCanvas(1902, 1082);
      const ctx = canvas.getContext("2d");

      const baseImage = await loadImage(pathBG);
      const circleAvatar = await loadImage(pathAva);
      registerFont(pathFont, { family: "CustomFont" });

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(circleAvatar, canvas.width / 2 - 188, canvas.height / 2 - 375, 375, 355);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";

      ctx.font = "100px CustomFont";
      ctx.fillText(`${userName}`, canvas.width / 2, canvas.height / 2 + 100);

      ctx.font = "60px CustomFont";
      ctx.fillText(`Welcome to ${threadName}`, canvas.width / 2, canvas.height / 2 + 200);
      ctx.fillText(`You're the ${memberCount}ᵗʰ member`, canvas.width / 2, canvas.height / 2 + 270);
      ctx.fillText(`⏰ ${time} | ${thu}`, canvas.width / 2, canvas.height / 2 + 340);
      ctx.fillText(`🤖 I'm ${BOT_NAME}`, canvas.width / 2, canvas.height / 2 + 410);
      ctx.fillText(`💌 Welcome message from my boss: ${ADMIN_NAME}`, canvas.width / 2, canvas.height / 2 + 480);

      const finalImage = canvas.toBuffer();
      const imgPath = __dirname + "/cache/final.png";
      fs.writeFileSync(imgPath, finalImage);

      api.sendMessage({
        body: `✨ Welcome ${userName} to ${threadName}!`,
        attachment: fs.createReadStream(imgPath)
      }, threadID);
    }
  }
};
