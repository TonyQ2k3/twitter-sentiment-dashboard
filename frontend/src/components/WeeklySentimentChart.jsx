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
import { useRef } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, zoomPlugin);

export default function WeeklySentimentChart({ data }) {
  const chartRef = useRef(null);
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
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sentiment Trends</h3>
        <button 
          onClick={resetZoom}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
        >
          Reset Zoom
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className={`min-w-[${data.length * 60}px] h-[400px]`}>
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}