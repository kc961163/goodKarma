// /src/components/Posts.jsx

import "../style/postList.css";
import { useState } from "react";
import usePostsCrud from "../hooks/usePostsCrud";

export default function Posts() {
  // De-structure the hook
  const {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
  } = usePostsCrud();

  // States for creating a new post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  // States for editing an existing post
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // If you prefer, you can rely on createPost from the hook:
  async function handleCreate(e) {
    e.preventDefault();
    if (!postTitle) return alert("Title is required.");

    const newPost = await createPost(postTitle, postContent);
    if (newPost) {
      setPostTitle("");
      setPostContent("");
    }
  }

  // Initialize the edit form with existing post data
  function handleEditInit(post) {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content || "");
  }

  // Submit changes for a specific post
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editTitle) return alert("Title is required.");
    await updatePost(editingId, editTitle, editContent);
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  }

  // Cancel editing
  function handleEditCancel() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  }

  // Delete
  async function handleDelete(id) {
    await deletePost(id);
  }

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="post-list">
      <form onSubmit={handleCreate} className="post-form" autoComplete="off">
        <div>
          <label htmlFor="postTitle">Title (required)</label>
          <input
            type="text"
            id="postTitle"
            name="postTitle"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="postContent">Content (optional)</label>
          <textarea
            id="postContent"
            name="postContent"
            rows="3"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>

        <button type="submit">+ Add Post</button>
      </form>

      <ul className="list">
        {posts.map((post) => {
          // If this is the post being edited, show the edit form
          if (editingId === post.id) {
            return (
              <li key={post.id} className="post-item">
                <form onSubmit={handleEditSubmit} className="edit-form">
                  <div>
                    <label>Title (required)</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Content (optional)</label>
                    <textarea
                      rows="3"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                  </div>
                  <div className="edit-buttons">
                    <button type="submit">Save</button>
                    <button type="button" onClick={handleEditCancel}>
                      Cancel
                    </button>
                  </div>
                </form>
              </li>
            );
          }

          // Otherwise, show the normal post display
          return (
            <li key={post.id} className="post-item">
              <span className="itemName">{post.title}</span>
              <span className="itemContent">
                {post.content ? <p>{post.content}</p> : <p>No content provided.</p>}
              </span>
              <div className="actions">
                <button onClick={() => handleEditInit(post)}>Edit</button>
                <button
                  aria-label={`Remove ${post.title}`}
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}