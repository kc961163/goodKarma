import { render, screen } from "@testing-library/react";
import Profile from "../components/Profile";
import { useAuthUser } from "../security/AuthContext";

jest.mock("../security/AuthContext");

describe("Profile Component", () => {
  test("renders user's name and email when user is authenticated", () => {
    useAuthUser.mockReturnValue({
      user: { name: "John Doe", email: "johndoe@example.com" },
    });

    render(<Profile />);

    expect(screen.getByText(/name: john doe/i)).toBeInTheDocument();
    expect(
      screen.getByText(/📧 email: johndoe@example.com/i)
    ).toBeInTheDocument();
  });
});
