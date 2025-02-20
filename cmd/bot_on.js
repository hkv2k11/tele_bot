module.exports.setupBotOnCommand = (bot, checkForUpdates) => {
    bot.command('bot_on', (ctx) => {
      ctx.reply("✅ Bot đang hoạt động! Kiểm tra dữ liệu mới mỗi 3 giây.");
      checkForUpdates(bot, ctx.chat.id);
    });
  };