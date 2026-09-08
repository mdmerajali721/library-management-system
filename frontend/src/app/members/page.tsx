'use client';

import { useEffect, useState } from 'react';
import { Member, MemberCreateInput } from '@/types';
import { api } from '@/lib/api';
import MemberModal from '@/components/members/MemberModal';
import MemberBorrowingsModal from '@/components/members/MemberBorrowingsModal';
import { Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Borrowings View Modal State
  const [isBorrowingsModalOpen, setIsBorrowingsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSaveMember = async (formData: MemberCreateInput) => {
    if (editingMember) {
      await api.updateMember(editingMember.id, formData);
    } else {
      await api.createMember(formData);
    }
    fetchMembers();
  };

  const handleDeleteMember = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete member "${name}"?`)) {
      try {
        await api.deleteMember(id);
        fetchMembers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete member.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Members Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage library memberships and view borrowing history.</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add New Member
        </button>
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
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">No members registered</h3>
          <p className="text-slate-400 text-sm mt-1">Get started by adding a new member.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">#{member.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{member.name}</td>
                    <td className="py-3 px-4 text-slate-600">{member.email}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setIsBorrowingsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-xs font-medium transition-colors"
                        title="View Borrowed Books"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> History
                      </button>
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Member"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Delete Member"
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

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveMember}
        initialData={editingMember}
        title={editingMember ? 'Edit Member' : 'Add New Member'}
      />

      <MemberBorrowingsModal
        isOpen={isBorrowingsModalOpen}
        onClose={() => setIsBorrowingsModalOpen(false)}
        member={selectedMember}
      />
    </div>
  );
}