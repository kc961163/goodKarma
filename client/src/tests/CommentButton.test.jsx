import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CommentButton from '../components/CommentButton';
import { fetchGetWithAuth } from '../security/fetchWithAuth';

// Mock the fetchWithAuth module
jest.mock('../security/fetchWithAuth');

describe('CommentButton Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the environment variable
    process.env.REACT_APP_API_URL = 'http://test-api.com';
  });

  test('displays loading state initially', () => {
    // Mock the fetch function to delay resolution
    fetchGetWithAuth.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ count: 5 }), 1000);
    }));
    
    render(<CommentButton postId={1} />);
    
    // Check if loading indicator is shown
    expect(screen.getByText('...')).toBeInTheDocument();
    
    // Verify the API was called with correct URL
    expect(fetchGetWithAuth).toHaveBeenCalledWith('http://test-api.com/posts/1/comments/count');
  });

  test('displays zero comments when count is 0', async () => {
    // Mock successful API response with 0 comments
    fetchGetWithAuth.mockResolvedValue({ count: 0 });
    
    render(<CommentButton postId={1} />);
    
    // Wait for the component to update after API call resolves
    await waitFor(() => {
      expect(screen.getByText('0 comments')).toBeInTheDocument();
    });
  });

  test('displays singular text when count is 1', async () => {
    // Mock successful API response with 1 comment
    fetchGetWithAuth.mockResolvedValue({ count: 1 });
    
    render(<CommentButton postId={1} />);
    
    // Wait for the component to update after API call resolves
    await waitFor(() => {
      expect(screen.getByText('1 comment')).toBeInTheDocument();
    });
  });

  test('displays plural text when count is greater than 1', async () => {
    // Mock successful API response with multiple comments
    fetchGetWithAuth.mockResolvedValue({ count: 5 });
    
    render(<CommentButton postId={1} />);
    
    // Wait for the component to update after API call resolves
    await waitFor(() => {
      expect(screen.getByText('5 comments')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Prevent error from showing in test output
    fetchGetWithAuth.mockRejectedValue(new Error('API error'));
    
    render(<CommentButton postId={1} />);
    
    // Wait for the component to update after API call fails
    await waitFor(() => {
      // Should still render with 0 comments after error
      expect(screen.getByText('0 comments')).toBeInTheDocument();
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });

  test('does not fetch when postId is not provided', () => {
    render(<CommentButton />);
    
    // API should not be called when postId is missing
    expect(fetchGetWithAuth).not.toHaveBeenCalled();
    
    // Still shows the loading indicator
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  test('renders comment icon', async () => {
    fetchGetWithAuth.mockResolvedValue({ count: 3 });
    
    render(<CommentButton postId={1} />);
    
    // Check if comment icon is rendered
    const commentIcon = screen.getByText('💬');
    expect(commentIcon).toBeInTheDocument();
    expect(commentIcon.className).toBe('comment-icon');
  });
});