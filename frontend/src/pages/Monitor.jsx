import { useState, useEffect, useRef } from 'react';
import { isAuthenticated } from "../auth";
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

export default function Monitor() {
  // Data states
  const [modelDrifts, setModelDrifts] = useState([]);
  const [datasetDrifts, setDatasetDrifts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summaries, setSummaries] = useState([]);

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
      const resModel = await fetch('/api/monitor/model');
      if (!resModel.ok) {
        throw new Error(`HTTP error! status: ${resModel.status}`);
      }
      const modelDriftsArray = await resModel.json();
      setModelDrifts(modelDriftsArray);

      // Load dataset drift reports from the API
      const resDataset = await fetch('/api/monitor/dataset');
      if (!resDataset.ok) {
        throw new Error(`HTTP error! status: ${resDataset.status}`);
      }
      const datasetDriftsArray = await resDataset.json();
      setDatasetDrifts(datasetDriftsArray);

      // Load alerts from the API
      const resAlerts = await fetch('/api/monitor/alerts');
      if (!resAlerts.ok) {
        throw new Error(`HTTP error! status: ${resAlerts.status}`);
      }
      const alertsArray = await resAlerts.json();
      setAlerts(alertsArray);

      // Load summaries from the API
      const resSummaries = await fetch('/api/monitor/summaries');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
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
      </div>

      {/* If "Model Drift" is selected, display the Model Drift report panel */}
      <ModelDrift reportArray={modelDrifts} />
      {/* If "Dataset Drift" is selected, display the Dataset Drift report panel */}
      <DatasetDrift reportArray={datasetDrifts} />
      {/* If "Alerts" is selected, display the Alerts panel */}
      <Alerts reportArray={alerts} />
      {/* If "Dataset Summary" is selected, display the Dataset Summary panel */}
      <DatasetSummary reportArray={summaries} />
    </div>
  );
}