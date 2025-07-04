const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  botName: "Melisa",
  prefix: "^",
  videoUrl: "https://files.catbox.moe/1osmny.mp4",
  adminCount: 2,
  whitelistCount: 2
};

// Helper Functions
function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function createBar(percent, size = 10) {
  const filled = "█".repeat(Math.round(percent * size / 100));
  const empty = "░".repeat(size - Math.round(percent * size / 100));
  return `${filled}${empty}`;
}

async function getDetailedThreadInfo(api, threadID) {
  try {
    const startTime = Date.now();
    const threadInfo = await api.getThreadInfo(threadID);
    
    // Get participant count
    const participants = threadInfo.participants || [];

    // Get admin names
    let adminNames = [];
    if (threadInfo.adminIDs && threadInfo.adminIDs.length > 0) {
      const adminInfo = await api.getUserInfo(threadInfo.adminIDs.map(a => a.id));
      adminNames = threadInfo.adminIDs.map(admin => {
        return adminInfo[admin.id]?.name || "Unknown Admin";
      });
    }

    return {
      currentThread: {
        name: threadInfo.threadName || "Unnamed Group",
        id: threadInfo.threadID,
        participantCount: participants.length,
        messageCount: threadInfo.messageCount || 0,
        adminCount: threadInfo.adminIDs ? threadInfo.adminIDs.length : 0,
        adminNames
      },
      ping: Date.now() - startTime
    };
  } catch (error) {
    console.error("Thread info error:", error);
    return {
      currentThread: {
        name: "Unknown Group",
        id: "N/A",
        participantCount: 0,
        messageCount: 0,
        adminCount: 2,
        adminNames: [ BADHON ]
      },
      ping: -1
    };
  }
}

async function downloadVideo(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: config.videoUrl,
        method: 'GET',
        responseType: 'stream',
        timeout: 15000
      });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    }
    return true;
  } catch (error) {
    console.error("Video download failed:", error);
    return false;
  }
}

// Main Command
module.exports = {
  config: {
    name: "uptime2",
    aliases: ["up2", "ut2"],
    version: "5.4",
    author: "BADHON",
    role: 0,
    category: "system",
    shortDescription: "Complete system and group status",
    longDescription: "Shows detailed system stats and accurate group member information"
  },

  onStart: async function({ api, event }) {
    try {
      // Show loading message
      const loadingMsg = await api.sendMessage("🔄 Preparing comprehensive system report...", event.threadID);
      
      // Get all data in parallel
      const [system, threadData, videoSuccess] = await Promise.all([
        (async () => ({
          uptime: process.uptime(),
          cpu: os.loadavg()[0] * 10,
          memory: (os.totalmem() - os.freemem()) / os.totalmem() * 100,
          platform: os.platform(),
          arch: os.arch(),
          totalMem: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2),
          freeMem: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2)
        }))(),
        getDetailedThreadInfo(api, event.threadID),
        downloadVideo(path.join(__dirname, 'status_video.mp4'))
      ]);

      // Create the detailed message
      const message = {
        body: `
╔═══════════════════════════╗
║  🍷 ${config.botName} System Monitor  ║
╠═══════════════════════════╣
🕒 System Uptime: ${formatTime(os.uptime())}
🤖 Bot Uptime: ${formatTime(system.uptime)}
📡 Ping: ${threadData.ping > 0 ? threadData.ping + 'ms' : 'Failed'}
╠═══════════════════════════╣
💻 CPU: ${system.cpu.toFixed(1)}% ${createBar(system.cpu)}
🧠 RAM: ${system.memory.toFixed(1)}% ${createBar(system.memory)}
   Total: ${system.totalMem}GB | Free: ${system.freeMem}GB
╠═══════════════════════════╣
├─「𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎」
│» Name: ${threadData.currentThread.name}
│» ID: ${threadData.currentThread.id}
│» Members: ${threadData.currentThread.participantCount}
│» Admins: ${threadData.currentThread.adminCount}
│» Messages: ${threadData.currentThread.messageCount}
${threadData.currentThread.adminNames.map(name => `│» • ${name}`).join('\n')}
╠═══════════════════════════╣
⚙️ ${system.platform} ${system.arch}
🔧 Prefix: ${config.prefix}
╚═══════════════════════════╝
`.trim(),
        attachment: videoSuccess ? fs.createReadStream(path.join(__dirname, 'status_video.mp4')) : undefined
      };

      // Send the complete message
      await api.unsendMessage(loadingMsg.messageID);
      await api.sendMessage(message, event.threadID);

    } catch (error) {
      console.error("Command failed:", error);
      await api.sendMessage("⚠️ Failed to generate complete system report", event.threadID);
    }
  }
};
