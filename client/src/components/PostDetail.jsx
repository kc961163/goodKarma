// src/components/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import { extractDeedMetadata, getCleanContent, getFullDeedInfo } from "../utils/deedUtils";
import LikeButton from "./LikeButton";
import CommentSection from './CommentSection';

import "../style/postList.css";
import "../style/goodDeeds.css";

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/posts/${postId}`
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
      
      <div className="social-actions detail">
        <span className="action-placeholder">
          <LikeButton postId={post.id} />
        </span>
        {/* Remove CommentList and use CommentSection instead */}
      </div>

      {/* Add CommentSection after social-actions */}
      <CommentSection 
        postId={post.id} 
        postOwnerId={post.userId} 
        view="detail" 
      />
      
      <div className="post-actions">
        <Link to="/app/posts" className="action-link back">
          Back to Posts
        </Link>
        
        <Link to={`/app/posts/${postId}/edit`} className="action-link edit">
          Edit Post
        </Link>
      </div>
    </div>
  );
}