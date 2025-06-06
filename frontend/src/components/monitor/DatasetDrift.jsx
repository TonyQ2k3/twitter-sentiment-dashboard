import { useState, useMemo } from 'react'


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


export default function DatasetDrift({ reportArray }) {
  const reports = reportArray || [];
  const [selectedReportIndex, setSelectedReportIndex] = useState(0)
  
  // Process the current report data
  const currentReport = reportArray?.[selectedReportIndex]
  
  const processedData = useMemo(() => {
    if (!currentReport) return null
    
    // Extract overall drift summary
    const driftedColumnsMetric = currentReport.metrics?.find(m => 
      m.metric_id.includes('DriftedColumnsCount')
    )
    
    // Group metrics by column
    const columnMetrics = currentReport.metrics?.filter(m => 
      m.metric_id.includes('ValueDrift')
    ).map(metric => {
      const columnMatch = metric.metric_id.match(/column=([^,)]+)/)
      const methodMatch = metric.metric_id.match(/method=([^,)]+)/)
      const thresholdMatch = metric.metric_id.match(/threshold=([^)]+)/)
      
      return {
        id: metric.id,
        column: columnMatch?.[1] || 'Unknown',
        method: methodMatch?.[1] || 'Unknown',
        threshold: parseFloat(thresholdMatch?.[1]) || 0,
        value: metric.value,
        isDrifted: metric.value > (parseFloat(thresholdMatch?.[1]) || 0)
      }
    }) || []
    
    // Get test results
    const testResults = currentReport.tests?.map(test => ({
      id: test.id,
      name: test.name,
      description: test.description,
      status: test.status,
      column: test.metric_config?.params?.column || 'Overall'
    })) || []
    
    return {
      overallDrift: driftedColumnsMetric?.value || { count: 0, share: 0 },
      columnMetrics,
      testResults,
      timestamp: currentReport.timestamp
    }
  }, [currentReport])
  
  const getStatusColor = (status) => {
    return status === 'SUCCESS' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }
  
  const getDriftColor = (isDrifted) => {
    return isDrifted ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'text-green-600 bg-green-50 dark:bg-green-900/20'
  }
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }
  
  if (!reportArray || reportArray.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No drift reports available
      </div>
    )
  }
  
  if (!processedData) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading drift data...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Report Selector */}
      <ReportSelector 
        reports={reports}
        selectedReport={selectedReportIndex}
        onReportChange={setSelectedReportIndex}
      />

      {/* Overall Drift Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Overall Drift Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Drifted Columns
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {processedData.overallDrift.count}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Drift Share
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {(processedData.overallDrift.share * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Columns
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {processedData.columnMetrics.length}
            </div>
          </div>
        </div>
      </div>

      {/* Column Drift Metrics */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Column Drift Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Column
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Method
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Drift Score
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Threshold
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.columnMetrics.map((metric, index) => (
                <tr key={metric.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {metric.column}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {metric.method.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900 dark:text-white">
                        {metric.value.toFixed(3)}
                      </span>
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${metric.isDrifted ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                    {metric.threshold.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDriftColor(metric.isDrifted)}`}>
                      {metric.isDrifted ? 'DRIFTED' : 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Test Results
        </h2>
        <div className="space-y-3">
          {processedData.testResults.map((test, index) => (
            <div key={`${test.id}-${index}`} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {test.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {test.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Summary Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {processedData.testResults.filter(t => t.status === 'SUCCESS').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Passed Tests
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {processedData.testResults.filter(t => t.status === 'FAIL').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Failed Tests
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {processedData.columnMetrics.filter(m => m.isDrifted).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Drifted Columns
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {processedData.columnMetrics.filter(m => !m.isDrifted).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Stable Columns
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}