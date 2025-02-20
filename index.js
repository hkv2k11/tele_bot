const { Telegraf } = require('telegraf');
const { fetchData, checkForUpdates } = require('./services/dataService');
const { setupStartCommand } = require('./cmd/start');
const { setupBotOnCommand } = require('./cmd/bot_on');
const { setupRecallCommand } = require('./cmd/recall');

const TELEGRAM_TOKEN = '6783805716:AAFisKmrTvPfgM1YYzvY_o9bgOks6P2DDTk';
const CHAT_ID = '5182125784';

const bot = new Telegraf(TELEGRAM_TOKEN);

// Khởi tạo các lệnh
setupStartCommand(bot);
setupBotOnCommand(bot, checkForUpdates);
setupRecallCommand(bot, fetchData);

// Khởi động bot
bot.launch();

// Thiết lập kiểm tra định kỳ
setInterval(() => checkForUpdates(bot, CHAT_ID), 3000);

module.exports = { bot };