import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch, clearToken, getToken } from "../auth";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Bookmark from "../assets/Bookmark";
import Header from "../components/Header";
import TopComments from "../components/TopComments";
import SentimentTrendChart from "../components/SentimentTrendChart";
import SentimentPieChart from "../components/SentimentPieChart";
import TrackedProductsPanel from "../components/TrackedProductsPanel";
import OnDemandCrawl from "../components/OnDemandCrawl";


ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");
  const [product, setProduct] = useState("");
  const [data, setData] = useState(
    {
      "product": "Example Product",
      "total": 0,
      "positive": 0,
      "neutral": 0,
      "negative": 0,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topComments, setTopComments] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeTab, setActiveTab] = useState("sentiment");

  // Track list feature
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [isTracked, setIsTracked] = useState(false);
  const navigate = useNavigate();

  const token = getToken();

  // Changed here
  // Function to search product
  const handleSearch = async (productName) => {
    if (!productName) 
      return;

    setIsTracked(trackedProducts.includes(productName));

    setLoading(true);
    setError(null);
    
    try {
      const headers = {
        "Authorization": `Bearer ${token}`
      };

      const res = await authFetch(`/api/sentiment/summary?product=${encodeURIComponent(productName)}`, { headers });
      if (!res.ok) 
        throw new Error("Failed to fetch data");
      const result = await res.json();
      setData(result);

      const resComments = await authFetch(`/api/sentiment/top-comments?product=${encodeURIComponent(productName)}`, { headers });
      if (!resComments.ok) 
        throw new Error("Failed to fetch comments");
      const commentData = await resComments.json();
      setTopComments(commentData);

      const resWeekly = await authFetch(`/api/sentiment/weekly?product=${encodeURIComponent(productName)}`, { headers });
      if (!resWeekly.ok) 
        throw new Error("Failed to fetch weekly sentiment");
      const weekly = await resWeekly.json();
      setWeeklyData(weekly);

      const resMonthly = await authFetch(`/api/sentiment/monthly?product=${encodeURIComponent(productName)}`, { headers });
      if (!resMonthly.ok) 
        throw new Error("Failed to fetch weekly sentiment");
      const monthly = await resMonthly.json();
      setMonthlyData(monthly);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch tracked products
  const fetchTrackedProducts = async () => {
    try {
      const res = await authFetch('/api/sentiment/tracked-products');
      if (!res.ok) 
        throw new Error("Failed to fetch tracked products");
      const data = await res.json();

      // Set tracked products from the response
      setTrackedProducts(data.tracked_products || []);
      
      return data.tracked_products;
    } catch (err) {
      console.error("Error fetching tracked products:", err);
      return [];
    }
  };

  // Function to refresh and delete old cache
  const refreshCache = async () => {
    const res = await fetch(`/api/sentiment/refresh-cache?product=${encodeURIComponent(product)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  useEffect(() => {
    if (username !== "") {
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await authFetch("/api/auth/me");
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
        if (data.role === "enterprise") {
          setRole("Enterprise")
        }
        else if (data.role === "admin"){
          setRole("Admin")
        } 
        else {
          setRole("User");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
    fetchTrackedProducts();
  }, []);

  // Toggle tracking status function
  const toggleTracking = async () => {
    if (!product) return;
    try {
      const endpoint = isTracked ? '/api/sentiment/untrack-product' : '/api/sentiment/track-product';
      const res = await authFetch(`${endpoint}?product=${encodeURIComponent(product)}`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error(`Failed to ${isTracked ? 'untrack' : 'track'} product`);
      
      // Toggle the tracking status
      setIsTracked(!isTracked);
    } catch (err) {
      console.error("Error toggling tracking status:", err);
      setError(`Failed to ${isTracked ? 'remove from' : 'add to'} tracking list`);
    }
  };

  const onProductClick = (productName) => {
    setProduct(productName);
    handleSearch(productName);
    setActiveTab("sentiment");
  }

  const onRefresh = () => {
    refreshCache();
  }

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

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <Header username={username} email={email} role={role} handleLogout={handleLogout} />

      {/* Dashboard */}
      <div className="flex flex-col md:flex-row gap-6 p-6">
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

            {(role !== "User") && (
            <button 
              className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "tracked" 
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-800/30 dark:to-purple-800/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm" 
                  : "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("tracked")}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"></path>
                </svg>
                Tracked Products
              </div>
            </button>)}
            {role !== "User" && (
            <button 
              className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "onDemand" 
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-800/30 dark:to-purple-800/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm" 
                  : "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("onDemand")}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                </svg>
                Request a product
              </div>
            </button>)}
          </nav>
        </aside>
      
        {/* Main Panel */}
        <div className="flex-1 space-y-6">
          {activeTab === "sentiment" || activeTab === "weekly" ? (
            <>
              {/* Header - always visible regardless of tab */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{data.product}</h2>
                    {data.product !== "Example Product" && (
                      <button
                        onClick={toggleTracking}
                        className={`p-2 rounded-full transition-all duration-200`}
                        title={isTracked ? "Remove product from tracking list" : "Add product to tracking list"}
                      >
                        {isTracked ? (
                          <Bookmark filled={true} />
                        ) : (
                          <Bookmark filled={false} />
                        )}
                      </button>
                    )}
                  </div>

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
                      onClick={() => handleSearch(product)} 
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
                    <button 
                      class="refresh-btn inline-flex items-center justify-center w-12 h-12 bg-primary hover:bg-purple-700 text-white rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      aria-label="Refresh content"
                      onClick={onRefresh}
                    >
                      <svg class="refresh-icon w-6 h-6 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
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
                  <SentimentPieChart data={data} />

                  {/* Pie Chart and Top Comments Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-white">Sentiment Distribution</h3>
                      <div className="p-2">
                        <Pie data={chartData} />
                      </div>
                    </div>

                    {/* Top Comments Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                      <TopComments comments={topComments} />
                    </div>
                  </div>
                </>
              ) : (
                /* Weekly Sentiment Tab Content */
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                  <SentimentTrendChart weeklyData={weeklyData} monthlyData={monthlyData} />
                </div>
              )}
            </>
          ) : activeTab === "tracked" ? (
            <TrackedProductsPanel tracked={trackedProducts} onProductClick={onProductClick}  />
          ) : (
            <OnDemandCrawl />
          )}
        </div>
      </div>
    </main>
  );
}
