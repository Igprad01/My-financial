import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

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
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-500">Akses ditolak, silakan login kembali.</p>
      </div>
    );
  }

  const transactions = await prisma.transaksi.findMany({
    where: { penggunaId: userId },
    include: { kategori: true },
    orderBy: { tanggal: 'desc' },
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Riwayat Transaksi</h1>
          <p className="text-gray-500 font-medium">Monitoring seluruh cashflow Anda</p>
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
              {transactions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kategori & Keterangan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nominal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800" style={{ color: trx.kategori?.warna || '#9ca3af' }}>
                              <span className="font-medium text-lg">{trx.kategori?.ikon || '🛒'}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {trx.kategori?.nama || 'Tanpa Kategori'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {trx.keterangan || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${trx.jenis === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trx.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(Number(trx.jumlah))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDateFull(trx.tanggal)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(trx.tanggal)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${trx.jenis === 'pemasukan' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {trx.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                  <span className="text-4xl mb-4">📭</span>
                  <p className="text-gray-500 font-medium">Belum ada transaksi sama sekali.</p>
                  <p className="text-sm text-gray-400 mt-1">Gunakan bot Telegram Anda untuk mulai mencatat keuangan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
