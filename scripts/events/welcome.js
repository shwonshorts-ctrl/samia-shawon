// event/welcome.js
/**
 * ╔════════════════════════════╗
 * ║   MELISSA BB'E WELCOME SYSTEM   ║
 * ╚════════════════════════════╝
 * ✦ Bot Author: BADHON ✦
 * ✦ Version: 2.1 
 */

const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "2.1",
        author: " ✦ BADHON ✦",
        category: "events"
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe") {
            try {
                const { threadID } = event;
                const { nickNameBot } = global.GoatBot.config;
                const prefix = global.utils.getPrefix(threadID);
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // Bot join handler
                if (dataAddedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
                    if (nickNameBot) {
                        await api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                    }
                    return message.send(`╭────「 SYSTEM MESSAGE 」────⦿
┃ ✦ Thank you for adding me!
┃ ✦ Bot Prefix: ${prefix}
┃ ✦ Type ${prefix}help for commands
╰─────「 𝗠𝗘𝗟𝗜𝗦𝗔 𝗕𝗕'𝗘 」──────⦿`);
                }

                // Initialize thread welcome data
                if (!global.temp.welcomeEvent[threadID]) {
                    global.temp.welcomeEvent[threadID] = {
                        joinTimeout: null,
                        dataAddedParticipants: []
                    };
                }

                // Add new participants
                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                // Process welcome after delay
                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
                    const threadData = await threadsData.get(threadID);
                    if (threadData.settings.sendWelcomeMessage == false) return;

                    const participants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                    const bannedUsers = threadData.data.banned_ban || [];
                    const threadName = threadData.threadName;
                    const userName = [], mentions = [];
                    let multiple = participants.length > 1;

                    // Get admin info
                    const adminList = await api.getThreadAdministrators(threadID);
                    const adminId = adminList[0];
                    const adminInfo = adminId ? (await api.getUserInfo(adminId))[adminId] : null;
                    const adminName = adminInfo?.name || "Group Admin";

                    // Time-based greeting
                    const joinTime = new Date();
                    const time = (() => {
                        const hours = joinTime.getHours();
                        if (hours < 5) return { text: "Good Night", emoji: "🌙" };
                        if (hours < 12) return { text: "Good Morning", emoji: "🌅" };
                        if (hours < 17) return { text: "Good Afternoon", emoji: "☀️" };
                        if (hours < 21) return { text: "Good Evening", emoji: "🌆" };
                        return { text: "Good Night", emoji: "🌃" };
                    })();

                    // Filter valid users
                    for (const user of participants) {
                        if (bannedUsers.some(item => item.id == user.userFbId)) continue;
                        userName.push(user.fullName);
                        mentions.push({ tag: user.fullName, id: user.userFbId });
                    }

                    if (userName.length == 0) return;

                    // Custom welcome message
                    const welcomeMessage = `╭────「 WELCOME DEAR USER 」────⦿
┃ ✦ ${time.emoji} ${time.text}, ${userName.join(", ")}!
┃ ✦
┃ ✦ 🏠 Group: ${threadName}
┃ ✦ 👑 Admin: ${adminName}
┃ ✦ 👥 Members: ${threadData.participants.length}
┃ ✦ 🤖 Bot: Melissa BB'E
┃ ✦
┃ ✦ 📌 User UID: ${participants[0].userFbId}
┃ ✦ 📌 Group TID: ${threadID}
┃ ✦
┃ ✦ 📅 ${joinTime.toDateString()}
┃ ✦ ⏰ ${joinTime.toLocaleTimeString()}
┃ ✦
┃ ✦ Type ${prefix}help for commands
┃ ✦ Bot Author: BADHON ✦
╰─────「 𝗠𝗘𝗟𝗜𝗦𝗔 𝗕𝗕'𝗘 」──────⦿`;

                    const form = {
                        body: welcomeMessage,
                        mentions: mentions
                    };

                    // Handle attachments
                    if (threadData.data.welcomeAttachment) {
                        const files = threadData.data.welcomeAttachment;
                        const attachments = files.map(file => drive.getFile(file, "stream"));
                        const results = await Promise.allSettled(attachments);
                        form.attachment = results.filter(res => res.status === "fulfilled").map(res => res.value);
                    }

                    await message.send(form);
                    
                    // Send follow-up command help
                    setTimeout(async () => {
                        await message.send({
                            body: `╭────「 COMMAND LIST 」────⦿
┃ ✦ ${prefix}help - Show all commands
┃ ✦ ${prefix}info - Group information
┃ ✦ ${prefix}fun - Entertainment
┃ ✦ ${prefix}mod - Moderator tools
┃ ✦
┃ ✦ Need help? Contact admin!
╰─────「 𝗠𝗘𝗟𝗜𝗦𝗔 𝗕𝗕'𝗘 」──────⦿`,
                            threadID
                        });
                    }, 3000);

                    delete global.temp.welcomeEvent[threadID];
                }, 1500);
            } catch (error) {
                console.error("[WELCOME SYSTEM ERROR]:", error);
                // Fallback welcome
                if (event.threadID) {
                    await message.send({
                        body: `╭────「 SYSTEM ERROR 」────⦿
┃ ✦ Welcome to the group!
┃ ✦ Sorry for the basic welcome
┃ ✦ System will recover shortly
╰─────「 𝗠𝗘𝗟𝗜𝗦𝗔 𝗕𝗕'𝗘 」──────⦿`,
                        threadID: event.threadID
                    });
                }
            }
        }
    }
};
