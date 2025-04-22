import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Feed from '../components/Feed';
import useFeed from '../hooks/useFeed';
import { useAuthUser } from '../security/AuthContext';
import { getDeedInfo, getCleanContent } from '../utils/deedUtils';

// Mock the hooks and utilities
jest.mock('../hooks/useFeed');
jest.mock('../security/AuthContext');
jest.mock('../utils/deedUtils', () => ({
  getDeedInfo: jest.fn(),
  getCleanContent: jest.fn()
}));
jest.mock('../components/LikeButton', () => {
  return function MockLikeButton() {
    return <button className="like-button">🤍 0 likes</button>;
  };
});
jest.mock('../components/CommentButton', () => {
  return function MockCommentButton() {
    return <div className="comment-count"><span className="comment-icon">💬</span>...</div>;
  };
});

// Sample feed data
const mockFeed = [
  {
    id: 1,
    title: 'Meditation',
    content: '<!-- DEED_METADATA:{"deedType":"meditation"} -->Practiced mindfulness meditation for 15 minutes.',
    createdAt: '2025-04-20T12:00:00.000Z',
    updatedAt: '2025-04-20T12:00:00.000Z',
    user: { id: 1, name: 'John Doe', email: 'john@example.com' }
  },
  {
    id: 2,
    title: 'Donation',
    content: '<!-- DEED_METADATA:{"deedType":"donation"} -->Donated money to charity.',
    createdAt: '2025-04-19T10:00:00.000Z',
    updatedAt: '2025-04-19T10:00:00.000Z',
    user: { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  }
];

describe('Feed Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    useFeed.mockReturnValue({
      feed: mockFeed,
      loading: false,
      paginationData: {
        currentPage: 1,
        pages: 2,
        total: 10
      },
      nextPage: jest.fn(),
      prevPage: jest.fn()
    });
    
    useAuthUser.mockReturnValue({
      user: { id: 1, name: 'John Doe', email: 'john@example.com' }
    });
    
    getDeedInfo.mockImplementation((post) => {
      if (post.content.includes('meditation')) {
        return { name: 'Meditation', color: '#8A2BE2', icon: '🧘' };
      } else if (post.content.includes('donation')) {
        return { name: 'Donation', color: '#FF69B4', icon: '💝' };
      }
      return null;
    });
    
    getCleanContent.mockImplementation((content) => {
      if (content.includes('meditation')) {
        return 'Practiced mindfulness meditation for 15 minutes.';
      } else if (content.includes('donation')) {
        return 'Donated money to charity.';
      }
      return '';
    });
  });

  test('renders feed posts with author information', () => {
    // Use destructuring to get container
    const { container } = render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    
    // Check for heading
    expect(screen.getByText('Social Feed')).toBeInTheDocument();
    
    // Check if posts are rendered
    expect(screen.getByText('Practiced mindfulness meditation for 15 minutes.')).toBeInTheDocument();
    expect(screen.getByText('Donated money to charity.')).toBeInTheDocument();
    
    // Check for author information
    expect(screen.getByText('By: John Doe')).toBeInTheDocument();
    expect(screen.getByText('By: Jane Smith')).toBeInTheDocument();
    
    // Check for date information - CORRECTED VERSION
    const dateElements = container.querySelectorAll('.date');
    expect(dateElements.length).toBe(2);
    expect(dateElements[0].textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test('renders loading state when feed is being fetched', () => {
    useFeed.mockReturnValue({
      feed: [],
      loading: true,
      paginationData: { currentPage: 1, pages: 0 },
      nextPage: jest.fn(),
      prevPage: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading feed...')).toBeInTheDocument();
  });

  test('renders empty state when no posts are available', () => {
    useFeed.mockReturnValue({
      feed: [],
      loading: false,
      paginationData: { currentPage: 1, pages: 0 },
      nextPage: jest.fn(),
      prevPage: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    
    expect(screen.getByText('No posts to display. Be the first to create content!')).toBeInTheDocument();
  });

  test('shows pagination controls when multiple pages exist', () => {
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    
    // Check for pagination controls
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  test('calls nextPage when next button is clicked', () => {
    const mockNextPage = jest.fn();
    useFeed.mockReturnValue({
      feed: mockFeed,
      loading: false,
      paginationData: {
        currentPage: 1,
        pages: 2,
        total: 10
      },
      nextPage: mockNextPage,
      prevPage: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    
    // Find and click the next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check if nextPage was called
    expect(mockNextPage).toHaveBeenCalled();
  });

  test('shows "Your post" indicator for user\'s own posts', () => {
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    
    // Check for own post indicator on first post (user id 1)
    expect(screen.getByText('Your post')).toBeInTheDocument();
  });
});