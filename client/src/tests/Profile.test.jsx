import React from 'react';
import { render, screen } from "@testing-library/react";
import Profile from "../components/Profile";
import { useAuthUser } from "../security/AuthContext";
import useCoaching from "../hooks/useCoaching";

// Mock the required hooks
jest.mock("../security/AuthContext");
jest.mock("../hooks/useCoaching");
jest.mock("../security/fetchWithAuth", () => ({
  fetchGetWithAuth: jest.fn().mockResolvedValue({
    categories: {
      meditation: 5,
      journaling: 3,
      yoga: 2,
      volunteering: 1,
      donation: 4
    },
    totalPoints: 35,
    postCount: 15
  })
}));
jest.mock("../components/coaching/CoachingGoals", () => () => <div data-testid="coaching-goals">Goals Mock</div>);
jest.mock("../components/coaching/CoachingInsights", () => () => <div data-testid="coaching-insights">Insights Mock</div>);
jest.mock("../components/coaching/ProgressTracker", () => () => <div data-testid="progress-tracker">Progress Mock</div>);

describe("Profile Component", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    useAuthUser.mockReturnValue({
      user: { name: "John Doe", email: "johndoe@example.com", id: 1 }
    });
    
    useCoaching.mockReturnValue({
      loading: false,
      error: null,
      coachingData: null,
      getCoachingAdvice: jest.fn(),
      updateCoachingProgress: jest.fn(),
      canMakeAdviceCall: true,
      canMakeProgressCall: true,
      nextResetDate: new Date().toISOString()
    });
  });

  test("renders user's name and email when user is authenticated", () => {
    render(<Profile />);

    // Check for profile info - updated to match actual component structure
    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("johndoe@example.com")).toBeInTheDocument();
  });

  test("renders loading state when data is being fetched", () => {
    // Override the default mock to simulate loading
    useCoaching.mockReturnValue({
      loading: true,
      error: null,
      coachingData: null,
      getCoachingAdvice: jest.fn(),
      updateCoachingProgress: jest.fn(),
      canMakeAdviceCall: true,
      canMakeProgressCall: true
    });
    
    render(<Profile />);
    
    expect(screen.getByText("Loading profile data...")).toBeInTheDocument();
  });

  test("renders profile tabs", () => {
    render(<Profile />);
    
    // Check for tab buttons
    expect(screen.getByText("Profile Info")).toBeInTheDocument();
    expect(screen.getByText("Karma Stats")).toBeInTheDocument();
    expect(screen.getByText("Life Coaching")).toBeInTheDocument();
  });
});