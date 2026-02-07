'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'user') {
      // If admin tries to access user dashboard, maybe allow or redirect?
      // Strict role check:
      router.push('/login'); 
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`w-64 bg-green-800 text-white flex flex-col fixed md:relative z-30 h-full transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 text-2xl font-bold flex justify-between items-center">
          User Dashboard
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white">×</button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700 bg-green-700">
            Dashboard
          </a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700">
            Profile
          </a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-green-700">
            My Requests
          </a>
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center py-4 px-6 bg-white border-b-4 border-green-600">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden p-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-2xl font-semibold text-gray-800 ml-4">Dashboard</span>
          </div>
          <div className="flex items-center">
             <div className="relative">
              <span className="text-gray-600">Hello, <strong>{user?.username}</strong> (User)</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <div className="container mx-auto">
             <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h2>
                <p className="text-gray-700">
                   You have successfully logged in as a verified user.
                </p>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
