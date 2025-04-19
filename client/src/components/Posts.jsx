// src/components/Posts.jsx
import "../style/postList.css";
import "../style/goodDeeds.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import usePostsCrud from "../hooks/usePostsCrud";
import { GOOD_DEEDS, GOOD_DEEDS_ARRAY } from "../config/goodDeeds";
import { getDeedInfo, getCleanContent } from "../utils/deedUtils";

export default function Posts() {
  const {
    posts,
    loading,
    createPost,
    deletePost,
  } = usePostsCrud();

  // States for creating a new post
  const [selectedDeedType, setSelectedDeedType] = useState("");
  const [primaryOption, setPrimaryOption] = useState("");
  const [secondaryOption, setSecondaryOption] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [error, setError] = useState("");

  // Get the selected deed object
  const selectedDeed = selectedDeedType ? GOOD_DEEDS[selectedDeedType] : null;

  // Handle post creation
  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    
    if (!selectedDeedType) {
      setError("Please select a good deed type");
      return;
    }
    
    if (!primaryOption && selectedDeed?.options.primary) {
      setError(`Please select a ${selectedDeed.options.primary.label}`);
      return;
    }
    
    if (!secondaryOption && selectedDeed?.options.secondary) {
      setError(`Please select a ${selectedDeed.options.secondary.label}`);
      return;
    }

    // Automatically generate title from deed name
    const deedTitle = selectedDeed.name;

    // Generate content based on selections
    let generatedContent = "";
    if (selectedDeed) {
      const primaryLabel = selectedDeed.options.primary.values.find(v => v.value === primaryOption)?.label || primaryOption;
      const secondaryLabel = selectedDeed.options.secondary.values.find(v => v.value === secondaryOption)?.label || secondaryOption;
      
      // Add JSON metadata at beginning of content for parsing later
      const metadata = {
        deedType: selectedDeedType,
        primaryOption,
        secondaryOption,
        additionalNotes
      };
      
      // Combine metadata with generated content
      const contentText = selectedDeed.generateContent(primaryLabel, secondaryLabel, additionalNotes);
      generatedContent = `<!-- DEED_METADATA:${JSON.stringify(metadata)} -->\n${contentText}`;
    }

    // Create the post with the automatically generated title
    const newPost = await createPost(deedTitle, generatedContent);

    if (newPost) {
      // Reset form
      setSelectedDeedType("");
      setPrimaryOption("");
      setSecondaryOption("");
      setAdditionalNotes("");
    }
  }

  // Handle post deletion
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
    }
  }

  if (loading) return <div className="loading-container">Loading your posts...</div>;

  return (
    <div className="post-list">
      <h1>My Posts</h1>
      <p>Share your good deeds and build good karma</p>

      {/* Create Post Form */}
      <form onSubmit={handleCreate} className="post-form" autoComplete="off">
        {error && <div className="error-message">{error}</div>}
        
        {/* Good Deed Type Selection */}
        <div className="form-group">
          <label>What good deed did you do?</label>
          <div className="deed-type-buttons">
            {GOOD_DEEDS_ARRAY.map((deed) => {
              // Find the key for this deed object
              const deedKey = Object.keys(GOOD_DEEDS).find(key => GOOD_DEEDS[key] === deed);
              return (
                <button
                  key={deed.name}
                  type="button"
                  className={`deed-type-button ${selectedDeedType === deedKey ? 'selected' : ''}`}
                  style={{
                    backgroundColor: selectedDeedType === deedKey ? deed.color : 'transparent',
                    color: selectedDeedType === deedKey ? 'white' : '#333',
                    borderColor: deed.color
                  }}
                  onClick={() => {
                    setSelectedDeedType(deedKey);
                    setPrimaryOption("");
                    setSecondaryOption("");
                  }}
                >
                  {deed.icon} {deed.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Option Selection (conditionally rendered) */}
        {selectedDeed && selectedDeed.options.primary && (
          <div className="form-group">
            <label>{selectedDeed.options.primary.label}</label>
            <div className="option-buttons">
              {selectedDeed.options.primary.values.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-button ${primaryOption === option.value ? 'selected' : ''}`}
                  onClick={() => setPrimaryOption(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Option Selection (conditionally rendered) */}
        {selectedDeed && selectedDeed.options.secondary && (
          <div className="form-group">
            <label>{selectedDeed.options.secondary.label}</label>
            <div className="option-buttons">
              {selectedDeed.options.secondary.values.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-button ${secondaryOption === option.value ? 'selected' : ''}`}
                  onClick={() => setSecondaryOption(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div className="form-group">
          <label htmlFor="additionalNotes">Additional Notes (optional)</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows="3"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any additional details you'd like to share?"
          />
        </div>

        {/* Content Preview */}
        {selectedDeed && primaryOption && secondaryOption && (
          <div className="content-preview">
            <label>Content Preview:</label>
            <p>
              {selectedDeed.generateContent(
                selectedDeed.options.primary.values.find(v => v.value === primaryOption)?.label,
                selectedDeed.options.secondary.values.find(v => v.value === secondaryOption)?.label,
                additionalNotes
              )}
            </p>
          </div>
        )}

        <button type="submit" className="btn-primary">Share Good Deed</button>
      </form>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't shared any good deeds yet. Start building your karma!</p>
        </div>
      ) : (
        <ul className="list">
          {posts.map((post) => {
            const deedInfo = getDeedInfo(post);
            const cleanContent = getCleanContent(post.content);
            
            return (
              <li key={post.id} className="post-item">
                <div className="post-content">
                  {deedInfo && (
                    <div className="deed-badge" style={{ backgroundColor: deedInfo.color }}>
                      <span className="deed-icon">{deedInfo.icon}</span>
                      <span className="deed-name">{deedInfo.name}</span>
                    </div>
                  )}
                  <span className="itemContent">
                    {cleanContent ? (
                      <p>
                        {cleanContent.substring(0, 100)}
                        {cleanContent.length > 100 ? "..." : ""}
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
                
                {/* Action buttons - Include Edit */}
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
            );
          })}
        </ul>
      )}
    </div>
  );
}