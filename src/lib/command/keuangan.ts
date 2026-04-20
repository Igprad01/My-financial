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
      const nominal = parseInt(args[1]);
      const keterangan = args.slice(2).join(" ");

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

      const pesan = `💸 *Pengeluaran Dicatat*\n\n💰 Nominal: ${formatRupiah(Number(transaksi.jumlah))}\n📝 Ket: ${keterangan}\n📅 Tanggal: ${transaksi.tanggal.toLocaleDateString("id-ID")}`;
      await telegram.sendMessage(chatId, pesan, { parse_mode: "Markdown" });
      break;
    }

    case "/pemasukan": {
      const nominal = parseInt(args[1]);
      const keterangan = args.slice(2).join(" ");

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

    // case "/limit": {
     
    //   const now = new Date();
    //   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    //   const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    //   // 2. Ambil total pengeluaran bulan ini dari DB
    //   const pengeluaranBulanIni = await prisma.transaksi.aggregate({
    //     where: {
    //       penggunaId: user.id,
    //       jenis: "pengeluaran",
    //       tanggal: {
    //         gte: startOfMonth,
    //         lte: endOfMonth,
    //       },
    //     },
    //     _sum: { jumlah: true },
    //   });

    //   // 3. Ambil total anggaran (budget) user
    //   const dataAnggaran = await prisma.anggaran.aggregate({
    //     where: { penggunaId: user.id },
    //     _sum: { jumlah: true },
    //   });

    //   const totalPakai = Number(pengeluaranBulanIni._sum.jumlah || 0);
    //   const totalBudget = Number(dataAnggaran._sum.jumlah || 0);

    //   if (totalBudget === 0) {
    //     return await telegram.sendMessage(
    //       chatId,
    //       "⚠️ <b>Anda belum mengatur anggaran.</b>\nAtur anggaran di dashboard web untuk memantau batas pengeluaran.",
    //       { parse_mode: "HTML" },
    //     );
    //   }

    //   // 4. Hitung persentase keborosan
    //   const persentase = (totalPakai / totalBudget) * 100;
    //   let status = "";

    //   if (persentase >= 100)
    //     status = "🚨 <b>OVERBUDGET!</b> Kamu sudah melewati batas.";
    //   else if (persentase >= 80)
    //     status = "⚠️ <b>WASPADA!</b> Pengeluaran hampir menyentuh limit.";
    //   else status = "✅ <b>AMAN.</b> Pengeluaranmu masih terkendali.";

    //   const pesan =
    //     `📈 <b>Status Anggaran Bulan Ini</b>\n\n` +
    //     `💰 Budget: <b>${formatRupiah(totalBudget)}</b>\n` +
    //     `💸 Terpakai: <b>${formatRupiah(totalPakai)}</b>\n` +
    //     `📊 Persentase: <b>${persentase.toFixed(1)}%</b>\n\n` +
    //     `${status}`;

    //   await telegram.sendMessage(chatId, pesan, { parse_mode: "HTML" });
    //   break;
    // }

    default:
      await telegram.sendMessage(
        chatId,
        "❓ Perintah tidak dikenal.\n\nGunakan:\n/keluar [nominal] [ket]\n/pemasukan [nominal] [ket]\n/saldo",
      );
  }
}
