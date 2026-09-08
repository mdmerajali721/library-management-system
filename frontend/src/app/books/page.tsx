'use client';

import { useEffect, useState, useCallback } from 'react';
import { Book, BookCreateInput } from '@/types';
import { api } from '@/lib/api';
import BookModal from '@/components/books/BookModal';
import BookSearch from '@/components/books/BookSearch';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter states
  const [titleQuery, setTitleQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBooks(titleQuery, authorQuery);
      setBooks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, [titleQuery, authorQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Handle Add / Edit submit
  const handleSaveBook = async (formData: BookCreateInput) => {
    if (editingBook) {
      await api.updateBook(editingBook.id, formData);
    } else {
      await api.createBook(formData);
    }
    fetchBooks();
  };

  // Handle Delete
  const handleDeleteBook = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deleteBook(id);
        fetchBooks();
      } catch (err: any) {
        alert(err.message || 'Failed to delete book.');
      }
    }
  };

  // Reset filters
  const handleResetSearch = () => {
    setTitleQuery('');
    setAuthorQuery('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Books Collection</h1>
          <p className="text-slate-500 text-sm mt-1">Manage library inventory and track stock.</p>
        </div>
        <button
          onClick={() => {
            setEditingBook(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add New Book
        </button>
      </div>

      <BookSearch
        titleQuery={titleQuery}
        setTitleQuery={setTitleQuery}
        authorQuery={authorQuery}
        setAuthorQuery={setAuthorQuery}
        onSearch={fetchBooks}
        onReset={handleResetSearch}
      />

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">No books found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria or add a new book.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Available Copies</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{book.title}</td>
                    <td className="py-3 px-4 text-slate-600">{book.author}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{book.isbn}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.available_copies > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {book.available_copies} available
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingBook(book);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBook}
        initialData={editingBook}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      />
    </div>
  );
}