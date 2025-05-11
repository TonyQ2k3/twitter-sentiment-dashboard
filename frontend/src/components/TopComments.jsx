export default function TopComments({ comments }) {
  return (
    <div className="result-card h-full">
      <h3 className="text-md font-semibold mb-2">Top Comments</h3>
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
        {comments.length === 0 ? (
          <p>No comments found.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="p-4 bg-white rounded-xl shadow">
              <p className="text-sm italic text-gray-600 mb-1">"{comment.text}"</p>
              <div className="text-xs text-gray-500">
                <span>By {comment.author}</span> | <span>{comment.score} upvotes</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
