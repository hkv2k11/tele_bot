const os = require('os');
const { formatUptime } = require('../utils/helpers');

module.exports.setupStartCommand = (bot) => {
  bot.command('start', async (ctx) => {
    const startTime = Date.now();
    
    try {
      const cpuUsage = os.loadavg()[0];
      const totalMemory = os.totalmem() / (1024 * 1024);
      const freeMemory = os.freemem() / (1024 * 1024);
      const uptime = formatUptime(os.uptime());
      
      const pingTime = Date.now() - startTime;

      const statusData = [
        ['Ping (ms)', pingTime],
        ['CPU Usage (%)', cpuUsage.toFixed(2)],
        ['Memory Usage (%)', (1 - freeMemory / totalMemory).toFixed(2)],
        ['Total Memory (GB)', totalMemory.toFixed(2)],
        ['Free Memory (GB)', freeMemory.toFixed(2)],
        ['Uptime', uptime],
      ];

      const message = statusData.map(([label, value]) => `${label}: ${value}`).join('\n');
      await ctx.reply(message);
    } catch (error) {
      console.error('Error in start command:', error);
      await ctx.reply('⚠️ Có lỗi xảy ra khi kiểm tra trạng thái hệ thống!');
    }
  });
};