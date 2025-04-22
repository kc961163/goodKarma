// src/tests/AppLayout.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuthUser } from '../security/AuthContext';

// Mock the AuthContext hook
jest.mock('../security/AuthContext');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  // Keep the real NavLink and Outlet components
}));

describe('AppLayout Component', () => {
  const mockUser = { name: 'Test User' };
  const mockLogout = jest.fn().mockResolvedValue(); // Mock as resolved promise

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up our mocked auth context
    useAuthUser.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  test('renders the application title', () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    
    expect(screen.getByText('GoodKarma')).toBeInTheDocument();
  });

  test('renders the navigation menu with all expected links', () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('My Posts')).toBeInTheDocument();
    expect(screen.getByText('AI Coach and Profile')).toBeInTheDocument();
  });

  test('displays the logged in user\'s name in the welcome message', () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Welcome 👋 Test User/)).toBeInTheDocument();
  });

  test('handles logout button click correctly', async () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    
    const logoutButton = screen.getByText('LogOut');
    fireEvent.click(logoutButton);
    
    // Verify logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
    
    // Wait for the navigation to happen (after async logout completes)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('renders with null user name without crashing', () => {
    // Override the mock to return null for user name
    useAuthUser.mockReturnValue({
      user: { name: null },
      logout: mockLogout,
    });
    
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    
    // Should render the welcome message with no name
    expect(screen.getByText(/Welcome 👋/)).toBeInTheDocument();
  });

  test('NavLinks have correct destinations', () => {
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    
    // Get all links and verify their href attributes
    const feedLink = screen.getByText('Feed').closest('a');
    const postsLink = screen.getByText('My Posts').closest('a');
    const profileLink = screen.getByText('AI Coach and Profile').closest('a');
    
    expect(feedLink).toHaveAttribute('href', '/app/feed');
    expect(postsLink).toHaveAttribute('href', '/app/posts');
    expect(profileLink).toHaveAttribute('href', '/app/profile');
  });
});