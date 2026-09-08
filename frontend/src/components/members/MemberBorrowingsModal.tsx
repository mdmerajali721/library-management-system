'use client';

import { useEffect, useState } from 'react';
import { Member, BorrowingDetail } from '@/types';
import { api } from '@/lib/api';
import { X, BookOpen, Clock, CheckCircle } from 'lucide-react';

interface MemberBorrowingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export default function MemberBorrowingsModal({
  isOpen,
  onClose,
  member,
}: MemberBorrowingsModalProps) {
  const [borrowings, setBorrowings] = useState<BorrowingDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && member) {
      setLoading(true);
      setError(null);
      api
        .getMemberBorrowings(member.id)
        .then((data) => setBorrowings(data))
        .catch((err: any) => setError(err.message || 'Failed to load borrowing history.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{member.name}'s Borrowings</h2>
            <p className="text-slate-500 text-xs mt-0.5">{member.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No borrowing history found for this member.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {borrowings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-slate-800">{item.book.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">By {item.book.author} (ISBN: {item.book.isbn})</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      <span>
                        <strong>Borrowed:</strong> {new Date(item.borrowed_at).toLocaleDateString()}
                      </span>
                      {item.returned_at && (
                        <span>
                          <strong>Returned:</strong> {new Date(item.returned_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {item.returned_at ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" /> Returned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3.5 w-3.5" /> Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}