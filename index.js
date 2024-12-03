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
  db3: null, 
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
async function generateASCII(data) {
  let messages = [];  // Array to store individual messages for each table

  const statusMessages = {
    "1": "✅ Thành công",
    "2": "⚠️ Sai mệnh giá",
    "3": "❌ Thẻ lỗi",
    "4": "🛠 Bảo trì hệ thống",
    "99": "⏳ Chờ xử lý",
    "100": "📩 Gửi thẻ thất bại",
  };

  // Iterate through the tables db1, db2, db3
  ['db1', 'db2', 'db3'].forEach((tableKey, index) => {
    if (data[tableKey] && data[tableKey].length > 0) {
      const tableName = `Bảng ${index + 1}`;
      let shop = ''; // Variable to store shop name

      // Assign shop name based on the table
      if (index === 1) {
        shop = "Rbl247 🤓-atm";
      } else if (index === 2) {
        shop = "Rbl247 🤓";
      } else if (index === 3) {
        shop = "Khocloud 😺";
      }

      // Start the message for the table
      let message = `🚨 **Dữ liệu mới vừa cập nhật!** 🚨\n\n`;
      message += `📈 **${tableName} ${shop ? '- ' + shop : ''}**:\n`;

      const headers = ['#', 'Mã GD', 'Ngày GD', 'Trạng thái', 'Số tiền', 'Người dùng/Mã xác minh', 'Serial', 'Nhà mạng'];
      const tableData = [headers];

      // Add rows to the table
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

      // Create the ASCII table from the data
      const asciiTable = createAsciiTable(tableData);
      message += `\`\`\`\n${asciiTable}\n\`\`\`\n`;

      // Split the message into smaller parts if it's too long
      const maxMessageLength = 4096;  // Telegram message limit
      while (message.length > maxMessageLength) {
        const part = message.slice(0, maxMessageLength);
        messages.push(part);
        message = message.slice(maxMessageLength);
      }

      // Add the remaining part of the message
      if (message.length > 0) {
        messages.push(message);
      }
    }
  });

  return messages;  // Return an array of messages
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
