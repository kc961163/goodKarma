// src/components/FeedDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthUser } from "../security/AuthContext";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

import "../style/postList.css"; // Reusing your existing CSS

export default function FeedDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthUser();

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/feed/${postId}`
        );
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div>Loading post details...</div>;
  }

  if (!post) {
    return <div>Post not found or an error occurred.</div>;
  }

  const isOwnPost = post.user.id === user.id;

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      
      <div className="post-meta-detail">
        <span className="author">
          By: {post.user.name || post.user.email}
        </span>
        <span className="date">
          Posted: {new Date(post.createdAt).toLocaleDateString()}
        </span>
        {post.createdAt !== post.updatedAt && (
          <span className="edited">
            (Updated: {new Date(post.updatedAt).toLocaleDateString()})
          </span>
        )}
      </div>
      
      <div className="post-content-detail">
        {post.content ? (
          <p>{post.content}</p>
        ) : (
          <p className="no-content">No content provided.</p>
        )}
      </div>
      
      {/* Placeholder for future social features */}
      <div className="social-actions detail">
        <span className="action-placeholder">
          0 likes
        </span>
        <span className="action-placeholder">
          0 comments
        </span>
      </div>
      
      {/* Comments section placeholder */}
      <div className="comments-section">
        <h3>Comments</h3>
        <p className="placeholder-text">Comments will appear here in the future.</p>
      </div>
      
      <div className="post-actions">
        <Link to="/app/feed" className="action-link back">
          Back to Feed
        </Link>
        
        {isOwnPost && (
          <Link to={`/app/posts/${post.id}/edit`} className="action-link edit">
            Edit Post
          </Link>
        )}
      </div>
    </div>
  );
}