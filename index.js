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
  db3: null,  // Chỉnh lại cho đúng, vì bạn đang sử dụng db1, db2, db3 trong phần so sánh
};

// Hàm tạo bảng ASCII có đường viền
function createAsciiTable(data) {
  const columnWidths = data[0].map((_, colIndex) =>
    Math.max(...data.map(row => String(row[colIndex]).length))
  );

  const separator = '+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+';

  const formatRow = (row) =>
    '| ' +
    row.map((cell, i) => String(cell).padEnd(columnWidths[i])).join(' | ') +
    ' |';

  let table = separator + '\n';
  table += formatRow(data[0]) + '\n'; // Header
  table += separator + '\n';

  for (let i = 1; i < data.length; i++) {
    table += formatRow(data[i]) + '\n';
  }
  table += separator;

  return table;
}

// Lệnh kiểm tra trạng thái (/status)
bot.command('status', async (ctx) => {
  const chatId = ctx.chat.id;
  const startTime = Date.now();

  try {
    const cpuUsage = os.loadavg()[0];
    const totalMemory = os.totalmem() / (1024 * 1024 * 1024);
    const freeMemory = os.freemem() / (1024 * 1024 * 1024);
    const uptimeInSeconds = os.uptime();

    // Tính uptime (d/h/m/s)
    const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    const pingTime = Date.now() - startTime;

    const data = [
      ['Metric', 'Value'],
      ['Ping (ms)', pingTime],
      ['CPU Usage (%)', (cpuUsage * 100).toFixed(2)],
      ['Memory Usage (%)', ((1 - freeMemory / totalMemory) * 100).toFixed(2)],
      ['Total Memory (GB)', totalMemory.toFixed(2)],
      ['Free Memory (GB)', freeMemory.toFixed(2)],
      ['Uptime (d/h/m/s)', `${days}d ${hours}h ${minutes}m ${seconds}s`],
    ];

    const asciiTable = createAsciiTable(data);

    await bot.telegram.sendMessage(chatId, `\`\`\`\n${asciiTable}\n\`\`\``, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Error fetching system data:', error);
    await bot.telegram.sendMessage(chatId, 'Có lỗi xảy ra khi kiểm tra trạng thái!');
  }
});

// Lệnh bật bot (/bot_on)
bot.command('bot_on', async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply("✅ Bot đang hoạt động! Kiểm tra dữ liệu mới sẽ được thực hiện mỗi 30 giây.");
  checkForUpdates(); // Thực hiện kiểm tra ngay lập tức khi chạy lệnh
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

// So sánh dữ liệu cũ và mới
function hasDataChanged(newData) {
  const keys = ['db1', 'db2', 'db3'];
  for (let key of keys) {
    if (JSON.stringify(newData[key]) !== JSON.stringify(previousData[key])) {
      previousData = newData; // Lưu lại dữ liệu mới
      return true;
    }
  }
  return false;
}

// Tạo ASCII khi có dữ liệu mới
function generateASCII(data) {
  let message = '🚨 **Dữ liệu mới vừa cập nhật!** 🚨\n\n';

  const statusMessages = {
    "1": "✅ Thành công",
    "2": "⚠️ Sai mệnh giá",
    "3": "❌ Thẻ lỗi",
    "4": "🛠 Bảo trì hệ thống",
    "99": "⏳ Chờ xử lý",
    "100": "📩 Gửi thẻ thất bại",
  };

  ['db1', 'db2', 'db3'].forEach((tableKey, index) => {
    if (data[tableKey] && data[tableKey].length > 0) {
      const tableName = `Bảng ${index + 1}`;
      let shop = ''; // Biến lưu tên shop
  
      // Xác định tên shop theo bảng
      if (index === 1) {
        shop = "Khocloud 😺";
      } else if (index === 2) {
        shop = "Rbl247 🤓";
      }
  
      // Thêm tiêu đề bảng
      message += `📈 **${tableName} ${shop ? '- ' + shop : ''}**:\n`;
  
      // Chuẩn bị dữ liệu cho bảng
      const tableData = [];
      const headers = ['#', 'Mã GD', 'Ngày GD', 'Trạng thái', 'Số tiền', 'Người dùng', 'Serial', 'Nhà mạng'];
      tableData.push(headers);
  
      data[tableKey].forEach((row, idx) => {
        const statusMessage = statusMessages[row.status] || "🔍 Không xác định";
        const rowData = tableKey === 'db1'
          ? [
              idx + 1,
              row.code,
              row.transaction_date,
              row.gateway,
              `${row.amount_in} VND`,
              row.account_number,
              '',
              row.transaction_content,
            ]
          : [
              idx + 1,
              row.trans_id || row.code,
              row.created_at,
              statusMessage,
              `${row.amount} VND`,
              row.request_id,
              row.serial,
              row.telco,
            ];
  
        tableData.push(rowData);
      });
  
      // Tạo bảng ASCII
      const asciiTable = createAsciiTable(tableData);
      message += `\`\`\`\n${asciiTable}\n\`\`\`\n`;
    }
  });

  return message; // Thêm dòng này hehe
}

// Kiểm tra và gửi thông báo nếu có dữ liệu mới
async function checkForUpdates() {
  const newData = await fetchData();
  if (newData && hasDataChanged(newData)) {
    const asciiMessage = generateASCII(newData);
    await bot.telegram.sendMessage(CHAT_ID, asciiMessage);
  }
}

// Cài đặt kiểm tra mỗi 30 giây
setInterval(checkForUpdates, 30000);

// Khởi chạy bot
bot.launch();
