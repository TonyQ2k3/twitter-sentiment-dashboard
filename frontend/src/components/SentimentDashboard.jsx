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
    <div className="flex flex-col md:flex-row gap-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 min-h-screen transition-colors duration-300">
  {/* Sidebar */}
  <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 p-5 h-fit transition-all duration-300 hover:shadow-xl">
    <div className="mb-6 text-center">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">Dashboard</h2>
      <div className="mt-2 h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
    </div>
    <nav className="space-y-3">
      <button 
        className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
          activeTab === "sentiment" 
            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-800/30 dark:to-purple-800/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm" 
            : "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
        onClick={() => setActiveTab("sentiment")}>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Sentiment Analysis
        </div>
      </button>
      <button 
        className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
          activeTab === "weekly" 
            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-800/30 dark:to-purple-800/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm" 
            : "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
        onClick={() => setActiveTab("weekly")}>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
          Sentiment Trends
        </div>
      </button>
      <button 
        className="block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
          </svg>
          Feedback Channels
        </div>
      </button>
    </nav>
  </aside>

  {/* Main Panel */}
  <div className="flex-1 space-y-6">
    {/* Header - always visible regardless of tab */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{data.product}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base shadow-sm"
              placeholder="Enter product name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <button 
            onClick={handleSearch} 
            disabled={loading} 
            className="px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : "Search"}
          </button>
        </div>
      </div>
    </div>

    {/* Error message if any */}
    {error && (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800 shadow-sm animate-pulse">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      </div>
    )}

    {/* Tab content */}
    {activeTab === "sentiment" ? (
      <>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-3px]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Feedback</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total}</p>
            <div className="mt-2 h-1 w-12 bg-indigo-500 rounded-full"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-3px]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Positive</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{((data.positive / data.total) * 100).toFixed(0)}%</p>
            <div className="mt-2 h-1 w-12 bg-green-500 rounded-full"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-3px]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Neutral</h3>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{((data.neutral / data.total) * 100).toFixed(0)}%</p>
            <div className="mt-2 h-1 w-12 bg-gray-500 rounded-full"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-3px]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Negative</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{((data.negative / data.total) * 100).toFixed(0)}%</p>
            <div className="mt-2 h-1 w-12 bg-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Pie Chart and Top Comments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sentiment Distribution</h3>
            <div className="p-2">
              <Pie data={chartData} />
            </div>
          </div>

          {/* Top Comments Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Popular Comments</h3>
            <TopComments comments={topComments} />
          </div>
        </div>
      </>
    ) : (
      /* Weekly Sentiment Tab Content */
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
        <WeeklySentimentChart data={weeklyData} />
      </div>
    )}
  </div>
</div>
  );
}
