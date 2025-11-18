'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="w-full bg-[#1a1a1a] shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-2xl font-bold text-[#66ff00] hover:text-[#52cc00] transition-colors">
             <span className="text-white">Run </span> Tribe
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link 
              href="/dashboard" 
              className={`font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/groups" 
              className={`font-medium transition-colors ${
                isActive('/groups') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Groups
            </Link>
            <Link 
              href="/myruns" 
              className={`font-medium transition-colors ${
                isActive('/myruns') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Runs
            </Link>
            <Link 
              href="/shoes" 
              className={`font-medium transition-colors ${
                isActive('/shoes') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Shoes
            </Link>
            <Link 
              href="/profile" 
              className={`font-medium transition-colors ${
                isActive('/profile') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Profile
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
