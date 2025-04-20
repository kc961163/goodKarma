// src/components/CommentSection.jsx
import React from 'react';
import CommentList from './CommentList';
import CommentButton from './CommentButton';
import '../style/comments.css';

/**
 * A unified comment section component that handles both list and detail views
 * @param {string} postId - The ID of the post
 * @param {string} postOwnerId - The ID of the post owner (needed for permissions)
 * @param {string} view - Either 'list' or 'detail'
 */
const CommentSection = ({ 
  postId, 
  postOwnerId, 
  view = 'list' // 'list' or 'detail'
}) => {
  return (
    <div className="comments-section">
      {view === 'detail' ? (
        <CommentList postId={postId} postOwnerId={postOwnerId} />
      ) : (
        <CommentButton postId={postId} />
      )}
    </div>
  );
};

export default CommentSection;