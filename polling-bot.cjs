// polling-bot.cjs - Alternative untuk development tanpa webhook
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.log('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env');
  process.exit(1);
}

// Simple polling implementation - copy logic dari telegram.ts
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  }).catch(err => console.error('Send message error:', err));
}

async function handleUpdate(update) {
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim() || '';

    if (text === '/start') {
      const existingUser = await prisma.user.findUnique({
        where: { telegramChatId: chatId.toString() }
      });

      if (!existingUser) {
        await sendMessage(chatId,
          "👋 Selamat datang!\n\n" +
          "Untuk mulai catat keuangan, ketik:\n" +
          "`/daftar Nama Kamu`"
        );
      } else {
        await sendMessage(chatId,
          "🏠 *Menu Utama*\n\n" +
          "Pilih opsi:",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "💰 Tambah Transaksi", callback_data: "add_transaction" },
                  { text: "📊 Lihat Laporan", callback_data: "view_report" }
                ],
                [
                  { text: "📁 Kelola Kategori", callback_data: "manage_categories" },
                  { text: "⚙️ Pengaturan", callback_data: "settings" }
                ]
              ]
            }
          }
        );
      }
    } else if (text.startsWith('/daftar')) {
      const nama = text.replace('/daftar', '').trim();

      if (!nama) {
        return sendMessage(chatId, "❌ Gunakan format: /daftar Nama Kamu");
      }

      try {
        await prisma.user.create({
          data: {
            name: nama,
            telegramChatId: chatId.toString(),
            email: `telegram_${chatId}@temp.local`,
            password: 'telegram_user',
          }
        });

        await sendMessage(chatId, `✅ Registrasi berhasil!\nNama: ${nama}`);
      } catch {
        await sendMessage(chatId, "❌ Gagal mendaftar. Mungkin kamu sudah terdaftar.");
      }
    } else {
      await sendMessage(chatId, "Maaf, perintah tidak dikenal.\nGunakan /start");
    }
  }

  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;

    // Answer callback
    await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: update.callback_query.id })
    }).catch(err => console.error('Answer callback error:', err));

    switch (data) {
      case 'add_transaction':
        await sendMessage(chatId, "💰 *Tambah Transaksi*\n\nKirim format:\n`+10000 Makanan`\n`-5000 Transport`");
        break;
      case 'view_report':
        await sendMessage(chatId, "📊 *Laporan*\n\nFitur ini sedang dalam pengembangan.");
        break;
      case 'manage_categories':
        await sendMessage(chatId, "📁 *Kelola Kategori*\n\nFitur ini sedang dalam pengembangan.");
        break;
      case 'settings':
        await sendMessage(chatId, "⚙️ *Pengaturan*\n\nFitur ini sedang dalam pengembangan.");
        break;
      default:
        await sendMessage(chatId, "❓ Opsi tidak dikenal.");
    }
  }
}

let offset = 0;

async function pollUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=30`);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        console.log('📨 Update diterima:', update.message?.text || update.callback_query?.data || 'unknown');
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
console.log('1. Kirim pesan ke bot di Telegram');
console.log('2. Bot akan merespons!');

pollUpdates();