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
import { useRef, useState, useEffect } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, zoomPlugin);

export default function SentimentTrendChart({ weeklyData, monthlyData }) {
  const chartRef = useRef(null);
  const [aggregate, setAggregate] = useState('weekly');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode on component mount and when it changes
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);
    
    const handleDarkModeChange = (e) => {
      setIsDarkMode(e.matches);
    };
    
    darkModeQuery.addEventListener('change', handleDarkModeChange);
    return () => darkModeQuery.removeEventListener('change', handleDarkModeChange);
  }, []);

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
          color: isDarkMode ? '#d1d5db' : '#6b7280', // Gray-300 in dark mode, Gray-500 in light
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        ticks: {
          color: isDarkMode ? '#d1d5db' : '#6b7280', // Gray-300 in dark mode, Gray-500 in light
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#f3f4f6' : '#1f2937', // Gray-100 in dark mode, Gray-800 in light
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#f3f4f6' : '#1f2937',
        bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      },
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
            backgroundColor: isDarkMode ? 'rgba(100,100,100,0.3)' : 'rgba(225,225,225,0.3)',
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
    <div className="result-card col-span-3 dark:bg-gray-800">
      <div className="flex justify-between items-top mb-8">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sentiment Trends</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setAggregate('weekly')}
            className={`px-3 py-1 rounded transition-colors ${
              aggregate === 'weekly' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setAggregate('monthly')}
            className={`px-3 py-1 rounded transition-colors ${
              aggregate === 'monthly' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
        </div>
        <button 
          onClick={resetZoom} 
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm transition-colors"
        >
          Reset Zoom
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full h-[400px]">
          <Bar ref={chartRef} data={aggregate === 'weekly' ? weeklyChartData : monthlyChartData} options={options} />
        </div>
      </div>
    </div>
  );
}