import { useState, useMemo } from 'react';


export default function Alerts({ reportArray }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  
  // Process and flatten all alerts from all reports
  const allAlerts = useMemo(() => {
    if (!reportArray || reportArray.length === 0) return []
    
    return reportArray
      .flat()
      .sort((a, b) => {
        const dateA = new Date(a.timestamp)
        const dateB = new Date(b.timestamp)
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      })
  }, [reportArray, sortOrder])
  
  // Get unique alert types for filter dropdown
  const alertTypes = useMemo(() => {
    const types = [...new Set(allAlerts.map(alert => alert.type))]
    return types.sort()
  }, [allAlerts])
  
  // Filter alerts based on search and filters
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      const matchesSearch = searchTerm === '' || 
        alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.test_case.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || alert.type === filterType
      const matchesStatus = filterStatus === 'all' || alert.status === filterStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [allAlerts, searchTerm, filterType, filterStatus])
  
  // Get alert statistics
  const alertStats = useMemo(() => {
    const total = allAlerts.length
    const failed = allAlerts.filter(alert => alert.status === 'FAIL').length
    const warning = allAlerts.filter(alert => alert.status === 'WARNING').length
    const success = allAlerts.filter(alert => alert.status === 'SUCCESS').length
    
    // Get alerts by type
    const byType = allAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {})
    
    // Get recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recent = allAlerts.filter(alert => new Date(alert.timestamp) > oneDayAgo).length
    
    return {
      total,
      failed,
      warning,
      success,
      byType,
      recent
    }
  }, [allAlerts])
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'FAIL':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'SUCCESS':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }
  
  const getAlertTypeColor = (type) => {
    const colors = {
      'Model Drift Detected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Data Drift Detected': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Performance Degradation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Data Quality Issue': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'System Alert': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  }
  
  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterStatus('all')
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-4 space-y-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Monitoring Alerts
          </h1>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {alertStats.failed} Failed
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {alertStats.warning} Warning
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {alertStats.recent} Recent (24h)
            </span>
          </div>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Alert Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Alerts
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {alertStats.total}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Failed
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {alertStats.failed}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Warnings
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {alertStats.warning}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Success
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {alertStats.success}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Recent (24h)
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {alertStats.recent}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Success Rate
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {alertStats.total > 0 ? Math.round((alertStats.success / alertStats.total) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Alerts
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by type, test case, or description..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Type Filter */}
          <div className="w-full lg:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alert Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {alertTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="FAIL">Failed</option>
              <option value="WARNING">Warning</option>
              <option value="SUCCESS">Success</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div className="w-full lg:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Alert List
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAlerts.length} of {allAlerts.length} alerts
          </div>
        </div>
        
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
              {allAlerts.length === 0 ? '📭' : '🔍'}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {allAlerts.length === 0 
                ? 'No alerts found. Your system is running smoothly!' 
                : 'No alerts match your current filters.'
              }
            </p>
            {allAlerts.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters to show all alerts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, index) => (
              <div
                key={alert._id?.$oid || index}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getStatusColor(alert.status)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                        {alert.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status).replace('border-', 'border-2 border-')}`}>
                        {alert.status}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {alert.test_case}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimestamp(alert.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Types Breakdown */}
      {Object.keys(alertStats.byType).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Alerts by Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(alertStats.byType).map(([type, count]) => (
              <div key={type} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium mb-2 ${getAlertTypeColor(type)}`}>
                      {type}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {((count / alertStats.total) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}