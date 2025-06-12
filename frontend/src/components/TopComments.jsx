export default function TopComments({ comments }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center dark:text-gray-200">
      <h3 className="text-md font-semibold mb-2">Top Comments</h3>
      <div className="overflow-y-auto pr-2 space-y-4">
        {comments.length === 0 ? (
          <p className="dark:text-gray-300">No comments found.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
              <p className="text-sm italic text-gray-600 dark:text-gray-300 mb-1">"{comment.text}"</p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span>By {comment.author}</span> | <span>{comment.score} upvotes</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}