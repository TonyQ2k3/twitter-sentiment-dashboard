import { useState } from "react";
import { authFetch } from "../auth";

export default function OnDemandCrawl({ product }) {
  const [timeFilter, setTimeFilter] = useState("week");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCrawl = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await authFetch(
        `api/sentiment/submit-analysis?product=${encodeURIComponent(product)}&time_filter=${timeFilter}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to crawl");
      }
      const data = await res.json();
      setMessage(data.message || "Crawl started successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mt-4 bg-white rounded shadow max-w-xl">
      <h3 className="text-md font-semibold mb-2">On-Demand Analysis</h3>
      <div className="flex items-center gap-4">
        <select
          className="border rounded px-2 py-1"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={!product || loading}
          onClick={handleCrawl}
        >
          {loading ? "Submitting..." : "Analyze Now"}
        </button>
      </div>
      {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
