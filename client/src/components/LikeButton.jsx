// src/components/LikeButton.jsx
import React from "react";
import useLikes from "../hooks/useLikes";

const LikeButton = ({ postId }) => {
  const { likeCount, userLiked, loading, toggleLike } = useLikes(postId);

  return (
    <button 
      className={`like-button ${userLiked ? 'liked' : ''}`}
      onClick={toggleLike}
      disabled={loading}
    >
      {userLiked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'like' : 'likes'}
    </button>
  );
};

export default LikeButton;