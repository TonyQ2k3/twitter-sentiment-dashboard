import { useState, useEffect } from "react";
import { authFetch } from "../auth";

export default function OnDemandCrawl() {
  const [timeFilter, setTimeFilter] = useState("week");
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  // Dark mode detection
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);


  const handleCrawl = async () => {
    if (!product.trim()) return;
    
    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      // Replace this with your actual API call:
      const res = await authFetch(
        `api/sentiment/submit-analysis?product=${encodeURIComponent(product)}&time_filter=${timeFilter}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to crawl");
      }
      const data = await res.json();
      setMessage(data.message || "Analysis started successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = [
    { value: "week", label: "7", unit: "Days" },
    { value: "month", label: "30", unit: "Days" },
    { value: "year", label: "365", unit: "Days" }
  ];

  return (
    <>
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        .dark .gradient-bg {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        }
        .glass {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .loading-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      
      <div className="glass rounded-2xl shadow-2xl p-8 animate-fade-in max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5D5CDE] to-[#4B4BC8] rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">On-Demand Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300">Start sentiment analysis for your product</p>
        </div>

        {/* Product Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Product Name
          </label>
          <input 
            type="text" 
            placeholder="Enter product name..."
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Time Filter */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Analysis Period
          </label>
          <div className="grid grid-cols-3 gap-3">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFilter(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                  timeFilter === option.value
                    ? 'border-[#5D5CDE] bg-[#5D5CDE] text-white shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#5D5CDE] hover:text-[#5D5CDE]'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">{option.label}</div>
                  <div className="text-xs opacity-75">{option.unit}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleCrawl}
          disabled={!product.trim() || loading}
          className="w-full bg-gradient-to-r from-[#5D5CDE] to-[#4B4BC8] text-white font-semibold py-4 px-6 rounded-xl hover:from-[#4B4BC8] hover:to-[#5D5CDE] transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
        >
          <span className="flex items-center justify-center gap-3">
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>{loading ? 'Starting Analysis...' : 'Start Analysis'}</span>
          </span>
        </button>

        {/* Status Messages */}
        {(message || error || loading) && (
          <div className="mt-6">
            {/* Success Message */}
            {message && !loading && (
              <div className="animate-slide-up bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{message}</span>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && !loading && (
              <div className="animate-slide-up bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            {loading && (
              <div className="animate-slide-up bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Analysis in progress<span className="loading-dots"></span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">This may take a few moments</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}