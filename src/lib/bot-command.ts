import { prisma } from "./prisma";
import { telegram } from "./telegram";
import { TelegramUpdate } from "../types/telegram";
import { handleKeuanganCommand } from "./command/keuangan";
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
        `👋 <b>Halo, ${user.name}!</b>\n\n` +
          `Senang melihatmu kembali. Gunakan bot ini untuk memantau keuanganmu agar tidak bocor alus! 💸\n\n` +
          `<b>📌 Cara Pakai: ketik  <code>/help</code></b>\n\n` +
        { parse_mode: "HTML" },
      );
      return;
    }

    await telegram.sendMessage(
      chatId,
      "👋 <b>Halo! Selamat datang di FinancialKu.</b>\n\n" +
        "Bot ini akan membantumu mencatat keuangan harian dengan cepat via Telegram.\n\n" +
        "<b>⚠️ Anda belum terdaftar.</b>\n" +
        "Untuk mulai menggunakan fitur bot, silakan daftar dulu ya:\n" +
        "Format: <code>/daftar Nama, Email, Password</code>\n\n" +
        "<i>Contoh: /daftar Budi, budi@mail.com, rahasia123</i>",
      { parse_mode: "HTML" },
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
    const commands = [
      "/saldo",
      "/tambah",
      "/pemasukan",
      "/pengeluaran",
      "/keluar",
      "/riwayat",
    ];
    const isFinancialCommand = commands.some((cmd) => text.startsWith(cmd));

    if (isFinancialCommand) {
      await handleKeuanganCommand(chatId, text);
      return;
    }

    // 2. Tangani perintah non-keuangan (seperti help)
    if (text === "/help") {
      await telegram.sendMessage(
        chatId,
     `👋 <b>Halo, ${user.name}!</b>\n\n` +
            `Berikut adalah daftar fitur yang bisa kamu gunakan:\n\n` +
            `<b>📌 Fitur & Cara Pakai:</b>\n` +
            `➕ <b>Catat Masuk:</b> <code>/pemasukan [nominal] [ket]</code>\n` +
            `➖ <b>Catat Keluar:</b> <code>/keluar [nominal] [ket]</code>\n` +
            `📊 <b>Cek Saldo:</b> <code>/saldo</code>\n` +
            `📜 <b>Cek Riwayat pengeluaran</b> <code>/riwayat</code>\n` +
            `📈 <b>Status Boros:</b> <code>/limit</code> (Segera)\n` +
            `❓ <b>Bantuan:</b> <code>/help</code>\n\n` +
            `<i>Contoh: /keluar 50000 Makan Siang</i>` +
          `❓ <b>/help</b> - Menampilkan pesan bantuan ini`,
        { parse_mode: "HTML" },
      );
      return;
    }

    // 3. Jika tidak ada yang cocok
    await telegram.sendMessage(
      chatId,
      "❓ Perintah tidak dikenal. Ketik `/help` untuk melihat daftar perintah.",
    );
    return;
  }
  await telegram.sendMessage(
    chatId,
    "Silakan daftar terlebih dahulu via /start",
  );
}
