const os = require("os");
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
  const filledBars = Math.round((totalBars * percentage) / 100);
  const emptyBars = totalBars - filledBars;
  return "▓".repeat(filledBars) + "░".repeat(emptyBars);
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "u"],
    version: "3.1",
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
    try {
      const start = Date.now();

      const uptimeInSeconds = process.uptime();
      const formattedUptime = formatTime(uptimeInSeconds);

      const ping = Date.now() - start;
      const maxUptimeSeconds = 86400;
      const uptimePercent = Math.min((uptimeInSeconds / maxUptimeSeconds) * 100, 100).toFixed(2);
      const uptimeProgressBar = createProgressBar(uptimePercent);

      const cpuLoad = os.loadavg()[0].toFixed(2);
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMemPercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(2);
      const userName = os.userInfo().username;

      const quotes = [
        "“Coding is not just code, it's a life style!”",
        "“Wake up, Code, Repeat!”",
        "“Dream in code, live in reality.”",
        "“Bots run the world silently.”"
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const uptimeMessage = `
╭───〔 🖥️ UPTIME REPORT 〕───╮
│
│ ⏱️ Total Uptime: ${formattedUptime}
│
│ 📊 Progress:
│ [ ${uptimeProgressBar} ] (${uptimePercent}%)
│
│ ⚡ Ping: ${ping}ms
│ 🤖 Bot Name: ღ´🦋𝗠𝗲𝗹𝗶𝘀𝗮🍒🥂
│ 🛠️ Version: v1.0
│
├───〔 🔧 System Status 〕───
│ 👥 User: ${userName}
│ 💻 CPU Load: ${cpuLoad}
│ 🧠 Memory: ${usedMemPercent}%
│
├───〔 ✨ Quote of the Moment 〕───
│ ${randomQuote}
│
╰───〔 ❤️ Powered by BADHON💀 〕───╯
`;

      await delay(500);
      await api.sendMessage(uptimeMessage, event.threadID);
    } catch (err) {
      console.error("Uptime command error:", err);
      return api.sendMessage("❌ An error occurred while fetching system uptime.", event.threadID);
    }
  }
};
