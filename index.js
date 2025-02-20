const { Telegraf } = require('telegraf');
const { fetchData } = require('./services/dataService');
const { setupStartCommand } = require('./cmd/start');
const { setupRecallCommand } = require('./cmd/recall');
const { setupAddKhoCloudCommand } = require('./cmd/add_khocloud');
const { setupBanCommand } = require('./cmd/ban');
const setupDoneCommand = require('./cmd/done');

const TELEGRAM_TOKEN = '6783805716:AAFisKmrTvPfgM1YYzvY_o9bgOks6P2DDTk';
const FULL_ACCESS_ID = 5182125784; // ID có toàn quyền
const LIMITED_ACCESS_ID = 7057051358; // ID chỉ có quyền /start và /recall

const bot = new Telegraf(TELEGRAM_TOKEN);

// ✅ Khởi tạo các lệnh từ file riêng
setupStartCommand(bot);
setupRecallCommand(bot, fetchData);
setupAddKhoCloudCommand(bot);
setupBanCommand(bot);
setupDoneCommand(bot);

// 🛑 Chặn tất cả các lệnh khác nếu không có quyền
bot.on('message', (ctx) => {
    const userId = ctx.chat.id;

    if (userId === FULL_ACCESS_ID) return; // Người có quyền full có thể nhập bất kỳ tin nhắn nào
    if (userId === LIMITED_ACCESS_ID) {
        return ctx.reply("🚫 Bạn chỉ có thể dùng /start và /recall.");
    }

    return ctx.reply("🚫 Bạn không có quyền sử dụng bot này!");
});

// 🚀 Khởi động bot
bot.launch();

module.exports = { bot };
