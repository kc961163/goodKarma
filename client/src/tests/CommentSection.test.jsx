import React from 'react';
import { render, screen } from '@testing-library/react';
import CommentSection from '../components/CommentSection';
import CommentList from '../components/CommentList';
import CommentButton from '../components/CommentButton';

// Mock the child components
jest.mock('../components/CommentList', () => {
  return jest.fn(props => (
    <div data-testid="comment-list" data-props={JSON.stringify(props)}>
      CommentList
    </div>
  ));
});

jest.mock('../components/CommentButton', () => {
  return jest.fn(props => (
    <div data-testid="comment-button" data-props={JSON.stringify(props)}>
      CommentButton
    </div>
  ));
});

describe('CommentSection Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders CommentButton by default (list view)', () => {
    render(<CommentSection postId="123" postOwnerId="456" />);
    
    // Check that only CommentButton is rendered
    const buttonElement = screen.getByTestId('comment-button');
    expect(buttonElement).toBeInTheDocument();
    expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
    
    // Check that correct props were passed
    const passedProps = JSON.parse(buttonElement.dataset.props);
    expect(passedProps.postId).toBe('123');
  });

  test('renders CommentButton with explicit list view', () => {
    render(<CommentSection postId="123" postOwnerId="456" view="list" />);
    
    // Check that only CommentButton is rendered
    const buttonElement = screen.getByTestId('comment-button');
    expect(buttonElement).toBeInTheDocument();
    expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
    
    // Check that correct props were passed
    const passedProps = JSON.parse(buttonElement.dataset.props);
    expect(passedProps.postId).toBe('123');
  });

  test('renders CommentList when view is detail', () => {
    render(<CommentSection postId="123" postOwnerId="456" view="detail" />);
    
    // Check that only CommentList is rendered
    const listElement = screen.getByTestId('comment-list');
    expect(listElement).toBeInTheDocument();
    expect(screen.queryByTestId('comment-button')).not.toBeInTheDocument();
    
    // Check that correct props were passed
    const passedProps = JSON.parse(listElement.dataset.props);
    expect(passedProps.postId).toBe('123');
    expect(passedProps.postOwnerId).toBe('456');
  });

  test('applies correct CSS class', () => {
    const { container } = render(<CommentSection postId="123" postOwnerId="456" />);
    expect(container.firstChild).toHaveClass('comments-section');
  });

  test('passes different postId values correctly', () => {
    // Test with a different postId
    render(<CommentSection postId="999" postOwnerId="456" />);
    
    const buttonElement = screen.getByTestId('comment-button');
    const passedProps = JSON.parse(buttonElement.dataset.props);
    expect(passedProps.postId).toBe('999');
  });
});