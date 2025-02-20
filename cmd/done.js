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
      const data = response.data; // Lấy dữ liệu JSON từ API

      if (typeof data === 'object') {
        ctx.reply(`📩 Phản hồi từ API:\n\n📌 **Trạng thái**: ${data.status}\n📜 **Thông báo**: ${data.message}`);
      } else {
        ctx.reply(`📩 Phản hồi từ API: ${data}`);
      }
    } catch (error) {
      ctx.reply("⚠️ Lỗi khi cập nhật trạng thái!");
      console.error("Lỗi API:", error);
    }
  });
};
