'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LoginModal({ isOpen, onClose }) {
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('user'); // 'user' | 'admin' -- for login
  
  // Forms
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  if (!isOpen) return null;

  // Handlers
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
      const { token, user } = response.data;

      if (role === 'admin' && user.role !== 'admin') {
        setError('Access denied: You are not an Admin.');
        return;
      }

      Cookies.set('token', token);
      Cookies.set('user', JSON.stringify(user));

      onClose(); 
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Default role is user
      await axios.post('http://localhost:5000/api/auth/register', { ...registerData, role: 'user' });
      setSuccess('Request sent successfully! Please wait for admin approval.');
      // Optional: Switch back to login after short delay or just show success
      // setView('login'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden transform transition-all scale-100 border-t-4 border-[#FF0100]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#FF0100] focus:outline-none transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
           <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
             {view === 'login' ? 'Welcome Back' : 'Request Access'}
           </h2>
           <p className="text-gray-500 text-sm mt-1">
             {view === 'login' ? 'Please login to your account' : 'Fill the form to request access'}
           </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-[#FF0100] text-red-700 p-3 mb-4 rounded text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded text-sm font-medium">
            {success}
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <>
            {/* Role Tabs for Login */}
            <div className="flex justify-center mb-6 space-x-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => { setRole('user'); setError(''); }}
                className={`flex-1 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  role === 'user' 
                    ? 'bg-[#FF0100] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                User Login
              </button>
              <button
                onClick={() => { setRole('admin'); setError(''); }}
                className={`flex-1 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  role === 'admin' 
                    ? 'bg-gray-800 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Admin Login
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1" htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0100] focus:border-transparent bg-gray-50 text-sm"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0100] focus:border-transparent bg-gray-50 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
                  role === 'admin' ? 'bg-gray-800 hover:bg-gray-900' : 'bg-[#FF0100] hover:bg-[#d60000]'
                }`}
              >
                {role === 'admin' ? 'Sign In as Admin' : 'Sign In as User'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={() => switchView('register')}
                className="text-[#FF0100] font-bold hover:underline focus:outline-none"
              >
                Request Access
              </button>
            </div>
          </>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1" htmlFor="reg-username">Choose Username</label>
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0100] focus:border-transparent bg-gray-50 text-sm"
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-1" htmlFor="reg-password">Choose Password</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0100] focus:border-transparent bg-gray-50 text-sm"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 bg-[#FF0100] hover:bg-[#d60000]"
              >
                Submit Request
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button 
                onClick={() => switchView('login')}
                className="text-[#FF0100] font-bold hover:underline focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
