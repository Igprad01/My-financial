import { prisma } from "./prisma";
import bcrypt from "bcrypt";

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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  }).catch((err) => console.error(err));
}

export async function handleUpdate(update: unknown) {
  const upd = update as TelegramUpdate;
  if (upd.message) {
    const chatId = upd.message.chat.id;
    const text = upd.message.text?.trim() || "";

    if (text === "/start") {
      await sendMessage(
        chatId,
        "👋 Halo! Selamat datang di Financial Bot.\n\n" +
          "Ketik /daftar Nama, Email, Password untuk mulai.\n" +
          "Contoh: /daftar Budi Santoso, budi@email.com, rahasia123",
      );
    } else if (text.startsWith("/daftar")) {
      const inputString = text.replace("/daftar", "").trim();
      const inputParts = inputString.split(",");

      if (inputParts.length < 3) {
        return sendMessage(
          chatId,
          "❌ Format salah!\n\n" +
            "Gunakan format: /daftar Nama, Email, Password\n" +
            "Contoh: /daftar Budi, budi@email.com, rahasia123",
        );
      }

      // PERBAIKAN: Menggunakan nama variabel baru & optional chaining (?)
      // Ini akan memaksa TypeScript mereset pengecekan tipe datanya
      const inputNama = inputParts[0]?.trim();
      const inputEmail = inputParts[1]?.trim();
      const inputPassword = inputParts[2]?.trim();

      if (!inputNama || !inputEmail || !inputPassword) {
        return sendMessage(
          chatId,
          "❌ Nama, Email, dan Password tidak boleh kosong.",
        );
      }

      try {
        const hashedPassword = await bcrypt.hash(inputPassword, 10);

        const Newuser = await prisma.user.create({
          data: {
            name: inputNama,
            telegramChatId: chatId.toString(),
            email: inputEmail,
            password: hashedPassword, 
          },
        });

        await sendMessage(
          chatId,
          `✅ Registrasi berhasil!\n\n` +
            `Nama : <b>${Newuser.name}</b>\n` +
            `Email : <b>${Newuser.email}</b>\n` +
            `Telegram ID : ${chatId}`,
        );
      } catch (error) {
        console.error(error);
        await sendMessage(
          chatId,
          "❌ Gagal mendaftar. Email atau akun Telegram ini mungkin sudah terdaftar.",
        );
      }
    } else {
      await sendMessage(
        chatId,
        "Maaf, perintah tidak dikenal.\nGunakan /start",
      );
    }
  }
}