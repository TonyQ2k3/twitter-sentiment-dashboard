import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function WeeklySentimentChart({ data }) {
  const labels = data.map((entry) => entry.week);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Positive",
        backgroundColor: "#4caf50",
        data: data.map((entry) => entry.Positive),
      },
      {
        label: "Neutral",
        backgroundColor: "#ffc107",
        data: data.map((entry) => entry.Neutral),
      },
      {
        label: "Negative",
        backgroundColor: "#f44336",
        data: data.map((entry) => entry.Negative),
      },
    ],
  };

  return (
    <div className="result-card col-span-3">
      <h3 className="text-md font-semibold mb-2">Weekly Sentiment Trend</h3>
      <Bar data={chartData} />
    </div>
  );
}
