const axios = require("axios");

function setupAddKhoCloudCommand(bot) {
    bot.command("add", async (ctx) => {
        const args = ctx.message.text.split(" ").slice(1); // Lấy tham số từ lệnh

        if (args.length < 2) {
            return ctx.reply("❌ Vui lòng nhập đúng lệnh: /add {username} {money}");
        }

        const username = args[0];
        const money = parseFloat(args[1]);

        if (isNaN(money) || money <= 0) {
            return ctx.reply("❌ Số tiền không hợp lệ!");
        }

        const apiUrl = `https://congnap.id.vn/index.php?username=${encodeURIComponent(username)}&amount=${money}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === "success") {
                ctx.reply(`✅ ${data.message}\n💰 Số dư mới: ${data.new_balance}`);
            } else {
                ctx.reply(`❌ Lỗi: ${data.message}`);
            }
        } catch (error) {
            ctx.reply("❌ Không thể kết nối đến API!");
        }
    });
}

module.exports = { setupAddKhoCloudCommand };
