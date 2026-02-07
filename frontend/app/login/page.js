'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [view, setView] = useState('select'); // 'select', 'admin', 'user'
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e, role) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = response.data;

      if (role === 'admin' && user.role !== 'admin') {
        setError('Access denied: Create an Admin account.');
        return;
      }

      if (role === 'user' && user.role !== 'user') {
         // Maybe allow admin to log in as user? For now strict role check.
         setError('Please use the Admin login.');
         return;
      }

      Cookies.set('token', token);
      Cookies.set('user', JSON.stringify(user));

      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const renderSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Select Login Type</h1>
        <div className="space-y-4">
          <button
            onClick={() => setView('admin')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Admin Login
          </button>
          <button
            onClick={() => setView('user')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            User Login
          </button>
          <div className="text-center mt-4">
            <button 
              onClick={() => router.push('/register')}
              className="text-blue-500 hover:underline text-sm"
            >
              New User? Request Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = (role) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {role === 'admin' ? 'Admin Login' : 'User Login'}
        </h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={(e) => handleLogin(e, role)} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full text-white py-2 px-4 rounded transition ${role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setView('select'); setError(''); setFormData({username: '', password: ''}); }}
            className="w-full text-gray-500 text-sm mt-2 hover:underline"
          >
            Back to Selection
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {view === 'select' && renderSelect()}
      {view === 'admin' && renderLoginForm('admin')}
      {view === 'user' && renderLoginForm('user')}
    </>
  );
}
