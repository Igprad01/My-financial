// polling-bot.js - Alternative untuk development tanpa webhook
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.log('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env');
  process.exit(1);
}

const { handleUpdate } = require('./src/lib/telegram.ts'); // Atau import jika menggunakan ES modules

let offset = 0;

async function pollUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=30`);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        console.log('📨 Update diterima:', update.message?.text || 'callback_query');
        await handleUpdate(update);
        offset = update.update_id + 1;
      }
    }
  } catch (error) {
    console.error('❌ Error polling:', error.message);
  }

  // Poll lagi setelah 1 detik
  setTimeout(pollUpdates, 1000);
}

console.log('🤖 Bot Telegram berjalan dengan polling...');
console.log('📝 Instruksi:');
console.log('1. Pastikan server Next.js berjalan: npm run dev');
console.log('2. Kirim pesan ke bot di Telegram');
console.log('3. Bot akan merespons!');

pollUpdates();