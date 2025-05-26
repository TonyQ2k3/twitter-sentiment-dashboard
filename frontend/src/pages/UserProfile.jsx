import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { authFetch, isAuthenticated } from "../auth";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Check for dark mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  // Fetch user data from API
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await authFetch("/api/auth/me");
        const data = await res.json();
        setUserData(data);
        setError(null);
      } 
      catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again.');
      } 
      finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Button click handlers
  const handleEditProfile = () => {
    alert('Edit profile functionality would open here.');
  };

  const handleChangePassword = () => {
    alert('Change password functionality would open here.');
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  // Error state
  if (error) {
    return (
      <main className="mx-auto px-4 py-8 max-w-4xl min-h-screen dark:bg-gray-800">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Unable to load profile</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (loading || userData === null) {
    return (
      <main className="px-4 py-8 min-h-screen dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </main>
    );
  }
  
  // If we get here, we have data
  const isEnterprise = userData.role === 'enterprise';
  
  return (
    <main className="px-4 py-8 min-h-screen dark:bg-gray-800">
      <div className="mb-6">
        <button
          onClick={handleReturnHome}
          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </button>
      </div>
      {/* Header with Avatar */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white dark:text-white transform transition-transform hover:scale-105">
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 px-3 py-1 text-xs font-medium rounded-full shadow-md bg-primary-400 text-white">
            {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {userData.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {userData.email}
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button 
              onClick={handleEditProfile}
              className="inline-flex items-center px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg shadow transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <button 
              onClick={handleChangePassword}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </button>
          </div>
        </div>
      </div>
      
      {/* Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Basic Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
              <p className="text-gray-800 dark:text-gray-200">
                {userData.username}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-800 dark:text-gray-200">
                {userData.email}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</label>
              <p className="text-gray-800 dark:text-gray-200 capitalize">
                {userData.role}
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Information */}
        {isEnterprise && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Business Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
                <p className="text-gray-800 dark:text-gray-200">
                  {userData.company_name || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Business Address</label>
                <p className="text-gray-800 dark:text-gray-200">
                  {userData.business_address || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID</label>
                <p className="text-gray-800 dark:text-gray-200">
                  {userData.tax_id || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tracked Products Section (Enterprise Only) */}
      {isEnterprise && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tracked Products</h2>
            </div>
            
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {userData.tracked_products?.length || 0} products
              </span>
            </div>
          </div>
          
          {/* Empty state */}
          {(!userData.tracked_products || userData.tracked_products.length === 0) ? (
            <div className="py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No products are being tracked yet.</p>
              <button className="mt-3 inline-flex items-center px-4 py-2 bg-primary-400 hover:bg-primary-500 text-white rounded-lg text-sm shadow transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            </div>
          ) : (
            /* Products grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {userData.tracked_products.map((product, index) => (
                <div 
                  key={index}
                  className="group bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/40 border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg px-4 py-3 transition-all duration-300"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{product}</span>
                    <button className="ml-2 p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:text-gray-500 dark:hover:text-primary-400 dark:hover:bg-primary-900/30" aria-label="View product details">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}