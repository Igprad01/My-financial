'use client';

import { useState } from 'react';

type Transaction = {
  id: string;
  jenis: string;
  jumlah: string | number;
  keterangan: string | null;
  tanggal: Date;
  kategori: { nama: string; ikon: string | null; warna: string | null } | null;
};

export default function TransactionClient({ transactions }: { transactions: Transaction[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Dummy categories for UI filter based on image, real categories are passed down through transactions but you could aggregate them
  const categories = ['Belanja', 'Gaji', 'Investasi', 'Hiburan', 'Makan', 'Lainnya'];

  const filteredTransactions = transactions.filter(trx => {
    let matches = true;
    if (search) {
      const textMatch = trx.keterangan?.toLowerCase().includes(search.toLowerCase()) || 
                        trx.kategori?.nama.toLowerCase().includes(search.toLowerCase());
      if (!textMatch) matches = false;
    }
    if (typeFilter !== 'Semua' && trx.jenis.toLowerCase() !== typeFilter.toLowerCase()) {
      matches = false;
    }
    if (categoryFilter && trx.kategori?.nama.toLowerCase() !== categoryFilter.toLowerCase()) {
      matches = false;
    }
    return matches;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateFull = (date: Date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-[#0f172a] text-slate-300 min-h-screen">
      
      {/* Sidebar / Filter Section */}
      <div className="w-full lg:w-1/4 space-y-6">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Filter</h2>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#34d399] transition-colors"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tipe</h3>
            <div className="space-y-2">
              {['Semua', 'Pemasukan', 'Pengeluaran'].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="type"
                    checked={typeFilter === type}
                    onChange={() => setTypeFilter(type)}
                    className="form-radio h-4 w-4 text-[#34d399] bg-[#0f172a] border-slate-600 focus:ring-[#34d399] focus:ring-offset-[#1e293b]"
                  />
                  <span className={`ml-3 text-sm ${typeFilter === type ? 'text-white font-medium' : 'text-slate-400'}`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kategori</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${categoryFilter === cat ? 'bg-[#34d399]/20 border-[#34d399] text-[#34d399]' : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rentang Waktu</h3>
            <div className="space-y-3">
              <input type="date" className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#34d399]" />
              <div className="text-center text-xs text-slate-500">sampai</div>
              <input type="date" className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#34d399]" />
            </div>
          </div>

          <button className="w-full bg-[#34d399] hover:bg-[#10b981] text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors">
            Terapkan Filter
          </button>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-white font-bold mb-2">Unduh Laporan</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Export data transaksi dalam format PDF atau CSV.
          </p>
          <a href="#" className="text-sm font-medium text-[#34d399] hover:text-[#10b981] inline-flex items-center">
            Download 
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>

      {/* Main Content / Table */}
      <div className="w-full lg:w-3/4">
        <div className="bg-[#1e293b]/50 rounded-3xl p-6 lg:p-10 border border-slate-700/50 shadow-2xl h-full">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Riwayat Transaksi</h1>
              <p className="text-sm text-slate-400">Mengelola {transactions.length} transaksi bulan ini</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-slate-700 hover:border-slate-500 rounded-lg text-sm text-white transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Urutkan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th scope="col" className="pb-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/3">Transaksi</th>
                  <th scope="col" className="pb-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th scope="col" className="pb-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th scope="col" className="pb-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th scope="col" className="pb-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="group hover:bg-[#0f172a]/40 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center">
                        <div className="shrink-0 h-11 w-11 flex items-center justify-center rounded-full bg-[#0f172a] border border-slate-700/50 group-hover:border-slate-600 transition-colors" style={{ color: trx.kategori?.warna || '#9ca3af' }}>
                          <span className="font-medium text-lg">{trx.kategori?.ikon || '🛒'}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white mb-0.5 capitalize">{trx.keterangan || (trx.kategori?.nama) || 'Transaksi'}</div>
                          <div className="text-xs text-slate-500 font-mono">ID: #{trx.id.substring(0,8).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="inline-flex px-3 py-1 text-[11px] font-medium bg-[#0f172a] text-slate-300 rounded-full border border-slate-700">
                        {trx.kategori?.nama || 'Lainnya'}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="text-sm text-slate-300">{formatDateFull(trx.tanggal)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatTime(trx.tanggal)}</div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] mr-2"></span>
                        <span className="text-[#34d399] font-medium">Berhasil</span>
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <div className={`text-sm font-bold ${trx.jenis === 'pemasukan' ? 'text-[#34d399]' : 'text-red-400'}`}>
                        {trx.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(Number(trx.jumlah))}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                      Tidak ada transaksi ditemukan berdasarkan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-700/50">
            <span className="text-xs text-slate-500">Menampilkan 1-{filteredTransactions.length > 10 ? 10 : filteredTransactions.length} dari {transactions.length} transaksi</span>
            <div className="flex gap-1">
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#34d399] text-slate-900 font-bold transition-colors">1</button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white transition-colors">2</button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white transition-colors">3</button>
              <span className="h-8 w-8 flex items-center justify-center text-slate-500">...</span>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white transition-colors">13</button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
