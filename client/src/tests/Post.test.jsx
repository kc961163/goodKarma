// client/src/tests/Posts.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Posts from '../components/Posts';
import usePostsCrud from '../hooks/usePostsCrud';
import { getDeedInfo, getCleanContent } from '../utils/deedUtils';

// Mock the hooks and utilities
jest.mock('../hooks/usePostsCrud');
jest.mock('../hooks/useLikes');
jest.mock('../hooks/useComments');
jest.mock('../utils/deedUtils', () => ({
  getDeedInfo: jest.fn(),
  getCleanContent: jest.fn()
}));

// Sample post data
const mockPosts = [
  {
    id: 1,
    title: 'Meditation',
    content: '<!-- DEED_METADATA:{"deedType":"meditation","primaryOption":"15min","secondaryOption":"mindfulness"} -->Practiced mindfulness meditation for 15 minutes.',
    createdAt: '2025-04-20T12:00:00.000Z',
    updatedAt: '2025-04-20T12:00:00.000Z'
  },
  {
    id: 2,
    title: 'Volunteering',
    content: '<!-- DEED_METADATA:{"deedType":"volunteering","primaryOption":"community","secondaryOption":"2hours"} -->Volunteered with community service for 2 hours.',
    createdAt: '2025-04-19T10:00:00.000Z',
    updatedAt: '2025-04-19T10:00:00.000Z'
  }
];

describe('Posts Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    usePostsCrud.mockReturnValue({
      posts: mockPosts,
      loading: false,
      createPost: jest.fn().mockResolvedValue({}),
      deletePost: jest.fn().mockResolvedValue({})
    });
    
    getDeedInfo.mockImplementation((post) => {
      if (post.content.includes('meditation')) {
        return { name: 'Meditation', color: '#8A2BE2', icon: '🧘' };
      } else if (post.content.includes('volunteering')) {
        return { name: 'Volunteering', color: '#4682B4', icon: '🤝' };
      }
      return null;
    });
    
    getCleanContent.mockImplementation((content) => {
      if (content.includes('meditation')) {
        return 'Practiced mindfulness meditation for 15 minutes.';
      } else if (content.includes('volunteering')) {
        return 'Volunteered with community service for 2 hours.';
      }
      return '';
    });
  });

  test('renders post list when posts are available', () => {
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );
    
    // Check for heading
    expect(screen.getByText('My Posts')).toBeInTheDocument();
    
    // Check if posts are rendered
    expect(screen.getByText('Practiced mindfulness meditation for 15 minutes.')).toBeInTheDocument();
    expect(screen.getByText('Volunteered with community service for 2 hours.')).toBeInTheDocument();
    
    // Check for action buttons
    const viewButtons = screen.getAllByText('View');
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    
    expect(viewButtons.length).toBe(2);
    expect(editButtons.length).toBe(2);
    expect(deleteButtons.length).toBe(2);
  });

  test('renders loading state when posts are being fetched', () => {
    usePostsCrud.mockReturnValue({
      posts: [],
      loading: true,
      createPost: jest.fn(),
      deletePost: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading your posts...')).toBeInTheDocument();
  });

  test('renders empty state when no posts are available', () => {
    usePostsCrud.mockReturnValue({
      posts: [],
      loading: false,
      createPost: jest.fn(),
      deletePost: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );
    
    expect(screen.getByText("You haven't shared any good deeds yet. Start building your karma!")).toBeInTheDocument();
  });

  test('selects deed type and shows options when clicked', () => {
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );
    
    // Find and click the meditation deed type
    const meditationButton = screen.getByText('🧘 Meditation');
    fireEvent.click(meditationButton);
    
    // Check if options appear
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  test('calls deletePost when delete button is clicked and confirmed', async () => {
    const mockDeletePost = jest.fn().mockResolvedValue({});
    usePostsCrud.mockReturnValue({
      posts: mockPosts,
      loading: false,
      createPost: jest.fn(),
      deletePost: mockDeletePost
    });
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(
      <MemoryRouter>
        <Posts />
      </MemoryRouter>
    );
    
    // Find and click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Check if deletePost was called
    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeletePost).toHaveBeenCalledWith(1);
    
    // Restore window.confirm
    window.confirm = originalConfirm;
  });
});