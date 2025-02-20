const fetch = require('node-fetch');
const { generateTextData, hasDataChanged } = require('../utils/helpers');

let previousData = {
  db1: null,
  db2: null,
  db3: null,
};

async function fetchData() {
  try {
    const response = await fetch('https://congnap.id.vn/api/index.php');
    return await response.json();
  } catch (error) {
    console.error('Fetch data error:', error);
    return null;
  }
}

async function checkForUpdates(bot, chatId) {
  const newData = await fetchData();
  
  if (newData && hasDataChanged(newData, previousData)) {
    const message = generateTextData(newData);
    try {
      await bot.telegram.sendMessage(chatId, message);
      console.log('Update sent:', new Date());
    } catch (error) {
      console.error('Send message error:', error);
    }
  }
}

module.exports = {
  fetchData,
  checkForUpdates,
  hasDataChanged
};