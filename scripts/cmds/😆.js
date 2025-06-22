const { getStreamFromURL } = global.utils;


module.exports = {

  config: {

    name: "😆",

    version: 2.1,

    author: "BADHON",

    longDescription: "Info about bot and owner",

    category: "Special",

    guide: {

      en: "{p}SEXY BBY"

    },

    usePrefix: false

  },

  onStart: async function (context) {

    await module.exports.sendOwnerInfo(context);

  },

  onChat: async function ({ event, message, usersData }) {

    const prefix = global.GoatBot.config.prefix;

    const body = (event.body || "").toLowerCase().trim();

    const triggers = ["😆","😂"," 🤣","😹","😁", `${prefix}owner`];

    if (!triggers.includes(body)) return;

    await module.exports.sendOwnerInfo({ event, message, usersData });

  },

  sendOwnerInfo: async function ({ event, message, usersData }) {

    const videoURL = "https://files.catbox.moe/q4vxo1.mp3";

    const attachment = await getStreamFromURL(videoURL);

    const id = event.senderID;

    const userData = await usersData.get(id);

    const name = userData.name;

    const mentions = [{ id, tag: name }];

    const info = `

    `.trim();


    message.reply({ body: info, attachment, mentions });

  }

};
