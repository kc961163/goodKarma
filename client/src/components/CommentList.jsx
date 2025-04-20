// src/components/CommentList.jsx
import React, { useState } from "react";
import Comment from "./Comment";
import useComments from "../hooks/useComments";
import "../style/comments.css";

const CommentList = ({ postId, postOwnerId }) => {
  const { 
    comments, 
    loading, 
    error, 
    addComment, 
    updateComment, 
    deleteComment 
  } = useComments(postId);
  
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      await addComment(newComment);
      setNewComment("");
    }
  };

  const handleReply = async (parentId, content) => {
    await addComment(content, parentId);
  };

  const handleEdit = async (commentId, content) => {
    await updateComment(commentId, content);
  };

  const handleDelete = async (commentId, parentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(commentId, parentId);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading comments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="comments-container">
      <h3>Comments</h3>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit" className="btn-primary">Post Comment</button>
      </form>
      
      {comments.length === 0 ? (
        <p className="no-comments">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              postOwnerId={postOwnerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;