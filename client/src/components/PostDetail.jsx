// /src/components/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import { useNavigate } from "react-router-dom";

import "../style/postList.css";

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    return <div>Loading post details...</div>;
  }

  if (!post) {
    return <div>Post not found or an error occurred.</div>;
  }

  // Now we clearly show the title and optional content
  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      {post.content ? (
        <p>{post.content}</p>
      ) : (
        <p style={{ fontStyle: "italic" }}>No content provided.</p>
      )}
      
      {/* Example: If you want to show timestamps */}
      <div className="post-meta">
        <small>Created at: {new Date(post.createdAt).toLocaleString()}</small>
        <small> | Updated at: {new Date(post.updatedAt).toLocaleString()}</small>
      </div>
      
      {/* Add action buttons */}
      <div className="post-actions">
        <button 
          className="btn-primary"
          onClick={() => navigate(`/app/posts/${postId}/edit`)}
        >
          Edit Post
        </button>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/app/posts')}
        >
          Back to Posts
        </button>
      </div>
    </div>
  );
}