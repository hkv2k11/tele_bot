const axios = require("axios");

module.exports = {
    name: "add",
    description: "Cộng tiền vào tài khoản",
    execute: async (bot, msg, args) => {
        if (args.length < 2) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập đúng lệnh: /add {username} {money}");
        }

        const username = args[0];
        const money = parseFloat(args[1]);

        if (isNaN(money) || money <= 0) {
            return bot.sendMessage(msg.chat.id, "❌ Số tiền không hợp lệ!");
        }

        const apiUrl = `https://congnap.id.vn/index.php?username=${encodeURIComponent(username)}&amount=${money}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === "success") {
                bot.sendMessage(msg.chat.id, `✅ ${data.message}\n💰 Số dư mới: ${data.new_balance}`);
            } else {
                bot.sendMessage(msg.chat.id, `❌ Lỗi: ${data.message}`);
            }
        } catch (error) {
            bot.sendMessage(msg.chat.id, "❌ Không thể kết nối đến API!");
        }
    }
};
