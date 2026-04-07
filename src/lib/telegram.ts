import { prisma } from './prisma';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramMessage {
  chat: { id: number };
  text?: string;
  from?: { id: number; first_name: string; username?: string };
}

interface TelegramCallbackQuery {
  id: string;
  data: string;
  message: { chat: { id: number } };
}

interface TelegramUpdate {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

async function sendMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  }).catch(err => console.error(err));
}

export async function handleUpdate(update: unknown) {
  const upd = update as TelegramUpdate; // Type assertion for Telegram update

  // Jika ada pesan teks
  if (upd.message) {
    const chatId = upd.message.chat.id;
    const text = upd.message.text?.trim() || '';

    if (text === '/start') {
      await sendMessage(chatId, 
        "👋 Halo! Selamat datang di Financial Bot.\n\n" +
        "Ketik /daftar Nama Kamu untuk mulai.\n" +
        "Contoh: /daftar Bagus"
      );
    } 
    else if (text.startsWith('/daftar')) {
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
    } 
    else {
      await sendMessage(chatId, "Maaf, perintah tidak dikenal.\nGunakan /start");
    }
  }
}