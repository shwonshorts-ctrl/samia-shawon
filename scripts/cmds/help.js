const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "1.20",
    author: "✦ 𝗕𝗔𝗗𝗛𝗢𝗡 𝗥𝗢𝗛𝗠𝗔𝗡 ✦",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📖 View command usage" },
    longDescription: { en: "📜 View command usage and list all commands directly" },
    category: "ℹ️ Info",
    guide: { en: "🔹 {pn}help\n🔹 {pn}help [command name]" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `╭━━━  -ღ´🦋𝗠𝗲𝗹𝗶𝘀𝗮🍒🥂  ━━━╮\n` +
                `┃ 🔰 Total Commands: ${commands.size}\n` +
                `┃ 📥 Use: ${prefix}help [command]\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > role) continue;
        const category = value.config.category || "📂 Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category of Object.keys(categories)) {
        msg += `🗂️ 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬: ${category.toUpperCase()}\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
        categories[category].sort().forEach((cmd) => {
          msg += `🔹 ${cmd}\n`;
        });
        msg += `━━━━━━━━━━━━━━━━━━━\n\n`;
      }

      msg += `💡 Tip: Type '${prefix}help [command]' for detailed info.\n`;

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

      const response = `╭────「 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐇𝐄𝐋𝐏 」────⦿\n` +
                       `┃ ✦ Name: ${configCommand.name}\n` +
                       `┃ ✦ Description: ${longDescription}\n` +
                       `┃ ✦ Aliases: ${aliasList.length ? aliasList.join(", ") : "None"}\n` +
                       `┃ ✦ Version: ${configCommand.version || "1.0"}\n` +
                       `┃ ✦ Role Required: ${roleText}\n` +
                       `┃ ✦ Cooldown: ${configCommand.countDown || 1}s\n` +
                       `┃ ✦ author: ${author}\n` +
                       `┃ ✦ Usage:\n┃    ${usage}\n` +
                       `╰─────「 𝗠𝗘𝗟𝗜𝗦𝗔 𝗕𝗕'𝗘 」──────⦿`;

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
