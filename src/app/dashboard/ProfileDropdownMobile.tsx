'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileDropdownMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-7 w-7 rounded-md overflow-hidden bg-[#242938] flex items-center justify-center text-[10px] font-bold text-[#60a5fa] border border-[#3e4455] focus:outline-none focus:ring-1 focus:ring-[#60a5fa] transition-colors"
      >
        ME
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-3 w-28 bg-[#181a20] border border-[#2b2d35]/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] z-50 overflow-hidden py-1">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-[#f87171] hover:bg-[#1e2333] transition-colors flex items-center space-x-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
