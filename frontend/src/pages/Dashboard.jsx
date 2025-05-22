import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch, clearToken, isAuthenticated } from "../auth";
import SentimentDashboard from "../components/SentimentDashboard";
import {logo} from '../assets';

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
    if (username !== "") {
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await authFetch("/api/auth/me");
        const data = await res.json();
        setUsername(data.username);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
        if (profileMenuOpen && !event.target.closest('.relative')) {
        setProfileMenuOpen(false);
        }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [profileMenuOpen]);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
        <header className="relative bg-white dark:bg-gray-800 shadow-md rounded-lg mb-2">
        {/* <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-1.5"></div> */}
        {/* Main header content */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-2 px-6">
                {/* Left section: Brand/Logo */}
                <div className="flex items-center mb-4 sm:mb-0">
                <div className="flex items-center space-x-2">
                    <img src={logo} alt="Logo" className="w-10 h-10 transform transition-transform hover:scale-105" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Social Scope</span>
                </div>
                </div>
                
                {/* Right section: User profile & actions */}
                <div className="flex items-center space-x-4">
                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button 
                        onClick={() => setProfileMenuOpen(profileMenuOpen => !profileMenuOpen)} 
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                        {/* User Avatar - First Letter of Username */}
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold transform transition-transform hover:scale-105">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-medium text-gray-900 dark:text-white">{username}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">User Account</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        </button>
                        
                        {/* User Dropdown Menu */}
                        <div className={`${profileMenuOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out z-10`}>
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                            <p className="font-medium truncate dark:text-white">{username}</p>
                            </div>
                            <ul className="py-2">
                            <li>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Your Profile
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Settings
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Help
                                </a>
                            </li>
                            </ul>
                            <div className="py-2 border-t border-gray-200 dark:border-gray-600">
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                Sign Out
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

      {/* Dashboard */}
      <SentimentDashboard />
    </main>
  );
}
