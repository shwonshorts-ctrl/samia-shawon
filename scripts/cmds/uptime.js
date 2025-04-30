const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function createProgressBar(percentage) {
  const totalBars = 20;
  const filledBars = Math.round(totalBars * percentage / 100);
  const emptyBars = totalBars - filledBars;
  return '▓'.repeat(filledBars) + '░'.repeat(emptyBars);
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "u"],
    version: "3.0",
    author: "𝗕𝗔𝗗𝗛𝗢𝗡 𝗥𝗢𝗛𝗠𝗔𝗡 💀✨",
    role: 0,
    shortDescription: {
      en: "Detailed Uptime, System Status"
    },
    longDescription: {
      en: "Displays Uptime, System Status, and other System-related Information."
    },
    category: "tools",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const start = Date.now();

    // Collecting system uptime and other data
    const uptimeInSeconds = process.uptime();
    const formattedUptime = formatTime(uptimeInSeconds);

    const ping = Date.now() - start;
    const maxUptimeSeconds = 86400;
    const uptimePercent = Math.min((uptimeInSeconds / maxUptimeSeconds) * 100, 100).toFixed(2);
    const uptimeProgressBar = createProgressBar(uptimePercent);

    // System status (example values)
    const systemStatus = {
      users: 5,
      cpuUsage: '35%',
      memoryUsage: '58%'
    };

    const quotes = [
      "“Coding is not just code, it's a life style!”",
      "“Wake up, Code, Repeat!”",
      "“Dream in code, live in reality.”",
      "“Bots run the world silently.”"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Final message with improved design
    const uptimeMessage = `
╭───〔 🖥️ 𝐔𝐏𝐓𝐈𝐌𝐄 𝐑𝐄𝐏𝐎𝐑𝐓 〕───╮
│
│ ⏱️ 𝐓𝐨𝐭𝐚𝐥 𝐔𝐩𝐭𝐢𝐦𝐞: ${formattedUptime}
│
│ 📊 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬:
│ [ ${uptimeProgressBar} ] (${uptimePercent}%)
│
│ ⚡ 𝐏𝐢𝐧𝐠: ${ping}ms
│ 🤖 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: [ ^ ]-`ღ´🦋𝗠𝗲𝗹𝗶𝘀𝗮🍒🥂
│ 🛠️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: v1.0
│
├───〔 🔧 𝐒𝐲𝐬𝐭𝐞𝐦 𝐒𝐭𝐚𝐭𝐮𝐬 〕───
│ 👥 𝐔𝐬𝐞𝐫𝐬: ${systemStatus.users}
│ 💻 𝐂𝐏𝐔: ${systemStatus.cpuUsage}
│ 🧠 𝐌𝐞𝐦𝐨𝐫𝐲: ${systemStatus.memoryUsage}
│
├───〔 ✨ 𝐐𝐮𝐨𝐭𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐌𝐨𝐦𝐞𝐧𝐭 〕───
│ "${randomQuote}"
│
╰───〔 ❤️ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝗕𝗔𝗗𝗛𝗢𝗡💀✨ 〕───╯
`;

    await delay(500);
    await api.sendMessage(uptimeMessage, event.threadID);
  }
};
