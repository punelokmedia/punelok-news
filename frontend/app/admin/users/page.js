'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [stats, setStats] = useState({ pendingUsers: 0 });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchUsers(token);
  }, []);

  const fetchUsers = async (token) => {
    try {
      setLoading(true);
      const [pendingRes, statsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/pending-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPendingList(pendingRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = Cookies.get('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/approve-user`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(token);
    } catch (error) {
      alert('Failed to approve user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    try {
      const token = Cookies.get('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/create-user`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateSuccess('Account created successfully!');
      setNewUser({ username: '', password: '', role: 'user' });
      fetchUsers(token);
      setTimeout(() => setIsCreateModalOpen(false), 2000);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    }
  };

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="mt-4 animate-pulse font-bold text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayoutShell user={user} pageTitle="User accounts">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Queue</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{stats.pendingUsers ?? pendingList.length}</p>
            <p className="mt-1 text-sm text-slate-500">Pending approval requests</p>
          </div>
        </div>

        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.04]"
          aria-labelledby="pending-users-heading"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 id="pending-users-heading" className="text-lg font-semibold text-slate-900">
                Pending users
              </h2>
              <p className="mt-1 text-sm text-slate-500">Review sign-up requests and approve access.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            >
              <FaPlus className="h-4 w-4" /> Create user
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-max w-full table-auto">
              <thead className="border-b border-slate-200 bg-slate-50/90">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6 text-left">Username</th>
                  <th className="py-4 px-6 text-left">Role</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light text-gray-600">
                {pendingList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 px-6 text-center text-slate-400 italic">
                      No pending user requests at the moment.
                    </td>
                  </tr>
                ) : (
                  pendingList.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 transition hover:bg-blue-50/50">
                      <td className="whitespace-nowrap py-4 px-6 text-left">
                        <span className="font-medium text-gray-800">{u.username}</span>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold capitalize text-gray-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          Pending
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleApprove(u._id)}
                          className="mx-auto flex items-center justify-center rounded-lg bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="mb-6 text-2xl font-bold text-gray-800">Create new account</h2>

            {createError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</p>}
            {createSuccess && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">{createSuccess}</p>}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                Create account
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayoutShell>
  );
}
