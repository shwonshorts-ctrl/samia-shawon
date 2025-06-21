const fs = require('fs');
const path = require('path');
const nodeSchedule = require('node-schedule');

class PrayerTimes {
    constructor() {
        this.config = {
            name: "prayer"
            timezone: "Asia/Dhaka",
            author: "Badhon",
            version: "3.0.0",
            dataFile: path.join(__dirname, 'prayer_times.json')
        };

        this.initializeData();
        this.setupScheduler();
    }

    initializeData() {
        this.times = {
            regular: {
                fajr: "05:00",
                sunrise: "06:00",
                dhuhr: "12:15",
                asr: "15:45",
                maghrib: "17:30",
                isha: "19:15"
            },
            friday: {
                fajr: "05:00",
                sunrise: "06:00",
                jummah: "13:15",
                asr: "15:45",
                maghrib: "17:30"
            }
        };

        this.kalemahs = {
            fajr: {
                title: {
                    en: "First Kalimah (Tayyibah)",
                    bn: "প্রথম কালেমা (তাইয়্যিবা)",
                    ar: "الكلمة الأولى (الطيبة)"
                },
                text: {
                    en: "La ilaha illallah Muhammadur Rasulullah",
                    bn: "লা ইলাহা ইল্লাল্লাহু মুহাম্মাদুর রাসূলুল্লাহ",
                    ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ"
                },
                translation: {
                    en: "There is no god but Allah, Muhammad is the Messenger of Allah",
                    bn: "আল্লাহ ছাড়া কোনো ইলাহ নেই, মুহাম্মদ (সা.) আল্লাহর রাসূল",
                    ar: "لا إله إلا الله محمد رسول الله"
                }
            },
            dhuhr: {
                title: {
                    en: "Second Kalimah (Shahadah)",
                    bn: "দ্বিতীয় কালেমা (শাহাদাহ)",
                    ar: "الكلمة الثانية (الشهادة)"
                },
                text: {
                    en: "Ashhadu alla ilaha illallahu wahdahu la sharika lahu",
                    bn: "আশহাদু আল্লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শরীকা লাহু",
                    ar: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ"
                },
                translation: {
                    en: "I bear witness that there is no god but Allah Alone without any partner",
                    bn: "আমি সাক্ষ্য দিচ্ছি যে আল্লাহ ছাড়া কোনো ইলাহ নেই, তিনি একক, তাঁর কোনো শরীক নেই",
                    ar: "أشهد أن لا إله إلا الله وحده لا شريك له"
                }
            },
            asr: {
                title: {
                    en: "Third Kalimah (Tamjeed)",
                    bn: "তৃতীয় কালেমা (তামজীদ)",
                    ar: "الكلمة الثالثة (التمجيد)"
                },
                text: {
                    en: "Subhanallahi wal hamdulillahi wa la ilaha illallahu wallahu akbar",
                    bn: "সুবহানাল্লাহি ওয়াল হামদুলিল্লাহি ওয়া লা ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার",
                    ar: "سُبْحَانَ ٱللَّٰهِ وَٱلْحَمْدُ لِلَّٰهِ وَلَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَٱللَّٰهُ أَكْبَرُ"
                },
                translation: {
                    en: "Glory be to Allah, all praise be to Allah, there is no god but Allah, and Allah is the Greatest",
                    bn: "আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো ইলাহ নেই, আল্লাহ সর্বশ্রেষ্ঠ",
                    ar: "سبحان الله والحمد لله ولا إله إلا الله والله أكبر"
                }
            },
            maghrib: {
                title: {
                    en: "Fourth Kalimah (Tawheed)",
                    bn: "চতুর্থ কালেমা (তাওহীদ)",
                    ar: "الكلمة الرابعة (التوحيد)"
                },
                text: {
                    en: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu yuhyi wa yumitu wa huwa ala kulli shayin qadir",
                    bn: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শরীকা লাহু লাহুল মুলকু ওয়া লাহুল হামদু ইউহয়ি ওয়া ইউমিতু ওয়া হুয়া আলা কুল্লি শাইয়িন কাদির",
                    ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
                },
                translation: {
                    en: "There is no god but Allah Alone, He has no partner, His is the dominion and His is the praise, He gives life and causes death, and He is Able to do all things",
                    bn: "আল্লাহ ছাড়া কোনো ইলাহ নেই, তিনি একক, তাঁর কোনো শরীক নেই, রাজত্ব তাঁরই, প্রশংসা তাঁরই, তিনি জীবন দান করেন ও মৃত্যু ঘটান, আর তিনি সব কিছুর উপর ক্ষমতাবান",
                    ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد يحيي ويميت وهو على كل شيء قدير"
                }
            },
            isha: {
                title: {
                    en: "Fifth Kalimah (Istighfar)",
                    bn: "পঞ্চম কালেমা (ইস্তিগফার)",
                    ar: "الكلمة الخامسة (الاستغفار)"
                },
                text: {
                    en: "Astaghfirullahal ladhi la ilaha illa huwal hayyul qayyumu wa atubu ilaih",
                    bn: "আস্তাগফিরুল্লাহাল লাজি লا ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুমু ওয়া আতুবু ইলাইহি",
                    ar: "أَسْتَغْفِرُ ٱللَّٰهَ ٱلَّذِي لَا إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ وَأَتُوبُ إِلَيْهِ"
                },
                translation: {
                    en: "I seek forgiveness from Allah, there is no god but He, the Ever-Living, the Self-Subsisting, and I turn to Him in repentance",
                    bn: "আমি ক্ষমা প্রার্থনা করছি সেই আল্লাহর কাছে যিনি ছাড়া কোনো ইলাহ নেই, তিনি চিরঞ্জীব, সবকিছুর ধারক, আর আমি তাঁর কাছেই তওবা করছি",
                    ar: "أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه"
                }
            }
        };
    }

    setupScheduler() {
        // Clear existing jobs
        nodeSchedule.gracefulShutdown();

        // Schedule for each prayer time
        this.schedulePrayerNotification('fajr');
        this.schedulePrayerNotification('dhuhr');
        this.schedulePrayerNotification('asr');
        this.schedulePrayerNotification('maghrib');
        this.schedulePrayerNotification('isha');

        console.log("Prayer notifications scheduled successfully!");
    }

    schedulePrayerNotification(prayerName) {
        const time = this.getPrayerTime(prayerName);
        if (!time) return;

        const [hours, minutes] = time.split(':');
        
        const rule = new nodeSchedule.RecurrenceRule();
        rule.hour = parseInt(hours);
        rule.minute = parseInt(minutes);
        rule.tz = this.config.timezone;

        nodeSchedule.scheduleJob(rule, () => {
            this.sendNotification(prayerName);
        });
    }

    getPrayerTime(prayerName) {
        const times = this.isFriday() ? this.times.friday : this.times.regular;
        return times[prayerName] || null;
    }

    isFriday() {
        return new Date().getDay() === 5;
    }

    sendNotification(prayerName) {
        if (this.isFriday() && prayerName === 'dhuhr') {
            this.sendJummahNotification();
            return;
        }

        const kalemah = this.kalemahs[prayerName];
        if (!kalemah) return;

        const message = this.createNotificationMessage(prayerName, kalemah);
        this.sendMessage(message);
    }

    sendJummahNotification() {
        let message = "=== জুম্মার মোবারক ===\n";
        message += `জুম্মার নামাজের সময়: ${this.times.friday.jummah}\n\n`;
        
        // Send all Kalemahs for Jummah
        for (const [prayer, kalemah] of Object.entries(this.kalemahs)) {
            message += this.createNotificationMessage(prayer, kalemah) + "\n\n";
        }

        this.sendMessage(message);
    }

    createNotificationMessage(prayerName, kalemah) {
        let message = `=== ${prayerName.toUpperCase()} নামাজের সময় ===\n`;
        message += `সময়: ${this.getPrayerTime(prayerName)}\n\n`;
        
        message += `কালেমা:\n`;
        message += `ইংরেজি: ${kalemah.title.en}\n`;
        message += `${kalemah.text.en}\n`;
        message += `অর্থ: ${kalemah.translation.en}\n\n`;
        
        message += `বাংলা: ${kalemah.title.bn}\n`;
        message += `${kalemah.text.bn}\n`;
        message += `অর্থ: ${kalemah.translation.bn}\n\n`;
        
        message += `আরবি: ${kalemah.title.ar}\n`;
        message += `${kalemah.text.ar}\n`;
        message += `অর্থ: ${kalemah.translation.ar}`;

        return message;
    }

    sendMessage(message) {
        // Implement your actual message sending mechanism here
        // This could be SMS, email, console log, or any other notification system
        console.log("\n" + message);
        
        // Example: Write to a file
        fs.appendFileSync('prayer_notifications.log', `${new Date().toISOString()}\n${message}\n\n`);
    }

    getCurrentSchedule() {
        const schedule = {};
        const prayers = this.isFriday() ? 
            ['fajr', 'jummah', 'asr', 'maghrib'] : 
            ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

        for (const prayer of prayers) {
            schedule[prayer] = this.getPrayerTime(prayer);
        }

        return schedule;
    }
}

// Initialize and run
const prayerTimes = new PrayerTimes();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = prayerTimes;
}

// Display current schedule if run directly
if (require.main === module) {
    console.log("Current Prayer Schedule:");
    console.log(prayerTimes.getCurrentSchedule());
    console.log("\nNotifications will be sent automatically at prayer times.");
}
