import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../components/Home";
import { useAuthUser } from "../security/AuthContext";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../security/AuthContext");

describe("Home Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders login button when user is not authenticated", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("TODOs App")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  test("renders enter app button when user is authenticated", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: /enter app/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  test("navigates to login page when login button is clicked", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("navigates to app page when enter app button is clicked", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const enterAppButton = screen.getByRole("button", { name: /enter app/i });
    fireEvent.click(enterAppButton);

    expect(mockNavigate).toHaveBeenCalledWith("/app");
  });

  test("navigates to register page when create account button is clicked", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const registerButton = screen.getByRole("button", {
      name: /create account/i,
    });
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});
