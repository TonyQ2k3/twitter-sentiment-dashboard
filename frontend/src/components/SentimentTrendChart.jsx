import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useRef, useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, zoomPlugin);

export default function SentimentTrendChart({ weeklyData, monthlyData }) {
  const chartRef = useRef(null);

  const [aggregate, setAggregate] = useState('weekly');

  const weeklyLabels = weeklyData.map((entry) => entry.week);
  const monthlyLabels = monthlyData.map((entry) => entry.month);

  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Positive",
        backgroundColor: "#4caf50",
        data: weeklyData.map((entry) => entry.Positive),
      },
      {
        label: "Neutral",
        backgroundColor: "#ffc107",
        data: weeklyData.map((entry) => entry.Neutral),
      },
      {
        label: "Negative",
        backgroundColor: "#f44336",
        data: weeklyData.map((entry) => entry.Negative),
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Positive",
        backgroundColor: "#4caf50",
        data: monthlyData.map((entry) => entry.Positive),
      },
      {
        label: "Neutral",
        backgroundColor: "#ffc107",
        data: monthlyData.map((entry) => entry.Neutral),
      },
      {
        label: "Negative",
        backgroundColor: "#f44336",
        data: monthlyData.map((entry) => entry.Negative),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'shift', // Hold shift key to pan
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
          drag: {
            enabled: true,
            backgroundColor: 'rgba(225,225,225,0.3)',
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 1,
          },
        },
        limits: {
          x: {min: 'original', max: 'original'},
        }
      }
    }
  };

  const resetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div className="result-card col-span-3">
      <div className="flex justify-between items-top mb-8">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sentiment Trends</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setAggregate('weekly')}
            className={`px-3 py-1 rounded ${aggregate === 'weekly' ? 'bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setAggregate('monthly')}
            className={`px-3 py-1 rounded ${aggregate === 'monthly' ? 'bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Monthly
          </button>
        </div>
        <button onClick={resetZoom} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors">
          Reset Zoom
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className={`min-w-[${aggregate === 'weekly' ? weeklyChartData.length * 60 : monthlyChartData.length * 60}px] h-[400px]`}>
          <Bar ref={chartRef} data={aggregate === 'weekly' ? weeklyChartData : monthlyChartData} options={options} />
        </div>
      </div>
    </div>
  );
}

