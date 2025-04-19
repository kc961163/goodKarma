// /src/components/PostDetail.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

import "../style/postList.css";

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

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      
      <div className="post-meta-detail">
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