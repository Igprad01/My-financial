import { telegram } from "../telegram";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const parseNominal = (input: string): number => {
  if (!input) return NaN;

  let formatted = input.toLowerCase().trim();
  let multiplier = 1;

  const suffixes = [
    { regex: /(k|rb|ribu)$/, value: 1000 },
    { regex: /(jt|juta)$/, value: 1000000 },
    { regex: /m$/, value: 1000000000 },
  ];

  for (const suffix of suffixes) {
    if (suffix.regex.test(formatted)) {
      multiplier = suffix.value;
      formatted = formatted.replace(suffix.regex, "");
      break;
    }
  }

  formatted = formatted.replace(/[^0-9.,]/g, "");

  const hasComma = formatted.includes(",");

  if (hasComma) {
    formatted = formatted.replace(/\./g, "");
    formatted = formatted.replace(",", ".");
  }

  if (!hasComma) {
    const periodCount = (formatted.match(/\./g) || []).length;

    if (periodCount > 1) {
      formatted = formatted.replace(/\./g, "");
    }

    if (periodCount === 1) {
      const parts = formatted.split(".");
      if (parts[1].length === 3 && multiplier === 1) {
        formatted = formatted.replace(/\./g, "");
      }
    }
  }

  const result = parseFloat(formatted);
  if (isNaN(result)) return NaN;

  return Math.round(result * multiplier);
};

export async function handleKeuanganCommand(chatId: number, text: string) {
  const args = text.split(" ");
  const command = args[0].toLowerCase();

  const user = await prisma.user.findUnique({
    where: { telegramChatId: chatId.toString() },
  });

  if (!user) {
    return await telegram.sendMessage(
      chatId,
      "⚠️ Kamu belum terdaftar di sistem FinancialKu.\nSilakan daftar melalui dashboard web terlebih dahulu.",
    );
  }

  switch (command) {
    case "/tambah":
    case "/keluar": {
      let nominalString = args[1] || "";
      let keteranganArgsStart = 2;
      const secondArg = args[2]?.toLowerCase();

      if (
        secondArg &&
        ["k", "rb", "ribu", "jt", "juta", "m"].includes(secondArg)
      ) {
        nominalString += secondArg;
        keteranganArgsStart = 3;
      }

      const nominal = parseNominal(nominalString);
      const keterangan = args.slice(keteranganArgsStart).join(" ");

      if (isNaN(nominal) || !keterangan) {
        return await telegram.sendMessage(
          chatId,
          "⚠️ Format salah! Gunakan: `/keluar [nominal] [keterangan]`\nContoh: `/keluar 50000 Makan siang`",
        );
      }
      const transaksi = await prisma.transaksi.create({
        data: {
          penggunaId: user.id,
          jenis: "pengeluaran",
          jumlah: nominal,
          keterangan: keterangan,
        },
      });

      // Check limit anggaran bulanan
      const dateNow = new Date();
      const firstDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);

      const allExt = await prisma.transaksi.aggregate({
        where: {
          penggunaId: user.id,
          jenis: "pengeluaran",
          tanggal: { gte: firstDay },
        },
        _sum: { jumlah: true },
      });
      const totalPengeluaranBulanIni = Number(allExt._sum.jumlah || 0);

      const cekAnggaran = await prisma.anggaran.findFirst({
        where: { penggunaId: user.id },
      });

      let warningMsg = "";
      if (cekAnggaran) {
        const batas = Number(cekAnggaran.jumlah);
        if (totalPengeluaranBulanIni > batas) {
          warningMsg = `\n\n⚠️ *Peringatan:* Pengeluaran bulan ini (${formatRupiah(totalPengeluaranBulanIni)}) telah melebihi batas anggaran (${formatRupiah(batas)}).`;
        } else if (totalPengeluaranBulanIni > batas * 0.8) {
          warningMsg = `\n\n⚠️ *Hati-hati:* Pengeluaran bulan ini (${formatRupiah(totalPengeluaranBulanIni)}) sudah mendekati batas anggaran (${formatRupiah(batas)}).`;
        }
      }

      const pesan = `💸 *Pengeluaran Dicatat*\n\n💰 Nominal: ${formatRupiah(Number(transaksi.jumlah))}\n📝 Ket: ${keterangan}\n📅 Tanggal: ${transaksi.tanggal.toLocaleDateString("id-ID")}${warningMsg}`;
      await telegram.sendMessage(chatId, pesan, { parse_mode: "Markdown" });
      break;
    }

    case "/pemasukan": {
      let nominalString = args[1] || "";
      let keteranganArgsStart = 2;
      const secondArg = args[2]?.toLowerCase();

      if (
        secondArg &&
        ["k", "rb", "ribu", "jt", "juta", "m"].includes(secondArg)
      ) {
        nominalString += secondArg;
        keteranganArgsStart = 3;
      }

      const nominal = parseNominal(nominalString);
      const keterangan = args.slice(keteranganArgsStart).join(" ");

      if (isNaN(nominal) || !keterangan) {
        return await telegram.sendMessage(
          chatId,
          "⚠️ Format salah! Gunakan: `/pemasukan [nominal] [keterangan]`",
        );
      }

      const transaksi = await prisma.transaksi.create({
        data: {
          penggunaId: user.id,
          jenis: "pemasukan",
          jumlah: nominal,
          keterangan: keterangan,
        },
      });

      const pesan = `✅ *Pemasukan Dicatat*\n\n💰 Nominal: ${formatRupiah(Number(transaksi.jumlah))}\n📝 Ket: ${keterangan}`;
      await telegram.sendMessage(chatId, pesan, { parse_mode: "Markdown" });
      break;
    }

    case "/saldo": {
      const allTransactions = await prisma.transaksi.findMany({
        where: { penggunaId: user.id },
      });

      const totalPemasukan = allTransactions
        .filter((t) => t.jenis === "pemasukan")
        .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

      const totalPengeluaran = allTransactions
        .filter((t) => t.jenis === "pengeluaran")
        .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

      const saldoAkhir = totalPemasukan - totalPengeluaran;

      const pesan =
        `📊 *Laporan Keuangan Real-time*\n\n` +
        `➕ Total Pemasukan: ${formatRupiah(totalPemasukan)}\n` +
        `➖ Total Pengeluaran: ${formatRupiah(totalPengeluaran)}\n` +
        `--- \n` +
        `💰 *Sisa Saldo: ${formatRupiah(saldoAkhir)}*`;

      await telegram.sendMessage(chatId, pesan, { parse_mode: "Markdown" });
      break;
    }
    case "/riwayat": {
      const listTransaksi = await prisma.transaksi.findMany({
        where: { penggunaId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { kategori: true },
      });

      if (listTransaksi.length === 0) {
        return await telegram.sendMessage(
          chatId,
          "Belum ada riwayat transaksi.",
        );
      }
      let pesanRiwayat = "📜 <b>5 Transaksi Terakhir:</b>\n\n";

      listTransaksi.forEach((trx, index) => {
        const simbol = trx.jenis === "pemasukan" ? "✅" : "💸";
        const tanggal = trx.tanggal.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
        const kategori = trx.kategori ? `[${trx.kategori.nama}]` : "";

        pesanRiwayat += `${index + 1}. ${simbol} <b>${formatRupiah(Number(trx.jumlah))}</b>\n`;
        pesanRiwayat += `   📅 ${tanggal} | ${trx.keterangan} ${kategori}\n\n`;
      });

      await telegram.sendMessage(chatId, pesanRiwayat, { parse_mode: "HTML" });
      break;
    }

    case "/report": {
      // Gunakan fallback URL jika env tidak terbaca
      const dashboardUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://my-financial-woad.vercel.app";

      const pesan = `🔗 *Laporan Keuangan FinancialKu*

Silakan klik tombol di bawah ini untuk masuk ke dashboard dan melihat laporan keuangan Anda.`;

      await telegram.sendMessage(chatId, pesan, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Buka FinancialKu",
                url: `${dashboardUrl}/login`,
              },
            ],
          ],
        },
      });
      break;
    }

    case "/reset": {
      await telegram.sendChatAction(chatId, "upload_document");

      const allTransactions = await prisma.transaksi.findMany({
        where: { penggunaId: user.id },
        include: { kategori: true },
        orderBy: { tanggal: "asc" },
      });

      if (allTransactions.length === 0) {
        await telegram.sendMessage(chatId, "⚠️ Tidak ada data transaksi yang bisa di-reset.");
        break;
      }

      let csvContent = "Tanggal,Jenis,Kategori,Jumlah,Keterangan\n";
      allTransactions.forEach(trx => {
        const tanggal = trx.tanggal.toISOString().split("T")[0];
        const jenis = trx.jenis;
        const kategori = trx.kategori ? `"${trx.kategori.nama.replace(/"/g, '""')}"` : "";
        const jumlah = trx.jumlah.toString();
        const keterangan = trx.keterangan ? `"${trx.keterangan.replace(/"/g, '""')}"` : "";
        csvContent += `${tanggal},${jenis},${kategori},${jumlah},${keterangan}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const filename = `backup_transaksi_${new Date().toISOString().split("T")[0]}.csv`;
      
      const sendResult = await telegram.sendDocument(
        chatId,
        blob,
        filename,
        "📁 *Backup Data Transaksi*\n\n✅ Ini adalah rekap seluruh datamu sebelum direset."
      );

      if (sendResult) {
        await prisma.transaksi.deleteMany({ where: { penggunaId: user.id } });
        await telegram.sendMessage(chatId, "🗑️ *Data Berhasil Direset*\n\nSeluruh data transaksi kamu telah dihapus, dan rekap barusan sudah dikirim.", { parse_mode: "Markdown" });
      } else {
        await telegram.sendMessage(chatId, "❌ *Gagal Mereset Data*\n\nTerjadi kesalahan saat membuat backup, sehingga data tidak jadi dihapus.", { parse_mode: "Markdown" });
      }
      break;
    }

    default:
      await telegram.sendMessage(
        chatId,
        "❓ Perintah tidak dikenal.\n\nGunakan:\n/keluar [nominal] [ket]\n/pemasukan [nominal] [ket]\n/saldo",
      );
  }
}
