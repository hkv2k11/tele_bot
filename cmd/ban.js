const axios = require("axios");

function setupBanCommand(bot) {
    bot.command("ban", async (ctx) => {
        const args = ctx.message.text.split(" ").slice(1);

        if (args.length < 1) {
            return ctx.reply("❌ Vui lòng nhập đúng lệnh: /ban {username}");
        }

        const username = args[0];

        const apiUrl = `https://congnap.id.vn/update/ban/index.php?username=${encodeURIComponent(username)}&ban=toggle`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === "success") {
                ctx.reply(`✅ ${data.message}\n🔒 Trạng thái banned: ${data.banned ? "Bị cấm 🚫" : "Không bị cấm ✅"}`);
            } else {
                ctx.reply(`❌ Lỗi: ${data.message}`);
            }
        } catch (error) {
            ctx.reply("❌ Không thể kết nối đến API!");
        }
    });
}

module.exports = { setupBanCommand };
