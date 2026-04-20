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

    default:
      await telegram.sendMessage(
        chatId,
        "❓ Perintah tidak dikenal.\n\nGunakan:\n/keluar [nominal] [ket]\n/pemasukan [nominal] [ket]\n/saldo",
      );
  }
}
