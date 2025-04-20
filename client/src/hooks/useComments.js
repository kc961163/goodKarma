// src/hooks/useComments.js
import { useState, useEffect } from "react";
import { fetchWithAuth, fetchGetWithAuth } from "../security/fetchWithAuth";

export default function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch comments when component mounts or postId changes
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Fetch all comments for a post
  const fetchComments = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const data = await fetchGetWithAuth(
        `${apiUrl}/posts/${postId}/comments`
      );
      setComments(data);
      setCommentCount(data.length);
      setError(null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  // Add a new comment
  const addComment = async (content, parentId = null) => {
    if (!postId) return null;
    
    try {
      const newComment = await fetchWithAuth(
        `${apiUrl}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, parentId })
        }
      );
      
      const data = await newComment.json();
      
      if (parentId) {
        // This is a reply to an existing comment
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...(comment.replies || []), data] } 
              : comment
          )
        );
      } else {
        // This is a new top-level comment
        setComments(prevComments => [data, ...prevComments]);
      }
      
      setCommentCount(prev => prev + 1);
      return data;
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
      return null;
    }
  };

  // Update a comment
  const updateComment = async (commentId, content) => {
    try {
      const updatedComment = await fetchWithAuth(
        `${apiUrl}/comments/${commentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );
      
      const data = await updatedComment.json();
      
      // Update the comment in state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: data.content };
          }
          
          // Check if it's a reply
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, content: data.content } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          
          return comment;
        })
      );
      
      return data;
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment");
      return null;
    }
  };

  // Delete a comment
  const deleteComment = async (commentId, parentId = null) => {
    try {
      await fetchWithAuth(
        `${apiUrl}/comments/${commentId}`,
        { method: "DELETE" }
      );
      
      if (parentId) {
        // This is a reply
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === parentId) {
              return { 
                ...comment, 
                replies: comment.replies.filter(reply => reply.id !== commentId) 
              };
            }
            return comment;
          })
        );
      } else {
        // This is a top-level comment
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== commentId)
        );
      }
      
      setCommentCount(prev => prev - 1);
      return true;
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
      return false;
    }
  };

  return {
    comments,
    loading,
    error,
    commentCount,
    addComment,
    updateComment,
    deleteComment,
    refreshComments: fetchComments
  };
}