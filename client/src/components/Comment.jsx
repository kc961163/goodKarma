// src/components/Comment.jsx
import React, { useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import "../style/comments.css";

const Comment = ({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  isReply = false,
  postOwnerId = null
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const { user } = useAuthUser();

  // Check if user can edit this comment (only comment author)
  const canEdit = user?.id === comment.user.id;

  // Check if user can delete this comment (comment author or post owner)
  const canDelete = user?.id === comment.user.id || user?.id === postOwnerId;

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setIsReplying(false);
      setReplyContent("");
    }
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className={`comment ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <span className="comment-author">{comment.user.name || comment.user.email}</span>
        <span className="comment-date">{getFormattedDate(comment.createdAt)}</span>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="comment-form edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Save</button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-content">{comment.content}</div>
      )}
      
      <div className="comment-actions">
        {!isReply && (
          <button 
            type="button" 
            className="comment-action reply-btn"
            onClick={() => setIsReplying(!isReplying)}
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        )}
        
        {canEdit && (
          <button 
            type="button" 
            className="comment-action edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
        
        {canDelete && (
          <button 
            type="button" 
            className="comment-action delete-btn"
            onClick={() => onDelete(comment.id, isReply ? comment.parentId : null)}
          >
            Delete
          </button>
        )}
      </div>
      
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="comment-form reply">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            required
          />
          <button type="submit" className="btn-primary">Post Reply</button>
        </form>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply={true}
              postOwnerId={postOwnerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;