const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "1.20",
    author: "𝗕𝗔𝗗𝗛𝗢𝗡 𝗥𝗢𝗛𝗠𝗔𝗡 💀✨",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📖 View command usage" },
    longDescription: { en: "📜 View command usage and list all commands directly" },
    category: "ℹ️ Info",
    guide: { en: "🔹 {pn}help / {pn}help cmdName" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `╭━━━━━━━━━━━━━━━━━╮\n` +
                `│   -ღ´🦋𝗠𝗲𝗹𝗶𝘀𝗮🍒🥂\n` +
                `╰━━━━━━━━━━━━━━━━━╯\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      Object.keys(categories).forEach((category) => {
        msg += `╭━ 📂 ${category.toUpperCase()}\n`;
        categories[category].sort().forEach((item) => {
          msg += `│ 🔹 ${item}\n`;
        });
        msg += `╰━━━━━━━━━━━━━━╯\n\n`;
      });

      msg += `╭━━━━━━━━━━━━━━━╮\n` +
             `┃ 📌 Total Commands: ${commands.size}\n` +
             `┃ 🔹 Type: ${prefix}help [cmdName]\n` +
             `╰━━━━━━━━━━━━━━━╯`;

      await message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return await message.reply(`❌ Command "*${commandName}*" not found.`);
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";
      const longDescription = configCommand.longDescription?.en || "No description available.";
      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{pn}/g, prefix).replace(/{n}/g, configCommand.name);
      const aliasList = aliases.get(configCommand.name) || [];

      const response = `─━ 📌 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎 ━─\n` +
                       `🔹 Name: ${configCommand.name}\n` +
                       `📜 Description: ${longDescription}\n` +
                       `🆔 Aliases: ${aliasList.length ? aliasList.join(", ") : "None"}\n` +
                       `📎 Version: ${configCommand.version || "1.0"}\n` +
                       `👤 Role: ${roleText}\n` +
                       `⏳ Cooldown: ${configCommand.countDown || "1"}s\n` +
                       `👨‍💻 Author: ${author}\n` +
                       `📖 Usage: ${usage}\n` +
                       `━━━━━━━━━━━━━━━━━━━━`;

      await message.reply(response);
    }
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "🌎 All Users";
    case 1: return "👑 Group Admins";
    case 2: return "🤖 Bot Admins";
    default: return "❓ Unknown Role";
  }
  }
