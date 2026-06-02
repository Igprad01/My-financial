import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET || "rahasia-keuangan-app-super-aman-2024";
const key = new TextEncoder().encode(SECRET_KEY);

export default async function BudgetsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let userId: number | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      userId = payload.userId as number;
    } catch {
      console.error("Invalid token on budgets page");
    }
  }

  if (!userId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-500">Akses ditolak, silakan login kembali.</p>
      </div>
    );
  }

  // 1. Ambil data anggaran (budgets)
  const budgets = await prisma.anggaran.findMany({
    where: { penggunaId: userId },
    include: { kategori: true },
  });

  // 2. Ambil total pengeluaran bulan ini per kategori untuk dibandingkan
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const expensesThisMonth = await prisma.transaksi.findMany({
    where: {
      penggunaId: userId,
      jenis: 'pengeluaran',
      tanggal: { gte: firstDayOfMonth }
    }
  });

  // Calculate used budget per category
  const usedAmountPerCategory: Record<string, number> = {};
  expensesThisMonth.forEach(exp => {
    if (exp.kategoriId) {
      if (!usedAmountPerCategory[exp.kategoriId]) {
        usedAmountPerCategory[exp.kategoriId] = 0;
      }
      usedAmountPerCategory[exp.kategoriId] += Number(exp.jumlah);
    }
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen Anggaran</h1>
          <p className="text-gray-500 font-medium">Batas maksimal pengeluaran bulanan Anda</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const limit = Number(budget.jumlah);
            const used = usedAmountPerCategory[budget.kategoriId || ''] || 0;
            const remaining = limit - used;
            const percentUsed = Math.min(100, Math.round((used / limit) * 100));
            
            // Tentukan warna progress bar
            let progressColor = 'bg-green-500';
            if (percentUsed > 75) progressColor = 'bg-yellow-400';
            if (percentUsed > 90) progressColor = 'bg-red-500';

            return (
              <div key={budget.id} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700" style={{ color: budget.kategori?.warna || '#9ca3af' }}>
                      <span className="font-medium text-lg">{budget.kategori?.ikon || '🏷️'}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {budget.kategori?.nama || 'Uncategorized'}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    {budget.periode}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm mb-1 mt-auto">
                  <span className="text-gray-500 dark:text-gray-400">Terpakai: {formatRupiah(used)}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatRupiah(limit)}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${percentUsed}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs font-medium">
                  <span className={`${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {remaining < 0 ? 'Over budget: ' + formatRupiah(Math.abs(remaining)) : 'Sisa: ' + formatRupiah(remaining)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{percentUsed}%</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">🎯</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Belum Ada Anggaran</h3>
            <p className="text-gray-500">Anda belum menetapkan batas pengeluaran untuk kategori apapun.</p>
          </div>
        )}
      </div>
    </div>
  );
}
