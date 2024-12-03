const express = require('express');
const si = require('systeminformation'); // Để lấy thông tin hệ thống
const os = require('os');
const app = express();
const http = require('http');


// Endpoint đơn giản để giữ bot hoạt động
app.get('/', (req, res) => {
  res.send('meooooooooooooooooooooooo');
});

// Lắng nghe trên một cổng
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Keepalive server is running on port ${PORT}`);
});

module.exports = app; 
