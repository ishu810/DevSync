import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";

const CommentSection = ({ complaintId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadComments = useCallback(async () => {
    if (!complaintId) return;
    
    try {
      setError(null);
      const res = await axiosInstance.get(`/api/comments/${complaintId}`);
      setComments(res.data);
    } catch (err) {
      setError("Failed to load comments");
      console.error(err);
    }
  }, [complaintId]);

  const addComment = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post(`/api/comments/${complaintId}`, { text });
      setText("");
      await loadComments();
    } catch (err) {
      setError("Failed to add comment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-green-200 font-poppins">
      <h2 className="text-xl font-semibold text-green-900 mb-4">Comments</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((c, idx) => (
            <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-black text-sm mb-1">{c.text}</p>
              <p className="text-green-700 text-xs">
                {c.user?.username || 'Anonymous'} • {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-black"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !loading) {
              e.preventDefault();
              addComment();
            }
          }}
        />
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-green-800 text-white hover:bg-green-600"
          }`}
          onClick={addComment}
          disabled={loading || !text.trim()}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;