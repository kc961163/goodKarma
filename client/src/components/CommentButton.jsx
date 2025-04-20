// src/components/CommentButton.jsx
import React, { useState, useEffect } from "react";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

const CommentButton = ({ postId }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentCount = async () => {
      if (!postId) return;
      
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const data = await fetchGetWithAuth(`${apiUrl}/posts/${postId}/comments/count`);
        setCommentCount(data.count);
      } catch (err) {
        console.error("Error fetching comment count:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentCount();
  }, [postId]);

  return (
    <div className="comment-count">
      <span className="comment-icon">💬</span>
      {loading ? "..." : `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`}
    </div>
  );
};

export default CommentButton;