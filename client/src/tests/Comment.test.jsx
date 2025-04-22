import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Comment from '../components/Comment';
import { useAuthUser } from '../security/AuthContext';

// Mock the AuthContext hook
jest.mock('../security/AuthContext');

describe('Comment Component', () => {
  // Sample comment data for testing
  const mockComment = {
    id: 1,
    content: 'This is a test comment',
    createdAt: '2025-04-21T10:00:00Z',
    user: {
      id: 100,
      name: 'Test User',
      email: 'test@example.com'
    },
    replies: []
  };
  
  // Mock callback functions
  const mockOnReply = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default mock for the auth context - logged in as a different user
    useAuthUser.mockReturnValue({
      user: { id: 999 } // Different from comment author
    });
  });

  test('renders comment content correctly', () => {
    render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Check if the comment content is displayed
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    
    // Check if author name is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('shows/hides reply button based on isReply prop', () => {
    // Test for top-level comment (not a reply)
    const { rerender } = render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
        isReply={false}
      />
    );
    
    // Reply button should be visible for top-level comments
    expect(screen.getByText('Reply')).toBeInTheDocument();
    
    // Rerender with isReply=true
    rerender(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
        isReply={true}
      />
    );
    
    // Reply button should not be visible for reply comments
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  test('shows edit button only when user is the comment author', () => {
    // Render when user is NOT the author
    const { rerender } = render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Edit button should NOT be visible
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    
    // Mock the auth context to return the same user as the comment author
    useAuthUser.mockReturnValue({
      user: { id: 100 } // Same as comment.user.id
    });
    
    // Rerender with the author as current user
    rerender(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Edit button should be visible when user is the author
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  test('shows delete button for author or post owner', () => {
    // Test when user is the post owner but not the comment author
    const { rerender } = render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
        postOwnerId={999} // Same as current user.id (999)
      />
    );
    
    // Delete button should be visible
    expect(screen.getByText('Delete')).toBeInTheDocument();
    
    // Test when user is neither the author nor post owner
    rerender(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
        postOwnerId={888} // Different from current user
      />
    );
    
    // Delete button should NOT be visible
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('shows edit form when edit button is clicked', () => {
    // Mock user as the comment author
    useAuthUser.mockReturnValue({
      user: { id: 100 }
    });
    
    render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Click the edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Verify edit form is displayed
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('This is a test comment');
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('calls onEdit when edit form is submitted', () => {
    // Mock user as the comment author
    useAuthUser.mockReturnValue({
      user: { id: 100 }
    });
    
    render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Click edit, update content, and submit
    fireEvent.click(screen.getByText('Edit'));
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated comment' } });
    fireEvent.submit(screen.getByText('Save').closest('form'));
    
    // Verify onEdit was called correctly
    expect(mockOnEdit).toHaveBeenCalledWith(1, 'Updated comment');
  });

  test('calls onReply when reply form is submitted', () => {
    render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Click reply, enter text, and submit
    fireEvent.click(screen.getByText('Reply'));
    const textarea = screen.getByPlaceholderText('Write a reply...');
    fireEvent.change(textarea, { target: { value: 'This is a reply' } });
    fireEvent.submit(screen.getByText('Post Reply').closest('form'));
    
    // Verify onReply was called correctly
    expect(mockOnReply).toHaveBeenCalledWith(1, 'This is a reply');
  });

  test('calls onDelete when delete button is clicked', () => {
    // Mock user as the comment author
    useAuthUser.mockReturnValue({
      user: { id: 100 }
    });
    
    render(
      <Comment 
        comment={mockComment} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Click delete
    fireEvent.click(screen.getByText('Delete'));
    
    // Verify onDelete was called correctly
    expect(mockOnDelete).toHaveBeenCalledWith(1, null);
  });

  test('renders nested replies correctly', () => {
    // Create a comment with replies
    const commentWithReplies = {
      ...mockComment,
      replies: [
        {
          id: 2,
          content: 'This is a reply',
          createdAt: '2025-04-21T11:00:00Z',
          user: {
            id: 101,
            name: 'Reply User',
            email: 'reply@example.com'
          }
        }
      ]
    };
    
    render(
      <Comment 
        comment={commentWithReplies} 
        onReply={mockOnReply} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );
    
    // Verify both the original comment and reply are rendered
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('This is a reply')).toBeInTheDocument();
    expect(screen.getByText('Reply User')).toBeInTheDocument();
  });
});