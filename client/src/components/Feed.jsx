// src/components/Feed.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthUser } from "../security/AuthContext";
import useFeed from "../hooks/useFeed";
import "../style/postList.css"; // Reusing your existing CSS

export default function Feed() {
  const { feed, loading, paginationData, nextPage, prevPage } = useFeed();
  const { user } = useAuthUser();

  if (loading) return <p>Loading feed...</p>;

  return (
    <div className="post-list">
      <h1>Social Feed</h1>
      <p>Discover posts from the community</p>

      {feed.length === 0 ? (
        <div className="empty-state">
          <p>No posts to display. Be the first to create content!</p>
          <Link to="/app/posts" className="btn-primary">
            Create a Post
          </Link>
        </div>
      ) : (
        <>
          <ul className="list">
            {feed.map((post) => (
              <li key={post.id} className="post-item feed-item">
                {/* Link wraps the entire post item, making it clickable */}
                <Link to={`/app/feed/${post.id}`} className="post-link">
                  <div className="post-content">
                    <span className="itemName">{post.title}</span>
                    <span className="itemContent">
                      {post.content ? (
                        <p>{post.content.substring(0, 100)}
                          {post.content.length > 100 ? "..." : ""}
                        </p>
                      ) : (
                        <p className="no-content">No content provided.</p>
                      )}
                    </span>
                    
                    {/* Post metadata */}
                    <div className="post-meta">
                      <span className="author">
                        By: {post.user.name || post.user.email}
                      </span>
                      <span className="date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      
                      {/* Visual indicator for user's own posts */}
                      {post.user.id === user.id && (
                        <span className="own-post-indicator">Your post</span>
                      )}
                    </div>
                  </div>
                </Link>
                
                {/* Action buttons only for user's own posts */}
                {post.user.id === user.id && (
                  <div className="actions">
                    <Link to={`/app/posts/${post.id}`} className="action-btn view">
                      View
                    </Link>
                    <Link to={`/app/posts/${post.id}/edit`} className="action-btn edit">
                      Edit
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Pagination controls */}
          {paginationData.pages > 1 && (
            <div className="pagination">
              <button
                onClick={prevPage}
                disabled={paginationData.currentPage === 1}
                className="page-btn"
              >
                Previous
              </button>
              <span className="page-info">
                Page {paginationData.currentPage} of {paginationData.pages}
              </span>
              <button
                onClick={nextPage}
                disabled={paginationData.currentPage === paginationData.pages}
                className="page-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}