import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "../app/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Remove framer-motion props that cause React warnings
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <div {...cleanProps}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      // Remove framer-motion props that cause React warnings
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <button {...cleanProps}>{children}</button>;
    },
  },
}));

describe("Login Page", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    // Clear localStorage
    localStorage.clear();
  });

  it("renders login form with all elements", () => {
    render(<LoginPage />);

    // Check form inputs
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();

    // Check logo and branding
    expect(screen.getByText("MentorMind")).toBeInTheDocument();
    expect(
      screen.getByText("Teacher Portal — Sign in to your account")
    ).toBeInTheDocument();

    // Check demo accounts section - use more specific queries
    expect(screen.getByText("Demo accounts:")).toBeInTheDocument();
    expect(screen.getByText("teacher1@school.com")).toBeInTheDocument();
    expect(screen.getByText("teacher2@school.com")).toBeInTheDocument();

    // Use more specific query for password in demo section
    const demoPassword = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "code" &&
        content === "password" &&
        element?.parentElement?.textContent?.includes("Password:")
      );
    });
    expect(demoPassword).toBeInTheDocument();

    // Check footer
    expect(screen.getByText(/© \d{4} MentorMind/)).toBeInTheDocument();
  });

  it("allows entering email and password", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(
      /email address/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("shows loading state when submitting", async () => {
    // Mock fetch to simulate API call
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "mock-token",
            user: { id: 1, email: "test@example.com" },
          }),
      })
    ) as any;

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password",
        }),
      });
    });
  });

  it("handles successful login", async () => {
    const mockToken = "mock-jwt-token";
    const mockUser = { id: 1, email: "test@example.com", name: "Test User" };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: mockToken,
            user: mockUser,
          }),
      })
    ) as any;

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(mockToken);
      expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
      expect(mockPush).toHaveBeenCalledWith("/classes");
    });
  });

  it("handles login error with invalid credentials", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Invalid email or password", // Match the actual error message
          }),
      })
    ) as any;

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Use the actual error message from your component
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalledWith("/classes");
  });

  it("handles network errors", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Network error. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("validates required fields", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Both fields should be required
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("clears error message when user starts typing again", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Invalid email or password", // Match actual error
          }),
      })
    ) as any;

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Trigger error
    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });

    // Start typing again - error should clear
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    // Wait for the error to clear (might need a small delay)
    await waitFor(() => {
      expect(
        screen.queryByText("Invalid email or password")
      ).not.toBeInTheDocument();
    });
  });

  it("disables button during loading", async () => {
    let resolveFetch: any;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    global.fetch = vi.fn(() => fetchPromise) as any;

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("disabled");

    // Resolve the fetch
    resolveFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "token",
          user: { id: 1, email: "test@example.com" },
        }),
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("has proper input types and attributes", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(emailInput).toHaveAttribute("placeholder", "you@school.com");
    expect(passwordInput).toHaveAttribute("placeholder", "••••••••");
  });
});
