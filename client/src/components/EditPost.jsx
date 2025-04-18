// /src/components/EditPost.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import usePostsCrud from "../hooks/usePostsCrud";
import "../style/postForm.css"; // We'll create this shared CSS file

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { updatePost } = usePostsCrud();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  // Fetch the post data on component mount
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/posts/${postId}`
        );
        setTitle(data.title);
        setContent(data.content || "");
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title) return setError("Title is required.");

    try {
      await updatePost(postId, title, content);
      // Redirect back to the post detail page
      navigate(`/app/posts/${postId}`);
    } catch (error) {
      setError("Failed to update post. Please try again.");
    }
  }

  if (loading) {
    return <div className="loading-container">Loading post data...</div>;
  }

  return (
    <div className="post-form-container">
      <h2>Edit Post</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="post-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="title">Title (required)</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content (optional)</label>
          <textarea
            id="content"
            name="content"
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save Changes</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate(`/app/posts/${postId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}