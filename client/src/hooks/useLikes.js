// src/hooks/useLikes.js
import { useState, useEffect } from "react";
import { fetchWithAuth, fetchGetWithAuth } from "../security/fetchWithAuth";

export default function useLikes(postId) {
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch like data when component mounts or postId changes
  useEffect(() => {
    fetchLikeData();
  }, [postId]);

  // Fetch likes count and user's like status
  const fetchLikeData = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const data = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/likes`
      );
      setLikeCount(data.count);
      setUserLiked(data.userLiked);
      setError(null);
    } catch (err) {
      console.error("Error fetching likes:", err);
      setError("Failed to load likes data");
    } finally {
      setLoading(false);
    }
  };

  // Toggle like status
  const toggleLike = async () => {
    if (!postId || loading) return;
    
    try {
      if (userLiked) {
        // Unlike
        await fetchWithAuth(`${process.env.REACT_APP_API_URL}/posts/${postId}/like`, {
          method: "DELETE"
        });
        setLikeCount(prev => Math.max(0, prev - 1));
        setUserLiked(false);
      } else {
        // Like
        await fetchWithAuth(`${process.env.REACT_APP_API_URL}/posts/${postId}/like`, {
          method: "POST"
        });
        setLikeCount(prev => prev + 1);
        setUserLiked(true);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(userLiked ? "Failed to unlike post" : "Failed to like post");
      // Refresh data to ensure UI is in sync with server
      fetchLikeData();
    }
  };

  return {
    likeCount,
    userLiked,
    loading,
    error,
    toggleLike,
    refreshLikes: fetchLikeData
  };
}