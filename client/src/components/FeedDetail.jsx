// src/components/FeedDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthUser } from "../security/AuthContext";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import { extractDeedMetadata, getCleanContent, getFullDeedInfo } from "../utils/deedUtils";

import "../style/postList.css";
import "../style/goodDeeds.css";

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
    return <div className="loading-container">Loading post details...</div>;
  }

  if (!post) {
    return <div className="error-message">Post not found or an error occurred.</div>;
  }

  // Get deed information if available
  const metadata = extractDeedMetadata(post.content);
  const deedInfo = metadata ? getFullDeedInfo(metadata) : null;
  const cleanContent = getCleanContent(post.content);
  const isOwnPost = post.user.id === user.id;

  return (
    <div className="post-detail">
      {/* <h2>{post.title}</h2> */}
      
      <div className="post-meta-detail">
        {deedInfo && (
          <div className="deed-details">
            <div className="deed-badge" style={{ backgroundColor: deedInfo.color }}>
              <span className="deed-icon">{deedInfo.icon}</span>
              <span className="deed-name">{deedInfo.name}</span>
            </div>
            
            <div className="deed-options">
              {deedInfo.primaryName && deedInfo.primaryLabel && (
                <span className="deed-option">
                  <strong>{deedInfo.primaryName}:</strong> {deedInfo.primaryLabel}
                </span>
              )}
              
              {deedInfo.secondaryName && deedInfo.secondaryLabel && (
                <span className="deed-option">
                  <strong>{deedInfo.secondaryName}:</strong> {deedInfo.secondaryLabel}
                </span>
              )}
            </div>
          </div>
        )}
        
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
        {cleanContent ? (
          <p>{cleanContent}</p>
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