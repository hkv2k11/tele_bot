const { Telegraf } = require('telegraf');
const { fetchData, checkForUpdates } = require('./services/dataService');
const { setupStartCommand } = require('./cmd/start');
const { setupBotOnCommand } = require('./cmd/bot_on');
const { setupRecallCommand } = require('./cmd/recall');
const { setupAddKhoCloudCommand } = require('./cmd/add_khocloud');
const { setupBanCommand } = require('./cmd/ban');
const { setupDoneCommand } = require('./cmd/done');

const TELEGRAM_TOKEN = '6783805716:AAFisKmrTvPfgM1YYzvY_o9bgOks6P2DDTk';
const FULL_ACCESS_ID = 5182125784; // ID người có toàn quyền
const LIMITED_ACCESS_ID = 7057051358; // ID người chỉ có quyền /start và /recall

const bot = new Telegraf(TELEGRAM_TOKEN);

// ✅ Lệnh /start (ai cũng dùng được)
bot.command('start', (ctx) => {
    ctx.reply("🚀 Bot đã khởi động!");
});

// ✅ Lệnh /recall (ai cũng dùng được)
bot.command('recall', (ctx) => {
    fetchData();
    ctx.reply("🔄 Dữ liệu đã được làm mới!");
});

// ✅ Lệnh /check (chỉ người có FULL quyền mới dùng được)
bot.command('check', (ctx) => {
    if (ctx.chat.id !== FULL_ACCESS_ID) {
        return ctx.reply("🚫 Bạn không có quyền sử dụng lệnh này!");
    }
    checkForUpdates(bot, ctx.chat.id);
    ctx.reply("✅ Đang kiểm tra cập nhật...");
});

// 🛑 Chặn tất cả các lệnh khác nếu không có quyền
bot.on('message', (ctx) => {
    const userId = ctx.chat.id;
    
    if (userId === FULL_ACCESS_ID) return; // Người có quyền full có thể nhập bất kỳ tin nhắn nào
    if (userId === LIMITED_ACCESS_ID) {
        return ctx.reply("🚫 Bạn chỉ có thể dùng /start và /recall.");
    }

    return ctx.reply("🚫 Bạn không có quyền sử dụng bot này!");
});

// ✅ Khởi tạo các lệnh
setupStartCommand(bot);
setupBotOnCommand(bot, checkForUpdates);
setupRecallCommand(bot, fetchData);
setupAddKhoCloudCommand(bot);
setupBanCommand(bot);
setupDoneCommand(bot);

// 🚀 Khởi động bot
bot.launch();


module.exports = { bot };
