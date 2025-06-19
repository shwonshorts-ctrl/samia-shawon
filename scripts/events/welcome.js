const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: " ✦ BADHON ✦ ",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return;
				}
				
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					
					if (userName.length == 0) return;
					
					// Get admin names
					const adminIDs = threadData.adminIDs || [];
					const adminNames = [];
					for (const adminID of adminIDs) {
						try {
							const userInfo = await api.getUserInfo(adminID);
							adminNames.push(userInfo[adminID].name);
						} catch (e) {
							console.error("Error getting admin info:", e);
						}
					}
					
					const joinTime = new Date();
					const timeText = hours <= 10 ? getLang("session1") :
									hours <= 12 ? getLang("session2") :
									hours <= 18 ? getLang("session3") : getLang("session4");
					const timeEmoji = hours <= 10 ? "🌅" :
									hours <= 12 ? "☀️" :
									hours <= 18 ? "🌇" : "🌃";
					
					const welcomeMessage = `╭────「 WELCOME DEAR USER 」────⦿
┃ ✦ ${timeEmoji} ${timeText}, ${userName.join(", ")}!
┃ ✦
┃ ✦ 🏠 Group: ${threadName}
┃ ✦ 👑 Admin: ${adminNames.join(", ") || "None"}
┃ ✦ 👥 Members: ${threadData.participants.length}
┃ ✦ 🤖 Bot: Melissa BB'E
┃ ✦
┃ ✦ 📌 User UID: ${dataAddedParticipants[0].userFbId}
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
						mentions: mentions.length ? mentions : null
					};

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
