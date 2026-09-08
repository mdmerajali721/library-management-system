import {
  Book,
  BookCreateInput,
  BookUpdateInput,
  Member,
  MemberCreateInput,
  MemberUpdateInput,
  BorrowingDetail,
  BorrowInput,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An unexpected error occurred.');
  }

  // DELETE request (204 No Content)-এর ক্ষেত্রে json parse করার দরকার নেই
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Books API
  getBooks: (title?: string, author?: string) => {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (author) params.append('author', author);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetcher<Book[]>(`/api/v1/books${query}`);
  },
  getBook: (id: number) => fetcher<Book>(`/api/v1/books/${id}`),
  createBook: (data: BookCreateInput) =>
    fetcher<Book>('/api/v1/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBook: (id: number, data: BookUpdateInput) =>
    fetcher<Book>(`/api/v1/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteBook: (id: number) =>
    fetcher<void>(`/api/v1/books/${id}`, {
      method: 'DELETE',
    }),

  // Members API
  getMembers: () => fetcher<Member[]>('/api/v1/members'),
  getMember: (id: number) => fetcher<Member>(`/api/v1/members/${id}`),
  createMember: (data: MemberCreateInput) =>
    fetcher<Member>('/api/v1/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMember: (id: number, data: MemberUpdateInput) =>
    fetcher<Member>(`/api/v1/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteMember: (id: number) =>
    fetcher<void>(`/api/v1/members/${id}`, {
      method: 'DELETE',
    }),
  getMemberBorrowings: (memberId: number) =>
    fetcher<BorrowingDetail[]>(`/api/v1/members/${memberId}/borrowings`),

  // Borrowings API
  getBorrowings: () => fetcher<BorrowingDetail[]>('/api/v1/borrowings'),
  borrowBook: (data: BorrowInput) =>
    fetcher<BorrowingDetail>('/api/v1/borrowings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  returnBook: (borrowingId: number) =>
    fetcher<BorrowingDetail>(`/api/v1/borrowings/${borrowingId}/return`, {
      method: 'PATCH',
    }),
};