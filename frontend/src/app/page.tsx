'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Users, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    borrowedBooks: 0,
    availableBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [books, members, borrowings] = await Promise.all([
          api.getBooks(),
          api.getMembers(),
          api.getBorrowings(),
        ]);

        const activeBorrowings = borrowings.filter((b) => !b.returned_at).length;
        const totalCopies = books.reduce((sum, b) => sum + b.available_copies, 0);

        setStats({
          totalBooks: books.length,
          totalMembers: members.length,
          borrowedBooks: activeBorrowings,
          availableBooks: totalCopies,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Titles', value: stats.totalBooks, icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Total Members', value: stats.totalMembers, icon: Users, color: 'bg-emerald-500' },
    { name: 'Currently Borrowed', value: stats.borrowedBooks, icon: ArrowRightLeft, color: 'bg-amber-500' },
    { name: 'Available Copies', value: stats.availableBooks, icon: CheckCircle2, color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.name}</p>
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg text-white ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}