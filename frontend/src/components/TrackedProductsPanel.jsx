import { useState } from "react";
import { authFetch } from "../auth";

export default function TrackedProductsPanel({ tracked, onProductClick }) {
  const [trackedProducts, setTrackedProducts] = useState(tracked);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const untrackProduct = async (product) => {
    try {
      const res = await authFetch(`/api/sentiment/untrack-product?product=${encodeURIComponent(product)}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to untrack product");
      setTrackedProducts((prev) => prev.filter(p => p !== product));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow min-w-full max-w-xl">
      <h2 className="text-lg font-bold mb-3">Tracked Products</h2>
      
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-4">
        {trackedProducts.map((product, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded shadow-sm">
            <button
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => onProductClick && onProductClick(product)}
            >
              {product}
            </button>
            <button
              onClick={() => untrackProduct(product)}
              className="text-xs text-red-500 hover:underline"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
