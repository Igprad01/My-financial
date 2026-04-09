import { prisma } from "./prisma";
import { telegram } from "./telegram";
import { TelegramUpdate } from "../types/telegram";
import { user } from "@prisma/client";
import bcrypt from "bcrypt";

export async function handleUpdate(update: TelegramUpdate): Promise<void> {
  const msg = update.message;

  if (!msg || !msg.text) return;

  const chatId: number = msg.chat.id;
  const text: string = msg.text.trim();

  const user: user | null = await prisma.user.findUnique({
    where: { telegramChatId: chatId.toString() },
  });

  if (text === "/start") {
    if (user) {
      await telegram.sendMessage(
        chatId,
        `Selamat datang kembali, <b>${user.name}</b>!\n` +
          `Email: <b>${user.email}</b>`,
      );
      return;
    }

    await telegram.sendMessage(
      chatId,
      "👋 Halo! Anda belum terdaftar.\n" +
        "Gunakan format: <code>/daftar Nama, Email, Password</code>",
    );
    return;
  }

  if (text.startsWith("/daftar")) {
    if (user) {
      await telegram.sendMessage(chatId, "⚠️ Anda sudah terdaftar.");
      return;
    }

    const inputParts: string[] = text
      .replace("/daftar", "")
      .split(",")
      .map((i) => i.trim());
    const [nama, email, password] = inputParts;

    if (inputParts.length < 3 || !nama || !email || !password) {
      await telegram.sendMessage(
        chatId,
        "❌ Format salah! Gunakan koma sebagai pemisah.",
      );
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name: nama,
          email: email,
          password: hashedPassword,
          telegramChatId: chatId.toString(),
        },
      });

      await telegram.sendMessage(
        chatId,
        `✅ Berhasil mendaftar sebagai <b>${newUser.name}</b>.`,
      );
    } catch {
      await telegram.sendMessage(chatId, "❌ Gagal! Email sudah terdaftar.");
    }
    return;
  }

  if (user) {
    if (text === "/saldo") {
      await telegram.sendMessage(chatId, "💰 Saldo Anda: Rp 0");
      return;
    } else if (text === "/help") {
        await telegram.sendMessage(
            chatId,
            "📌 Perintah yang tersedia:\n" 
        )
    }
    await telegram.sendMessage(
      chatId,
      "❓ Perintah tidak dikenal. Coba /start atau /saldo.",
    );
    return;
  }
  await telegram.sendMessage(
    chatId,
    "Silakan daftar terlebih dahulu via /start",
  );
}
