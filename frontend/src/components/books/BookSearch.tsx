'use client';

import { Search, RotateCcw } from 'lucide-react';

interface BookSearchProps {
  titleQuery: string;
  setTitleQuery: (query: string) => void;
  authorQuery: string;
  setAuthorQuery: (query: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function BookSearch({
  titleQuery,
  setTitleQuery,
  authorQuery,
  setAuthorQuery,
  onSearch,
  onReset,
}: BookSearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by title..."
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by author..."
          value={authorQuery}
          onChange={(e) => setAuthorQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          title="Reset Search"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}