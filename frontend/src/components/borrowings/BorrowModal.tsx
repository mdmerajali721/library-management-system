'use client';

import { useState, useEffect } from 'react';
import { Book, Member, BorrowInput } from '@/types';
import { api } from '@/lib/api';
import { X, BookOpen, User } from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BorrowInput) => Promise<void>;
}

export default function BorrowModal({ isOpen, onClose, onSubmit }: BorrowModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      setError(null);
      Promise.all([api.getMembers(), api.getBooks()])
        .then(([membersData, booksData]) => {
          setMembers(membersData);
          // শুধুমাত্র যেসব বইয়ের কপি এভেলেবল আছে (>0) সেগুলো ড্রপডাউনে ফিল্টার হবে
          setBooks(booksData.filter((b) => b.available_copies > 0));
        })
        .catch((err: any) => setError(err.message || 'Failed to load options.'))
        .finally(() => setLoadingData(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedBookId) {
      setError('Please select both a member and a book.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        member_id: Number(selectedMemberId),
        book_id: Number(selectedBookId),
      });
      setSelectedMemberId('');
      setSelectedBookId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to borrow book.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Issue New Book</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-500" /> Select Member
              </label>
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              >
                <option value="">-- Choose Member --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-slate-500" /> Select Available Book
              </label>
              <select
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              >
                <option value="">-- Choose Book --</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author} ({book.available_copies} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Issuing...' : 'Issue Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}