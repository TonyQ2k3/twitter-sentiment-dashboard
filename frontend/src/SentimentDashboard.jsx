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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sentiment Analysis Dashboard</h1>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Enter product name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {data && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">{data.product}</h2>
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
}
