import LogoutButton from './LogoutButton';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navigation */}
      <nav className="bg-[#0f172a] border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left section: Logo and Nav links */}
            <div className="flex items-center space-x-10">
              <Link href="/dashboard" className="text-xl font-bold text-white tracking-wide">
                Financial Clarity
              </Link>
              
              <div className="hidden sm:flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2">
                  Home
                </Link>
                <Link href="/dashboard/transactions" className="text-sm font-bold text-white border-b-2 border-[#34d399] py-2">
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

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
