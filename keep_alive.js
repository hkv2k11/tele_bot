const express = require('express');
const app = express();
const http = require('http');

// Endpoint đơn giản với HTML5
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bot is Alive!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 20%;
                background-color: #f0f0f0;
            }
            h1 {
                color: #333;
            }
        </style>
    </head>
    <body>
        <h1>Meow! The Bot is Alive! 😺</h1>
        <p>Keep this page open to keep the bot alive.</p>
    </body>
    </html>
  `);
});

// Lắng nghe trên một cổng
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Keepalive server is running on port ${PORT}`);
});

module.exports = app;
