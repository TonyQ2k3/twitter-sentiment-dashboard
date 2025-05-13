import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import TopComments from "../components/TopComments";
import WeeklySentimentChart from "../components/WeeklySentimentChart";
import { getToken, authFetch } from "../auth";


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
  const [weeklyData, setWeeklyData] = useState([]);
  const [activeTab, setActiveTab] = useState("sentiment");

  const token = getToken();

  const handleSearch = async () => {
    if (!product) return;
    setLoading(true);
    setError(null);
    try {
      const headers = {
        "Authorization": `Bearer ${token}`
      };

      const res = await authFetch(`/api/sentiment/summary?product=${encodeURIComponent(product)}`, { headers });
      if (!res.ok) 
        throw new Error("Failed to fetch data");
      const result = await res.json();
      setData(result);

      const resComments = await authFetch(`/api/sentiment/top-comments?product=${encodeURIComponent(product)}`, { headers });
      if (!resComments.ok) throw new Error("Failed to fetch comments");
      const commentData = await resComments.json();
      setTopComments(commentData);

      const resWeekly = await authFetch(`/api/sentiment/weekly?product=${encodeURIComponent(product)}`, { headers });
      if (!resWeekly.ok) throw new Error("Failed to fetch weekly sentiment");
      const weekly = await resWeekly.json();
      setWeeklyData(weekly);

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
    <div className="flex gap-6 bg-gray-100 p-6">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-2xl shadow p-4">
        <h1 className="text-xl font-bold mb-6">BRANDITORING</h1>
        <nav className="space-y-4">
          <button 
            className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === "sentiment" ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("sentiment")}>
            Sentiment Analysis
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === "weekly" ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => setActiveTab("weekly")}>
            Weekly Sentiment
          </button>
          <button 
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">
            Feedback Channels
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 space-y-6">
        {/* Header - always visible regardless of tab */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="result-value">{data.product}</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              className="px-4 py-2 rounded-lg border text-base flex-1 md:flex-none"
              placeholder="Enter product name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <button 
              onClick={handleSearch} 
              disabled={loading} 
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab content */}
        {activeTab === "sentiment" ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Pie Chart and Top Comments Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="result-card">
                <h3 className="text-md font-semibold mb-2">Sentiment Distribution</h3>
                <Pie data={chartData} />
              </div>

              {/* Top Comments Section */}
              <div className="lg:col-span-2">
                <TopComments comments={topComments} />
              </div>
            </div>
          </>
        ) : (
          /* Weekly Sentiment Tab Content */
          <div className="mt-4">
            <WeeklySentimentChart data={weeklyData} />
          </div>
        )}
      </div>
    </div>
  );
}
