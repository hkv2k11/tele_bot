const { generateTextData } = require('../utils/helpers');

module.exports.setupRecallCommand = (bot, fetchData) => {
  bot.command('recall', async (ctx) => {
    try {
      await ctx.reply("🔄 Đang tải lại dữ liệu...");
      const newData = await fetchData();
      const message = generateTextData(newData) || "❌ Không có dữ liệu mới!";
      await ctx.reply(message);
    } catch (error) {
      console.error('Recall command error:', error);
      await ctx.reply("❌ Lỗi khi tải dữ liệu!");
    }
  });
};