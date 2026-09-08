// Book Types
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

export interface BookCreateInput {
  title: string;
  author: string;
  isbn: string;
  available_copies: number;
}

export interface BookUpdateInput {
  title?: string;
  author?: string;
  isbn?: string;
  available_copies?: number;
}

// Member Types
export interface Member {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface MemberCreateInput {
  name: string;
  email: string;
}

export interface MemberUpdateInput {
  name?: string;
  email?: string;
}

// Borrowing Types
export interface Borrowing {
  id: number;
  member_id: number;
  book_id: number;
  borrowed_at: string;
  returned_at: string | null;
}

export interface BorrowingDetail extends Borrowing {
  book: Book;
  member: Member;
}

export interface BorrowInput {
  member_id: number;
  book_id: number;
}