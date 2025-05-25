
export default function SentimentPieChart({ data }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="feedback-card">
            <h3 className="feedback-title">Total Feedback</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total}</p>
            <div className="mt-2 h-1 w-12 bg-indigo-500 rounded-full"></div>
          </div>
          <div className="feedback-card">
            <h3 className="feedback-title">Positive</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{((data.positive / data.total) * 100).toFixed(0)}%</p>
            <div className="mt-2 h-1 w-12 bg-green-500 rounded-full"></div>
          </div>
          <div className="feedback-card">
            <h3 className="feedback-title">Neutral</h3>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{((data.neutral / data.total) * 100).toFixed(0)}%</p>
            <div className="mt-2 h-1 w-12 bg-gray-500 rounded-full"></div>
          </div>
          <div className="feedback-card">
            <h3 className="feedback-title">Negative</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{((data.negative / data.total) * 100).toFixed(0)}%</p>
            <div className="mt-2 h-1 w-12 bg-red-500 rounded-full"></div>
          </div>
        </div>
    )
}