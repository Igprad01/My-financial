import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import TransactionClient from './TransactionClient';

const SECRET_KEY = process.env.JWT_SECRET || "rahasia-keuangan-app-super-aman-2024";
const key = new TextEncoder().encode(SECRET_KEY);

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let userId: number | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      userId = payload.userId as number;
    } catch {
      console.error("Invalid token on transactions page");
    }
  }

  if (!userId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#0f172a]">
        <p className="text-slate-400">Akses ditolak, silakan login kembali.</p>
      </div>
    );
  }

  const transactions = await prisma.transaksi.findMany({
    where: { penggunaId: userId },
    include: { kategori: true },
    orderBy: { tanggal: 'desc' },
  });

  // Serialize the data so it can be passed safely to a Client Component
  const serializedTransactions = transactions.map(trx => ({
    id: trx.id,
    jenis: trx.jenis,
    jumlah: Number(trx.jumlah),
    keterangan: trx.keterangan,
    tanggal: trx.tanggal,
    kategori: trx.kategori ? {
      nama: trx.kategori.nama,
      ikon: trx.kategori.ikon,
      warna: trx.kategori.warna
    } : null
  }));

  return (
    <TransactionClient transactions={serializedTransactions} />
  );
}
