import { useState } from "react";
import { authFetch } from "../auth";

export default function TrackedProductsPanel({ tracked, onProductClick }) {
  const [trackedProducts, setTrackedProducts] = useState(tracked);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingUntrack, setPendingUntrack] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const showError = (err) => {
    setError(err);
    setTimeout(() => setError(null), 3000);
  };

  // Handle delete confirmation
  const handleDeleteClick = (product) => {
    setConfirmDelete(product);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const confirmAndUntrack = (product) => {
    untrackProduct(product);
    setConfirmDelete(null);
  };

  const untrackProduct = async (product) => {
    try {
      setLoading(true);
      setPendingUntrack(product);
      
      const res = await authFetch(`/api/sentiment/untrack-product?product=${encodeURIComponent(product)}`, {
        method: "POST"
      });
      
      if (!res.ok) throw new Error("Failed to untrack product");
      
      setTrackedProducts((prev) => prev.filter(p => p !== product));
      showMessage(`Removed "${product}" from tracked products`);
    } catch (err) {
      console.error(err);
      showError(`Couldn't remove "${product}". Please try again.`);
    } finally {
      setLoading(false);
      setPendingUntrack(null);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 min-w-full max-w-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Tracked Products
        </h2>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {trackedProducts.length} {trackedProducts.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {/* Message and Error display */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-center text-sm text-green-700 dark:text-green-300 animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-sm text-red-700 dark:text-red-300 animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Empty state */}
      {trackedProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mb-1">No products tracked yet</p>
          <p className="text-sm">Products you track will appear here</p>
        </div>
      )}

      {/* Product items */}
      {trackedProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {trackedProducts.map((product, index) => (
            <div 
              key={index} 
              className={`group relative flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 
                ${pendingUntrack === product ? 'opacity-60' : ''}
                bg-gray-50 hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-indigo-900/40
                border border-gray-200 hover:border-indigo-300 dark:border-gray-600 dark:hover:border-indigo-700`}
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              {confirmDelete === product ? (
                // Confirmation UI
                <div className="w-full animate-fadeIn">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-medium">Remove this product?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelDelete}
                      className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmAndUntrack(product)}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                // Normal display
                <>
                  <button
                    className="flex-1 text-left font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => onProductClick && onProductClick(product)}
                    disabled={loading && pendingUntrack === product}
                  >
                    {product}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(product)}
                    disabled={loading && pendingUntrack === product}
                    className="ml-2 p-1.5 rounded-full transition-all duration-200
                      opacity-0 group-hover:opacity-100 focus:opacity-100
                      text-gray-400 hover:text-red-500 hover:bg-red-50
                      dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                    aria-label={`Remove ${product}`}
                  >
                    {loading && pendingUntrack === product ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          ))}
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}