import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';


const ReportSelector = ({ reports, selectedReport, onReportChange }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Report Selection
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a report to analyze ({reports.length} reports available)
          </p>
        </div>
        <div className="sm:w-80">
          <select
            value={selectedReport}
            onChange={(e) => onReportChange(parseInt(e.target.value))}
            className="w-full px-4 py-2 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white"
          >
            {reports.map((report, index) => (
              <option key={index} value={index}>
                Report {index + 1} - {formatTimestamp(report.timestamp)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, description, status = null }) => {
  const getStatusColor = () => {
    if (status === 'FAIL') return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (status === 'SUCCESS') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor()} transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {status && (
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            status === 'FAIL' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
          }`}>
            {status}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : value}
      </div>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

const PerLabelChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && data) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = ['Negative', 'Positive', 'Neutral'];
      const f1Data = labels.map(label => data.f1[`${labels.indexOf(label)}.${label}`] || 0);
      const precisionData = labels.map(label => data.precision[`${labels.indexOf(label)}.${label}`] || 0);
      const recallData = labels.map(label => data.recall[`${labels.indexOf(label)}.${label}`] || 0);

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'F1 Score',
              data: f1Data,
              backgroundColor: 'rgba(93, 92, 222, 0.8)',
              borderColor: 'rgba(93, 92, 222, 1)',
              borderWidth: 1
            },
            {
              label: 'Precision',
              data: precisionData,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1
            },
            {
              label: 'Recall',
              data: recallData,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#374151'
              }
            },
            title: {
              display: true,
              text: 'Per-Label Metrics Comparison',
              color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#374151'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280',
                callback: function(value) {
                  return (value * 100).toFixed(0) + '%';
                }
              },
              grid: {
                color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
              }
            },
            x: {
              ticks: {
                color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
              },
              grid: {
                color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} className="w-full h-64"></canvas>;
};

const TestResultsTable = ({ tests }) => {
  if (!tests || tests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Results</h3>
        <p className="text-gray-500 dark:text-gray-400">No test results available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Results</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Test Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tests.map((test, index) => (
              <tr key={test.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {test.name?.split(':')[0] || 'Unknown Test'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.status === 'FAIL' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' 
                      : test.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                  }`}>
                    {test.status || 'UNKNOWN'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {test.description || 'No description available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ModelDrift({ reportArray }) {
    const reports = reportArray || [];
    const [selectedReportIndex, setSelectedReportIndex] = useState(0);

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

    const currentReport = reports[selectedReportIndex];

    // Extract main metrics from current report
    const getMetricValue = (metricId) => {
        const metric = currentReport.metrics?.find(m => m.metric_id?.includes(metricId));
        return metric ? metric.value : 0;
    };

    const getTestStatus = (metricName) => {
        const test = currentReport.tests?.find(t => t.name?.toLowerCase().includes(metricName.toLowerCase()));
        return test ? test.status : null;
    };

    const getPerLabelData = () => {
        const f1Metric = currentReport.metrics?.find(m => m.metric_id?.includes('F1ByLabel'));
        const precisionMetric = currentReport.metrics?.find(m => m.metric_id?.includes('PrecisionByLabel'));
        const recallMetric = currentReport.metrics?.find(m => m.metric_id?.includes('RecallByLabel'));

        return {
        f1: f1Metric ? f1Metric.value : {},
        precision: precisionMetric ? precisionMetric.value : {},
        recall: recallMetric ? recallMetric.value : {}
        };
    };

  const mainMetrics = [
    { 
      title: 'Accuracy', 
      value: getMetricValue('Accuracy'), 
      status: getTestStatus('Accuracy') 
    },
    { 
      title: 'Precision', 
      value: getMetricValue('Precision'), 
      status: getTestStatus('Precision') 
    },
    { 
      title: 'Recall', 
      value: getMetricValue('Recall'), 
      status: getTestStatus('Recall') 
    },
    { 
      title: 'F1 Score', 
      value: getMetricValue('F1Score'), 
      status: getTestStatus('F1') 
    }
  ];

  const failedTests = currentReport.tests?.filter(test => test.status === 'FAIL').length || 0;
  const successedTests = currentReport.tests?.filter(test => test.status === 'SUCCESS').length || 0;
  const totalMetrics = currentReport.metrics?.length || 0;

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

        {/* Report Selector */}
        <ReportSelector 
          reports={reports}
          selectedReport={selectedReportIndex}
          onReportChange={setSelectedReportIndex}
        />

        {/* Current Report Timestamp */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              Current Report: {new Date(currentReport.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              status={metric.status}
            />
          ))}
        </div>

        {/* Per-Label Metrics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <PerLabelChart data={getPerLabelData()} />
        </div>

        {/* Test Results */}
        <TestResultsTable tests={currentReport.tests} />

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failedTests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{successedTests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Succeeded Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalMetrics}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Metrics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}