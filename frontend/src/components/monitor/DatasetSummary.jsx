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


export default function DatasetSummary({ reportArray }) {
  const reports = reportArray || [];
  const [selectedReportIndex, setSelectedReportIndex] = useState(0)
  
  // Process the current report data
  const currentReport = reportArray?.[selectedReportIndex]
  
  const processedData = useMemo(() => {
    if (!currentReport) return null
    
    // Extract basic dataset info
    const getMetricValue = (metricId) => {
      const metric = currentReport.metrics?.find(m => m.metric_id.includes(metricId))
      return metric?.value || 0
    }
    
    const rowCount = getMetricValue('RowCount()')
    const columnCount = getMetricValue('ColumnCount()')
    const numericalCols = getMetricValue('ColumnCount(column_type=ColumnType.Numerical)')
    const categoricalCols = getMetricValue('ColumnCount(column_type=ColumnType.Categorical)')
    const textCols = getMetricValue('ColumnCount(column_type=ColumnType.Text)')
    const datetimeCols = getMetricValue('ColumnCount(column_type=ColumnType.Datetime)')
    
    // Data quality metrics
    const duplicatedRows = getMetricValue('DuplicatedRowCount()')
    const duplicatedColumns = getMetricValue('DuplicatedColumnsCount()')
    const almostDuplicatedColumns = getMetricValue('AlmostDuplicatedColumnsCount()')
    const almostConstantColumns = getMetricValue('AlmostConstantColumnsCount()')
    const emptyRows = getMetricValue('EmptyRowsCount()')
    const emptyColumns = getMetricValue('EmptyColumnsCount()')
    const constantColumns = getMetricValue('ConstantColumnsCount()')
    const datasetMissingValues = getMetricValue('DatasetMissingValueCount()')
    
    // Column statistics (for numerical columns)
    const columnStats = currentReport.metrics?.filter(m => 
      m.metric_id.includes('MinValue') || 
      m.metric_id.includes('MaxValue') || 
      m.metric_id.includes('MeanValue') || 
      m.metric_id.includes('StdValue') || 
      m.metric_id.includes('QuantileValue')
    ).map(metric => {
      const columnMatch = metric.metric_id.match(/column=([^,)]+)/)
      const typeMatch = metric.metric_id.match(/(Min|Max|Mean|Std|Quantile)Value/)
      const quantileMatch = metric.metric_id.match(/quantile=([^)]+)/)
      
      return {
        column: columnMatch?.[1] || 'Unknown',
        type: typeMatch?.[1] || 'Unknown',
        quantile: quantileMatch?.[1] || null,
        value: metric.value
      }
    }) || []
    
    // Group column stats by column
    const groupedStats = columnStats.reduce((acc, stat) => {
      if (!acc[stat.column]) acc[stat.column] = {}
      
      if (stat.type === 'Quantile') {
        if (!acc[stat.column].quantiles) acc[stat.column].quantiles = {}
        acc[stat.column].quantiles[stat.quantile] = stat.value
      } else {
        acc[stat.column][stat.type.toLowerCase()] = stat.value
      }
      
      return acc
    }, {})
    
    // Unique value counts for categorical columns
    const uniqueValueCounts = currentReport.metrics?.filter(m => 
      m.metric_id.includes('UniqueValueCount')
    ).map(metric => {
      const columnMatch = metric.metric_id.match(/column=([^)]+)/)
      return {
        column: columnMatch?.[1] || 'Unknown',
        counts: metric.value.counts || {},
        shares: metric.value.shares || {}
      }
    }) || []
    
    // Test results
    const testResults = currentReport.tests?.map(test => ({
      name: test.name,
      description: test.description,
      status: test.status
    })) || []
    
    return {
      basic: {
        rowCount,
        columnCount,
        columnTypes: {
          numerical: numericalCols,
          categorical: categoricalCols,
          text: textCols,
          datetime: datetimeCols
        }
      },
      quality: {
        duplicatedRows,
        duplicatedColumns,
        almostDuplicatedColumns,
        almostConstantColumns,
        emptyRows,
        emptyColumns,
        constantColumns,
        missingValues: datasetMissingValues
      },
      columnStats: groupedStats,
      uniqueValues: uniqueValueCounts,
      testResults,
      timestamp: currentReport.timestamp
    }
  }, [currentReport])
  
  const getStatusColor = (status) => {
    return status === 'SUCCESS' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }
  
  const formatNumber = (num) => {
    if (typeof num === 'object' && num !== null) {
      return num.count || 0
    }
    return typeof num === 'number' ? num.toLocaleString() : 0
  }
  
  const formatPercentage = (num) => {
    return `${(num * 100).toFixed(1)}%`
  }
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }
  
  if (!reportArray || reportArray.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No dataset reports available
      </div>
    )
  }
  
  if (!processedData) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading dataset summary...
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

      {/* Dataset Overview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Dataset Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Rows
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(processedData.basic.rowCount)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Columns
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(processedData.basic.columnCount)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Numerical
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatNumber(processedData.basic.columnTypes.numerical)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Categorical
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {formatNumber(processedData.basic.columnTypes.categorical)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Text
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatNumber(processedData.basic.columnTypes.text)}
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality Metrics */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Data Quality Assessment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Duplicated Rows
            </div>
            <div className={`text-2xl font-bold mt-1 ${formatNumber(processedData.quality.duplicatedRows) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatNumber(processedData.quality.duplicatedRows)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {((formatNumber(processedData.quality.duplicatedRows) / processedData.basic.rowCount) * 100).toFixed(1)}% of total
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Missing Values
            </div>
            <div className={`text-2xl font-bold mt-1 ${formatNumber(processedData.quality.missingValues) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatNumber(processedData.quality.missingValues)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {typeof processedData.quality.missingValues === 'object' ? formatPercentage(processedData.quality.missingValues.share || 0) : '0.0%'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Empty Rows
            </div>
            <div className={`text-2xl font-bold mt-1 ${formatNumber(processedData.quality.emptyRows) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatNumber(processedData.quality.emptyRows)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Constant Columns
            </div>
            <div className={`text-2xl font-bold mt-1 ${formatNumber(processedData.quality.constantColumns) > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatNumber(processedData.quality.constantColumns)}
            </div>
          </div>
        </div>
      </div>

      {/* Column Statistics */}
      {Object.keys(processedData.columnStats).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Numerical Column Statistics
          </h2>
          <div className="space-y-4">
            {Object.entries(processedData.columnStats).map(([columnName, stats]) => (
              <div key={columnName} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Column: {columnName}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Min</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {stats.min?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Max</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {stats.max?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Mean</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {stats.mean?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Std Dev</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {stats.std?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Median (Q2)</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {stats.quantiles?.['0.5'] || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">IQR</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {stats.quantiles?.['0.25'] && stats.quantiles?.['0.75'] 
                        ? (stats.quantiles['0.75'] - stats.quantiles['0.25']).toFixed(2)
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
                {stats.quantiles && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Distribution Quartiles</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-white">Q1</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 relative">
                        <div className="absolute left-0 w-1 h-4 bg-blue-500 rounded transform -translate-y-1"></div>
                        <div className="absolute left-1/2 w-1 h-4 bg-green-500 rounded transform -translate-x-1/2 -translate-y-1"></div>
                        <div className="absolute right-0 w-1 h-4 bg-blue-500 rounded transform -translate-y-1"></div>
                      </div>
                      <div className="text-xs text-white">Q3</div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>{stats.quantiles['0.25']}</span>
                      <span>{stats.quantiles['0.5']}</span>
                      <span>{stats.quantiles['0.75']}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorical Column Analysis */}
      {processedData.uniqueValues.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Categorical Column Analysis
          </h2>
          <div className="space-y-4">
            {processedData.uniqueValues.map((uniqueData, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Column: {uniqueData.column}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(uniqueData.counts).map(([value, count]) => (
                    <div key={value} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Value: {value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Count: {count.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatPercentage(uniqueData.shares[value] || 0)}
                        </div>
                        <div className="w-16 bg-gray-200 dark:bg-gray-500 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(uniqueData.shares[value] || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Data Quality Tests
        </h2>
        <div className="space-y-3">
          {processedData.testResults.map((test, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
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
          Test Summary
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
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {processedData.testResults.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Tests
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {processedData.testResults.length > 0 ? 
                ((processedData.testResults.filter(t => t.status === 'SUCCESS').length / processedData.testResults.length) * 100).toFixed(0) + '%'
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Success Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}