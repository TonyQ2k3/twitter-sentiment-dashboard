import TopComments from "./TopComments";
import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SentimentDashboard() {
  const [product, setProduct] = useState("");
  const [data, setData] = useState(
    {
      "product": "Amazon",
      "total": 31,
      "positive": 8,
      "neutral": 17,
      "negative": 6,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topComments, setTopComments] = useState([]);


  const handleSearch = async () => {
    if (!product) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sentiment-summary?product=${encodeURIComponent(product)}`);
      if (!res.ok) 
        throw new Error("Failed to fetch data");
      const result = await res.json();
      setData(result);

      const resComments = await fetch(`/api/top-comments?product=${encodeURIComponent(product)}`);
      if (!resComments.ok) throw new Error("Failed to fetch comments");
      const commentData = await resComments.json();
      setTopComments(commentData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data && {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment Distribution",
        data: [data.positive, data.neutral, data.negative],
        backgroundColor: ["#4caf50", "#ffc107", "#f44336"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-2xl shadow p-4">
        <h1 className="text-xl font-bold mb-6">BRANDITORING</h1>
        <nav className="space-y-4">
          <button className="block w-full text-left px-4 py-2 rounded-lg bg-gray-200 font-semibold">
            Sentiment Analysis
          </button>
          <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">
            Feedback Channels
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="result-value">{data.product}</h2>
          <div className="flex items-center gap-6">
            <input
              className="px-4 py-2 rounded-lg border"
              placeholder="Enter product name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="result-card">
            <h3 className="result-title">Total Feedback</h3>
            <p className="result-value">{data.total}</p>
          </div>
          <div className="result-card">
            <h3 className="result-title">Positive</h3>
            <p className="result-value">{((data.positive / data.total) * 100).toFixed(0)}%</p>
          </div>
          <div className="result-card">
            <h3 className="result-title">Neutral</h3>
            <p className="result-value">{((data.neutral / data.total) * 100).toFixed(0)}%</p>
          </div>
          <div className="result-card">
            <h3 className="result-title">Negative</h3>
            <p className="result-value">{((data.negative / data.total) * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="grid grid-cols-3 gap-4">
          <div className="result-card">
            <h3 className="text-md font-semibold mb-2">Sentiment Distribution</h3>
            <Pie data={chartData} />
          </div>

          {/* Top Comments Section */}
          <div className="col-span-2">
            <TopComments comments={topComments} />
          </div>
        </div>
      </main>
    </div>
  </div>
  );
}
