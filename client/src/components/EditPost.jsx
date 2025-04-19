// src/components/EditPost.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import usePostsCrud from "../hooks/usePostsCrud";
import { GOOD_DEEDS, GOOD_DEEDS_ARRAY } from "../config/goodDeeds";
import { extractDeedMetadata, getCleanContent } from "../utils/deedUtils";
import "../style/postForm.css";
import "../style/goodDeeds.css";

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { updatePost } = usePostsCrud();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [error, setError] = useState(null);
  
  // Good deed selection states
  const [selectedDeedType, setSelectedDeedType] = useState("");
  const [primaryOption, setPrimaryOption] = useState("");
  const [secondaryOption, setSecondaryOption] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Get the selected deed object
  const selectedDeed = selectedDeedType ? GOOD_DEEDS[selectedDeedType] : null;

  // Fetch the post data on component mount
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/posts/${postId}`
        );
        setTitle(data.title);
        setOriginalContent(data.content || "");
        
        // Process content to extract metadata
        const metadata = extractDeedMetadata(data.content);
        if (metadata) {
          setSelectedDeedType(metadata.deedType || "");
          setPrimaryOption(metadata.primaryOption || "");
          setSecondaryOption(metadata.secondaryOption || "");
          setAdditionalNotes(metadata.additionalNotes || "");
        }
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
    setError(null);
    
    // Validate deed selections
    if (!primaryOption && selectedDeed?.options.primary) {
      setError(`Please select a ${selectedDeed.options.primary.label}`);
      return;
    }
    
    if (!secondaryOption && selectedDeed?.options.secondary) {
      setError(`Please select a ${selectedDeed.options.secondary.label}`);
      return;
    }

    // Generate content based on selections
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
    const updatedContent = `<!-- DEED_METADATA:${JSON.stringify(metadata)} -->\n${contentText}`;

    try {
      await updatePost(postId, title, updatedContent);
      
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
      <h2>Edit Good Deed</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="post-form" autoComplete="off">
        {/* Title (read-only) */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            disabled
            className="read-only"
          />
          <small className="help-text">Title is automatically generated based on the deed type</small>
        </div>

        {/* Good Deed Type Selection (read-only to maintain comment consistency) */}
        <div className="form-group">
          <label>Good Deed Type (cannot be changed)</label>
          <div className="deed-type-buttons">
            {GOOD_DEEDS_ARRAY.map((deed) => {
              // Find the key for this deed object
              const deedKey = Object.keys(GOOD_DEEDS).find(key => GOOD_DEEDS[key] === deed);
              const isSelected = selectedDeedType === deedKey;
              return (
                <button
                  key={deed.name}
                  type="button"
                  className={`deed-type-button ${isSelected ? 'selected' : ''}`}
                  style={{
                    backgroundColor: isSelected ? deed.color : 'transparent',
                    color: isSelected ? 'white' : '#333',
                    borderColor: deed.color,
                    opacity: !isSelected ? '0.5' : '1',
                    cursor: 'not-allowed'
                  }}
                  disabled={!isSelected}
                >
                  {deed.icon} {deed.name}
                </button>
              );
            })}
          </div>
          <small className="help-text">Deed type cannot be changed after creation to maintain comment consistency</small>
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