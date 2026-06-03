import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const SECRET_KEY = process.env.JWT_SECRET || "rahasia-keuangan-app-super-aman-2024";
const key = new TextEncoder().encode(SECRET_KEY);

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let userId: number | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      userId = payload.userId as number;
    } catch (error) {
      console.error("Invalid token on dashboard");
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Akses ditolak, silakan login kembali.</p>
      </div>
    );
  }

  // 1. Ambil data user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true }
  });

  // 2. Ambil data transaksi (terbaru)
  const transactions = await prisma.transaksi.findMany({
    where: { penggunaId: userId },
    include: { kategori: true },
    orderBy: { tanggal: 'desc' },
  });


  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.jenis === 'pemasukan') {
      totalIncome += Number(t.jumlah);
    } else if (t.jenis === 'pengeluaran') {
      totalExpense += Number(t.jumlah);
    }
  });

  const totalBalance = totalIncome - totalExpense;

  // Render recent 5 transactions for the table
  const recentTransactions = transactions.slice(0, 5);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
      
    const isYesterday = 
      date.getDate() === today.getDate() - 1 &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateMobile = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const formatTimeMobile = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 md:bg-transparent min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:block max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Overview</h1>
          <p className="text-gray-500 mb-6 font-medium">Halo, {user?.name || "Pengguna"}!</p>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Balance</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatRupiah(totalBalance)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Income</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatRupiah(totalIncome)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-md p-3">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Expenses</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatRupiah(totalExpense)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                    {recentTransactions.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Transaction
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {recentTransactions.map((trx) => (
                            <tr key={trx.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800" style={{ color: trx.kategori?.warna || '#9ca3af' }}>
                                    <span className="font-medium text-lg">{trx.kategori?.ikon || '🛒'}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">{trx.kategori?.nama || 'Uncategorized'}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{trx.keterangan || '-'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${trx.jenis === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {trx.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(Number(trx.jumlah))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{formatDate(trx.tanggal)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(trx.tanggal)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Completed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        Belum ada transaksi yang dicatat.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden px-6 py-2 bg-[#101217] min-h-screen font-sans text-slate-200 pb-24">
        {/* Welcome Section */}
        <div className="mb-6 pt-4">
          <p className="text-slate-400 text-[11px] font-medium mb-1">Welcome back,</p>
          <h1 className="text-xl font-bold text-white tracking-wide">Halo, {user?.name?.toLowerCase() || "putra"}!</h1>
        </div>

        {/* Balance Cards */}
        <div className="space-y-4 mb-8">
          <div className="bg-[#181a20] rounded-xl p-5 border border-[#2b2d35]/60 flex flex-col justify-center min-h-[110px]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-[#1e2333] p-1.5 rounded-md text-[#60a5fa]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-[10px] font-bold text-slate-300 tracking-wider">Total Balance</h2>
            </div>
            <p className="text-3xl font-bold font-mono tracking-tight text-[#60a5fa] mt-1">
              Rp {totalBalance.toLocaleString('id-ID').replace(/,/g, '.')}
            </p>
          </div>

          <div className="bg-[#181a20] rounded-xl p-5 border border-[#2b2d35]/60 flex flex-col justify-center min-h-[110px]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-[#15241e] p-1.5 rounded-md text-[#34d399]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h2 className="text-[10px] font-bold text-slate-300 tracking-wider">Income</h2>
            </div>
            <p className="text-3xl font-bold font-mono tracking-tight text-[#34d399] mt-1">
              Rp {totalIncome.toLocaleString('id-ID').replace(/,/g, '.')}
            </p>
          </div>

          <div className="bg-[#181a20] rounded-xl p-5 border border-[#2b2d35]/60 flex flex-col justify-center min-h-[110px]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-[#2a171c] p-1.5 rounded-md text-[#f87171]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h2 className="text-[10px] font-bold text-slate-300 tracking-wider">Expenses</h2>
            </div>
            <p className="text-3xl font-bold font-mono tracking-tight text-[#f87171] mt-1">
              Rp {totalExpense.toLocaleString('id-ID').replace(/,/g, '.')}
            </p>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[15px] font-bold text-slate-200">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-[10px] font-bold text-[#60a5fa] hover:text-blue-300 tracking-wider uppercase">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((trx) => {
                const isIncome = trx.jenis === 'pemasukan';
                const sign = isIncome ? '+' : '-';
                const amountColor = isIncome ? 'text-[#34d399]' : 'text-[#f87171]';
                const dotColor = isIncome ? 'bg-[#34d399]' : 'bg-[#f87171]';
                
                return (
                  <div key={trx.id} className="flex items-center justify-between bg-[#181a20] rounded-[14px] p-4 border border-[#2b2d35]/40 transition-all hover:bg-[#1f222a]">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#242730] p-3 rounded-[12px] text-slate-400">
                        <span className="text-lg leading-none flex items-center justify-center w-5 h-5">{trx.kategori?.ikon || '🛒'}</span>
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-slate-200 capitalize">{trx.kategori?.nama || 'Uncategorized'}</h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{trx.keterangan || 'Transaksi'}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[13px] font-bold font-mono tracking-tight ${amountColor}`}>
                        {sign} Rp {Number(trx.jumlah).toLocaleString('id-ID').replace(/,/g, '.')}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                        {formatDateMobile(trx.tanggal)} - {formatTimeMobile(trx.tanggal)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
               <div className="text-center text-slate-500 py-6 text-sm bg-[#181a20] rounded-xl border border-[#2b2d35]/40">
                 Belum ada transaksi.
               </div>
            )}
          </div>
        </div>
        
        {/* Spending Trends Section (Placeholder) */}
        <div className="mb-4">
          <h2 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Spending Trends</h2>
          <div className="bg-[#181a20] rounded-xl p-4 border border-[#2b2d35]/60 relative overflow-hidden h-36 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-200">Steady Control</h3>
            <div className="flex items-end justify-between space-x-1.5 h-[65%] mt-4">
               <div className="w-full bg-[#475569]/30 rounded-t-sm h-[30%]"></div>
               <div className="w-full bg-[#475569]/30 rounded-t-sm h-[40%]"></div>
               <div className="w-full bg-[#475569]/30 rounded-t-sm h-[35%]"></div>
               <div className="w-full bg-[#475569]/50 rounded-t-sm h-[60%]"></div>
               <div className="w-full bg-[#475569]/30 rounded-t-sm h-[45%]"></div>
               <div className="w-full bg-[#60a5fa]/70 rounded-t-sm h-[80%]"></div>
               <div className="w-full bg-[#475569]/30 rounded-t-sm h-[75%]"></div>
            </div>
          </div>
        </div>

        {/* Explore Analytics Block */}
        <div className="mb-8">
          <Link href="/dashboard/analytics" className="block w-full">
             <div className="bg-gradient-to-r from-[#181a20] to-[#122330] rounded-xl p-4 border border-[#1d2f40] relative overflow-hidden h-[100px] flex items-center justify-center flex-col group">
               <div className="absolute inset-0 opacity-10 flex text-[#60a5fa] items-center justify-center" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               
               <svg className="w-6 h-6 text-[#60a5fa] mb-2 z-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
               </svg>
               <span className="text-[11px] font-mono font-bold tracking-widest text-[#60a5fa] z-10 uppercase">Explore Analytics</span>
             </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
