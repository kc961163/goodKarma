// /src/components/Posts.jsx

import "../style/postList.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import usePostsCrud from "../hooks/usePostsCrud";

export default function Posts() {
  // De-structure the hook
  const {
    posts,
    loading,
    createPost,
    deletePost,
  } = usePostsCrud();

  // States for creating a new post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  // Handle post creation
  async function handleCreate(e) {
    e.preventDefault();
    if (!postTitle) return alert("Title is required.");

    const newPost = await createPost(postTitle, postContent);
    if (newPost) {
      setPostTitle("");
      setPostContent("");
    }
  }

  // Handle post deletion
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
    }
  }

  if (loading) return <p>Loading your posts...</p>;

  return (
    <div className="post-list">
      <h1>My Posts</h1>
      <p>Manage your good deeds and activities</p>

      {/* Create Post Form */}
      <form onSubmit={handleCreate} className="post-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="postTitle">Title (required)</label>
          <input
            type="text"
            id="postTitle"
            name="postTitle"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="postContent">Content (optional)</label>
          <textarea
            id="postContent"
            name="postContent"
            rows="3"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary">+ Add Post</button>
      </form>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any posts yet. Share your first activity!</p>
        </div>
      ) : (
        <ul className="list">
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <div className="post-content">
                <span className="itemName">{post.title}</span>
                <span className="itemContent">
                  {post.content ? (
                    <p>
                      {post.content.substring(0, 100)}
                      {post.content.length > 100 ? "..." : ""}
                    </p>
                  ) : (
                    <p className="no-content">No content provided.</p>
                  )}
                </span>
              </div>
              
              {/* Post metadata */}
              <div className="post-meta">
                <span className="date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                {post.createdAt !== post.updatedAt && (
                  <span className="edited">
                    (Updated: {new Date(post.updatedAt).toLocaleDateString()})
                  </span>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="actions">
                <Link to={`/app/posts/${post.id}`} className="action-btn view">
                  View
                </Link>
                <Link to={`/app/posts/${post.id}/edit`} className="action-btn edit">
                  Edit
                </Link>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              </div>
              
              {/* Placeholder for future social features */}
              <div className="social-actions">
                <span className="action-placeholder">
                  0 likes
                </span>
                <span className="action-placeholder">
                  0 comments
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}