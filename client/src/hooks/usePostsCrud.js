// /src/hooks/usePostsCrud.js

import { useState, useEffect } from "react";
import { fetchWithAuth, fetchGetWithAuth } from "../security/fetchWithAuth";

/**
 * This hook manages CRUD operations for posts.
 * It returns an object containing:
 *   1) posts array
 *   2) loading state
 *   3) fetchAllPosts
 *   4) createPost
 *   5) updatePost
 *   6) deletePost
 */
export default function usePostsCrud() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all posts on mount
  useEffect(() => {
    fetchAllPosts();
  }, []);

  // READ all posts
  async function fetchAllPosts() {
    setLoading(true);
    try {
      const postsData = await fetchGetWithAuth(`${process.env.REACT_APP_API_URL}/posts`);
      setPosts(postsData);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }

  // CREATE a post
  async function createPost(title, content) {
    try {
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error(`Create post failed with status: ${res.status}`);
      }

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      return null;
    }
  }

  // UPDATE a post
  async function updatePost(id, title, content) {
    try {
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error(`Update post failed with status: ${res.status}`);
      }

      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));
      return updatedPost;
    } catch (error) {
      console.error("Error updating post:", error);
      return null;
    }
  }

  // DELETE a post
  async function deletePost(id) {
    try {
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Delete post failed with status: ${res.status}`);
      }

      const deleted = await res.json();
      setPosts((prev) => prev.filter((p) => p.id !== id));
      return deleted;
    } catch (error) {
      console.error("Error deleting post:", error);
      return null;
    }
  }

  return {
    posts,       // The post array
    loading,     // Loading indicator
    fetchAllPosts,
    createPost,
    updatePost,
    deletePost,
  };
}