'use client';

import { useEffect, useState } from 'react';
import { BorrowingDetail, BorrowInput } from '@/types';
import { api } from '@/lib/api';
import BorrowModal from '@/components/borrowings/BorrowModal';
import { Plus, ArrowRightLeft, Clock, CheckCircle, RotateCcw } from 'lucide-react';

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<BorrowingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all');

  const fetchBorrowings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBorrowings();
      setBorrowings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch borrowing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleBorrowBook = async (data: BorrowInput) => {
    await api.borrowBook(data);
    fetchBorrowings();
  };

  const handleReturnBook = async (borrowingId: number, bookTitle: string) => {
    if (confirm(`Confirm return for book "${bookTitle}"?`)) {
      try {
        await api.returnBook(borrowingId);
        fetchBorrowings();
      } catch (err: any) {
        alert(err.message || 'Failed to return book.');
      }
    }
  };

  const filteredBorrowings = borrowings.filter((item) => {
    if (filter === 'active') return !item.returned_at;
    if (filter === 'returned') return item.returned_at !== null;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Borrowing Records</h1>
          <p className="text-slate-500 text-sm mt-1">Track issued books and process returns.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Issue Book
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {(['all', 'active', 'returned'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredBorrowings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ArrowRightLeft className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">No records found</h3>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'all' ? 'No borrowing history available.' : `No ${filter} borrowings found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Borrow ID</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Borrowed Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.book.title}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{item.member.name}</div>
                      <div className="text-xs text-slate-400">{item.member.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(item.borrowed_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {item.returned_at ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Returned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!item.returned_at && (
                        <button
                          onClick={() => handleReturnBook(item.id, item.book.title)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Return Book
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BorrowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBorrowBook}
      />
    </div>
  );
}