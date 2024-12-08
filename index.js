const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const os = require('os');
require('./keep_alive'); // Import keep_alive.js để giữ bot luôn hoạt động

const TELEGRAM_TOKEN = '6783805716:AAFisKmrTvPfgM1YYzvY_o9bgOks6P2DDTk';
const CHAT_ID = '5182125784';

const bot = new Telegraf(TELEGRAM_TOKEN);

let previousData = {
  db1: null,
  db2: null,
  db3: null, // Điều chỉnh cho phù hợp với các bảng dữ liệu
};


// Lệnh kiểm tra trạng thái bot (/start)
bot.command('start', async (ctx) => {
  const chatId = ctx.chat.id;
  const startTime = Date.now();

  try {
    const cpuUsage = os.loadavg()[0];
    const totalMemory = os.totalmem() / ( 1024 * 1024);
    const freeMemory = os.freemem() / ( 1024 * 1024);
    const uptimeInSeconds = os.uptime();

    // Tính thời gian hoạt động (ngày/giờ/phút/giây)
    const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    const pingTime = Date.now() - startTime;

    const data = [
      ['Ping (ms)', pingTime],
      ['CPU Usage (%)', (cpuUsage).toFixed(2)],
      ['Memory Usage (%)', ((1 - freeMemory / totalMemory)).toFixed(2)],
      ['Total Memory (GB)', totalMemory.toFixed(2)],
      ['Free Memory (GB)', freeMemory.toFixed(2)],
      ['Uptime (d/h/m/s)', `${days}d ${hours}h ${minutes}m ${seconds}s`],
    ];

    // Format data as plain text
    let textMessage = '';
    data.forEach(row => {
      textMessage += `${row[0]}: ${row[1]}\n`;
    });

    await bot.telegram.sendMessage(chatId, textMessage);
  } catch (error) {
    console.error('Error fetching system data:', error);
    await bot.telegram.sendMessage(chatId, 'Có lỗi xảy ra khi kiểm tra trạng thái!');
  }
});

// Lệnh để bật bot (/bot_on)
bot.command('bot_on', async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply("✅ Bot đang hoạt động! Kiểm tra dữ liệu mới sẽ được thực hiện mỗi 3 giây.");
  checkForUpdates(); // Bắt đầu kiểm tra ngay khi lệnh được chạy
});

// Hàm lấy dữ liệu từ API
async function fetchData() {
  try {
    const response = await fetch('https://congnap.id.vn/api/');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Hàm so sánh dữ liệu cũ và mới
function hasDataChanged(newData) {
  const keys = ['db1', 'db2', 'db3'];
  for (let key of keys) {
    if (JSON.stringify(newData[key]) !== JSON.stringify(previousData[key])) {
      previousData[key] = newData[key]; // Cập nhật dữ liệu cũ
      return true;
    }
  }
  return false;
}

// Hàm tạo dữ liệu và gửi thông báo nếu có dữ liệu mới
function generateTextData(data) {
  const statusMessages = {
    "1": "✅ Thành công",
    "2": "⚠️ Sai mệnh giá",
    "3": "❌ Thẻ lỗi",
    "4": "🛠 Bảo trì hệ thống",
    "99": "⏳ Chờ xử lý",
    "100": "📩 Gửi thẻ thất bại",
  };

  let finalMessage = ''; // Biến chứa toàn bộ thông báo

  ['db1', 'db2', 'db3'].forEach((tableKey, index) => {
    if (data[tableKey] && data[tableKey].length > 0) {
      const shop = index === 0 ? "bloxmmo 🤓-atm" : index === 1 ? "Khocloud 😺" : "bloxmmo 🤓";

      // Chuẩn bị dữ liệu cho bảng
      data[tableKey].forEach((row, idx) => {
        const statusMessage = statusMessages[row.status] || "🔍 Không xác định";
        const rowData = tableKey === 'db1'
          ? `\n#${idx + 1}\nMã GD: ${row.reference_number},\nNgày GD: ${row.transaction_date},\nTrạng thái: done,\nSố tiền: ${row.amount_in} VND,\nNgười dùng: ${row.code},\nSố tài khoản: ${row.sub_account},\nWeb: ${shop}`
          : `\n#${idx + 1}\nMã GD: ${row.trans_id || row.code},\nNgày GD: ${row.created_at},\nTrạng thái: ${statusMessage},\nSố tiền: ${row.amount} VND,\nNgười dùng/mã hash: ${row.request_id},\nSerial: ${row.serial},\nNhà mạng: ${row.telco},\nWeb: ${shop}`;

        finalMessage += `${rowData}\n`; // Đưa dữ liệu vào finalMessage
      });
    }
  });

  return finalMessage; // Trả về thông báo cuối cùng chứa tất cả các bảng
}

// Kiểm tra và gửi thông báo nếu có dữ liệu mới
async function checkForUpdates() {
  const newData = await fetchData();
  if (newData && hasDataChanged(newData)) {
    const textMessage = generateTextData(newData); // Tạo dữ liệu dưới dạng văn bản
    try {
      await bot.telegram.sendMessage(CHAT_ID, textMessage); // Gửi thông báo văn bản
      console.log('Message sent successfully!');  // Log khi gửi thành công
    } catch (error) {
      console.error('Error sending message:', error);  // Log lỗi nếu gửi không thành công
    }
  }
}

// Thiết lập kiểm tra mỗi 3 giây
setInterval(checkForUpdates, 3000);

// call lại các dữ liệu (/recall)
bot.command('recall', async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply("✅ Đang gọi lại dữ liệu. Vui lòng chờ...");
  const newData = await fetchData();
  if (newData) {
    const textMessage = generateTextData(newData);
    await bot.telegram.sendMessage(chatId, textMessage);
  } else {
    await bot.telegram.sendMessage(chatId, "❌ Lỗi : cái oắc đờ phắc gì vậy???");
  }
});



// Khởi động bot
bot.launch();
