const { Telegraf } = require('telegraf');
const { fetchData, checkForUpdates } = require('./services/dataService');
const { setupStartCommand } = require('./cmd/start');
const { setupBotOnCommand } = require('./cmd/bot_on');
const { setupRecallCommand } = require('./cmd/recall');
const { setupAddKhoCloudCommand } = require('./cmd/add_khocloud'); // Thêm lệnh mới

const TELEGRAM_TOKEN = '6783805716:AAFisKmrTvPfgM1YYzvY_o9bgOks6P2DDTk';
const CHAT_ID = '5182125784';

const bot = new Telegraf(TELEGRAM_TOKEN);

// Khởi tạo các lệnh
setupStartCommand(bot);
setupBotOnCommand(bot, checkForUpdates);
setupRecallCommand(bot, fetchData);
setupAddKhoCloudCommand(bot); // Đăng ký lệnh add

// Khởi động bot
bot.launch();


module.exports = { bot };
