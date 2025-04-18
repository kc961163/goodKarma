// /src/components/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      <small>Created at: {new Date(post.createdAt).toLocaleString()}</small>
      <small> | Updated at: {new Date(post.updatedAt).toLocaleString()}</small>
    </div>
  );
}