import LogoutButton from './LogoutButton';
import ProfileDropdownMobile from './ProfileDropdownMobile';
import Link from 'next/link';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#101217] md:bg-[#0f172a] text-slate-200 md:pb-0 pb-20 relative font-sans">
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#0f172a] border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left section: Logo and Nav links */}
            <div className="flex items-center space-x-10">
              <Link href="/dashboard" className="text-xl font-bold text-white tracking-wide">
                My Finacialku
              </Link>
              
              <div className="hidden sm:flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2">
                  Home
                </Link>
                <Link href="/dashboard/transactions" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2">
                  History
                </Link>
                <Link href="/dashboard/budgets" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2">
                  Budgets // Goals
                </Link>
              </div>
            </div>

            {/* Right section: Icons & Profile */}
            <div className="flex items-center space-x-4">
              <button className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-600 bg-slate-800">
                <div className="h-full w-full flex items-center justify-center text-xs text-white bg-[#34d399]/20">ME</div>
              </div>
              <LogoutButton />
            </div>
            
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <nav className="md:hidden bg-[#101217] pt-6 pb-2 px-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-white tracking-wide">
                My Finacialku
            </span>
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-white transition-colors relative">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-1 block h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-[#101217]"></span>
            </button>
            {/* Avatar with Dropdown */}
            <ProfileDropdownMobile />

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:max-w-7xl md:mx-auto max-w-md mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#101217] border-t border-slate-800 pb-safe">
        <div className="flex justify-between items-center max-w-md mx-auto px-6 py-2">
          <Link href="/dashboard" className="flex flex-col items-center text-[#10b981]">
            <div className="bg-[#10b981]/15 p-1.5 rounded-xl mb-1">
              <svg className="w-5 h-5 text-[#34d399]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-[#34d399]">Home</span>
          </Link>
          <Link href="/dashboard/transactions" className="flex flex-col items-center text-slate-500 hover:text-slate-300 transition-colors">
            <div className="p-1.5 mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <Link href="/dashboard/budgets" className="flex flex-col items-center text-slate-500 hover:text-slate-300 transition-colors">
            <div className="p-1.5 mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">Budgets</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
