'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, ArrowRightLeft, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Books', href: '/books', icon: BookOpen },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Borrowings', href: '/borrowings', icon: ArrowRightLeft },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col border-r border-slate-800">
      <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
        <BookOpen className="h-8 w-8 text-indigo-400" />
        <span className="font-bold text-lg tracking-wide text-indigo-100">
          Library MS
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 text-center">
        Library Management System v1.0
      </div>
    </aside>
  );
}