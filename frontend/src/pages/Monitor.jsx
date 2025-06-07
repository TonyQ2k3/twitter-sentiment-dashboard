import { useState, useEffect, useRef } from 'react';
import { authFetch } from "../auth";
import { useNavigate } from "react-router-dom";
import Chart from 'chart.js/auto';

import ModelDrift from '../components/monitor/ModelDrift';
import DatasetDrift from '../components/monitor/DatasetDrift';
import Alerts from '../components/monitor/Alerts';
import DatasetSummary from '../components/monitor/DatasetSummary';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading metrics...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const Sidebar = ({ selectedPanel, onPanelSelect }) => {
  const navigationItems = [
    { 
      id: 'model-drift', 
      name: 'Model Drift',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    { 
      id: 'dataset-drift', 
      name: 'Dataset Drift',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
        </svg>
      )
    },
    { 
      id: 'dataset-summary', 
      name: 'Dataset Summary',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    },
    { 
      id: 'alerts', 
      name: 'Alerts',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      )
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 p-5 h-fit transition-all duration-300 hover:shadow-xl">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Monitor Dashboard</h2>
        <div className="mt-2 h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
      </div>
      <nav className="space-y-3">
        {navigationItems.map(item => (
          <button
            key={item.id}
            onClick={() => onPanelSelect(item.id)}
            className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              selectedPanel === item.id
                ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-800/30 dark:to-purple-800/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm"
                : "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex items-center">
              {item.icon}
              {item.name}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default function Monitor() {
  // Data states
  const [modelDrifts, setModelDrifts] = useState([]);
  const [datasetDrifts, setDatasetDrifts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summaries, setSummaries] = useState([]);

  // Panel selection state
  const [selectedPanel, setSelectedPanel] = useState('model-drift');

  // Misc stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate("/");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load AI model drift reports from the API
      const resModel = await authFetch('/api/monitor/model');
      if (!resModel.ok) {
        throw new Error(`HTTP error! status: ${resModel.status}`);
      }
      const modelDriftsArray = await resModel.json();
      setModelDrifts(modelDriftsArray);

      // Load dataset drift reports from the API
      const resDataset = await authFetch('/api/monitor/dataset-drift');
      if (!resDataset.ok) {
        throw new Error(`HTTP error! status: ${resDataset.status}`);
      }
      const datasetDriftsArray = await resDataset.json();
      setDatasetDrifts(datasetDriftsArray);

      // Load alerts from the API
      const resAlerts = await authFetch('/api/monitor/alerts');
      if (!resAlerts.ok) {
        throw new Error(`HTTP error! status: ${resAlerts.status}`);
      }
      const alertsArray = await resAlerts.json();
      setAlerts(alertsArray);

      // Load summaries from the API
      const resSummaries = await authFetch('/api/monitor/dataset-summary');
      if (!resSummaries.ok) {
        throw new Error(`HTTP error! status: ${resSummaries.status}`);
      }
      const summariesArray = await resSummaries.json();
      setSummaries(summariesArray);

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching metrics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentPanel = () => {
    switch(selectedPanel) {
      case 'model-drift':
        return <ModelDrift reportArray={modelDrifts} />;
      case 'dataset-drift':
        return <DatasetDrift reportArray={datasetDrifts} />;
      case 'alerts':
        return <Alerts reportArray={alerts} />;
      case 'dataset-summary':
        return <DatasetSummary reportArray={summaries} />;
      default:
        return <ModelDrift reportArray={modelDrifts} />;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Dark mode detection
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Sidebar selectedPanel={selectedPanel} onPanelSelect={setSelectedPanel} />
      
      <div className="flex-1 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <button
                onClick={handleReturnHome}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Dashboard
              </button>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ML Model Evaluation Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Performance metrics and test results analysis
              </p>
              <button
                onClick={fetchData}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Current Panel Content */}
          {renderCurrentPanel()}
        </div>
      </div>
    </div>
  );
}