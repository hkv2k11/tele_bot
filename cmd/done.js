const axios = require('axios');

module.exports = (bot) => {
  bot.command('done', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length !== 1) {
      return ctx.reply("❌ Sai cú pháp! Dùng: `/done {request_id}`");
    }

    const requestId = args[0];
    const apiUrl = `https://congnap.id.vn/update/done/index.php?request_id=${requestId}`;

    try {
      const response = await axios.get(apiUrl);
      ctx.reply(`🔄 Đang cập nhật trạng thái...\n📌 Request ID: ${requestId}`);
      ctx.reply(`📩 Phản hồi từ API: ${response.data}`);
    } catch (error) {
      ctx.reply("⚠️ Lỗi khi cập nhật trạng thái!");
      console.error("Lỗi API:", error);
    }
  });
};
