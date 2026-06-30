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
      const isDev = process.env.NODE_ENV === "development";
      const envTag = isDev ? "🛠️ [MODE DEV]" : "🚀";

      await telegram.sendMessage(
        chatId,
        `👋 <b>Halo, ${user.name}!</b> ${envTag}\n\n` +
          `Senang melihatmu kembali. Gunakan bot ini untuk memantau keuanganmu agar tidak bocor alus! 💸\n\n` +
          `<b>📌 Cara Pakai: ketik  <code>/help</code></b>\n\n`,
        { parse_mode: "HTML" }
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
        "<i>Contoh: /daftar Budi, budi@gmail.com, rahasia123</i>",
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
          kategori: {
            create: [
              { nama: 'Makanan & Minuman', jenis: 'pengeluaran', ikon: '🍔', warna: '#FF6B6B' },
              { nama: 'Transportasi', jenis: 'pengeluaran', ikon: '🚗', warna: '#4ECDC4' },
              { nama: 'Belanja', jenis: 'pengeluaran', ikon: '🛒', warna: '#96CEB4' },
              { nama: 'Tagihan & Utilitas', jenis: 'pengeluaran', ikon: '📄', warna: '#FFEEAD' },
              { nama: 'Gaji', jenis: 'pemasukan', ikon: '💰', warna: '#45B7D1' },
              { nama: 'Bonus', jenis: 'pemasukan', ikon: '🎁', warna: '#D4A5A5' },
            ]
          }
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
      "/report",
      "/limit",
      "/anggaran",
      "/reset",
      "/dashboard",
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
            `📜 <b>Cek Riwayat:</b> <code>/riwayat</code>\n` +
            `🎯 <b>Set Anggaran:</b> <code>/anggaran [nominal]</code>\n` +
            `📊 <b>Cek Limit Anggaran:</b> <code>/limit</code>\n` +
            `❓ <b>Bantuan:</b> <code>/help</code>\n\n` +
            `👤 <b>Info User (Email):</b> <code>/user</code>\n` +
            `💻 <b>Dashboard:</b> <code>/dashboard</code>\n` +
            `<b> Report:</b><code>/report</code>\n` +
            `🔑 <b>Reset Password:</b> <code>/resetpassword [PasswordBaru]</code>\n` +
            `🗑️ <b>Reset Data Transaksi:</b> <code>/reset</code>\n\n` +
            `<i>Contoh: /keluar 50000 Makan Siang</i>\n` +
          `❓ <b>/help</b> - Menampilkan pesan bantuan ini`,
        { parse_mode: "HTML" },
      );
      return;
    }

    if (text === "/user") {
      await telegram.sendMessage(
        chatId,
        `👤 <b>Informasi Akun Anda</b>\n\n` +
        `<b>Nama:</b> ${user.name}\n` +
        `<b>Email:</b> ${user.email}\n\n` +
        `<i>*Password Anda dienkripsi demi keamanan sehingga tidak bisa dimunculkan. Jika Anda lupa password, gunakan perintah: \n\n<code>/resetpassword [PasswordBaru]</code></i>`,
        { parse_mode: "HTML" }
      );
      return;
    }

    if (text.startsWith("/resetpassword ")) {
      const newPassword = text.replace("/resetpassword", "").trim();
      if (!newPassword || newPassword.length < 5) {
         await telegram.sendMessage(chatId, "❌ Password baru minimal harus 5 karakter.\n\nContoh: <code>/resetpassword rahasia123</code>", { parse_mode: "HTML" });
         return;
      }
      
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword }
      });

      await telegram.sendMessage(
        chatId,
        `✅ <b>Berhasil!</b> Password Anda telah berhasil direset. Silakan gunakan password baru ini untuk login ke dashboard.` +
        `\n\nEmail Anda: <b>${user.email}</b>`,
        { parse_mode: "HTML" }
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
