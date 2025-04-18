// src/hooks/useFeed.js
import { useState, useEffect } from "react";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

export default function useFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    total: 0,
    pages: 0,
    limit: 10
  });

  // Fetch feed on mount
  useEffect(() => {
    fetchFeedPosts();
  }, []);

  // Fetch all posts for the feed
  async function fetchFeedPosts(page = 1) {
    setLoading(true);
    try {
      const data = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/feed?page=${page}&limit=${paginationData.limit}`
      );
      
      // If the response includes pagination information
      if (data.posts && data.pagination) {
        setFeed(data.posts);
        setPaginationData(data.pagination);
      } else {
        // Fallback if the API doesn't return the expected structure
        setFeed(data);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  }

  // Navigation functions
  function nextPage() {
    if (paginationData.currentPage < paginationData.pages) {
      fetchFeedPosts(paginationData.currentPage + 1);
    }
  }

  function prevPage() {
    if (paginationData.currentPage > 1) {
      fetchFeedPosts(paginationData.currentPage - 1);
    }
  }

  return {
    feed,
    loading,
    paginationData,
    fetchFeedPosts,
    nextPage,
    prevPage
  };
}