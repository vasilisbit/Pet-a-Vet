import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '../../app/login/page';
import RegisterPage from '../../app/register/page';
import { loginUser, registerUser } from '../../lib/auth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../lib/auth', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

const mockPush = jest.fn();
const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;

describe('Authentication Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Login Page Integration', () => {
    describe('Successful Login Flow', () => {
      it('should complete successful login flow for customer', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockResolvedValue({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          permissions: {},
          redirectPath: '/dashboard'
        });

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          expect(mockLoginUser).toHaveBeenCalledWith('john@example.com', 'password123');
          expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
      });

      it('should complete successful login flow for administrator', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockResolvedValue({
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'administrator',
          permissions: {},
          redirectPath: '/dashboard'
        });

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
        await user.type(screen.getByLabelText(/password/i), 'adminpass');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          expect(mockLoginUser).toHaveBeenCalledWith('admin@example.com', 'adminpass');
          expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
      });

      it('should handle custom redirect path', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockResolvedValue({
          id: 1,
          name: 'Vet User',
          email: 'vet@example.com',
          role: 'veterinarian',
          permissions: {},
          redirectPath: '/veterinary-dashboard'
        });

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'vet@example.com');
        await user.type(screen.getByLabelText(/password/i), 'vetpass');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/veterinary-dashboard');
        });
      });
    });

    describe('Failed Login Flow', () => {
      it('should handle user not found error', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockRejectedValue(new Error('user_not_found'));

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('No user with these login details.')).toBeInTheDocument();
          expect(screen.getByText('Would you like to create a new account?')).toBeInTheDocument();
        });
      });

      it('should handle incorrect password error', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockRejectedValue(new Error('incorrect_password'));

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'user@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('Wrong email or password.')).toBeInTheDocument();
        });
      });

      it('should handle empty fields error', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockRejectedValue(new Error('empty_fields'));

        render(<LoginPage />);

        // Act
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
        });
      });

      it('should show signup prompt when user not found', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockRejectedValue(new Error('user_not_found'));

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          const signUpButton = screen.getByRole('button', { name: /sign up/i });
          expect(signUpButton).toBeInTheDocument();
        });
      });
    });

    describe('Form Validation', () => {
      it('should highlight email field when empty', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockRejectedValue(new Error('empty_fields'));

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          const emailInput = screen.getByLabelText(/email/i);
          expect(emailInput).toHaveClass('border-red-500');
        });
      });

      it('should highlight password field when empty', async () => {
        // Arrange
        const user = userEvent.setup();
        mockLoginUser.mockRejectedValue(new Error('empty_fields'));

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'user@example.com');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
          const passwordInput = screen.getByLabelText(/password/i);
          expect(passwordInput).toHaveClass('border-red-500');
        });
      });
    });

    describe('Loading States', () => {
      it('should show loading state during login', async () => {
        // Arrange
        const user = userEvent.setup();
        let resolveLogin: (value: any) => void;
        const loginPromise = new Promise((resolve) => {
          resolveLogin = resolve;
        });
        mockLoginUser.mockReturnValue(loginPromise);

        render(<LoginPage />);

        // Act
        await user.type(screen.getByLabelText(/email/i), 'user@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

        // Cleanup
        resolveLogin!({
          id: 1,
          name: 'User',
          email: 'user@example.com',
          role: 'customer',
          permissions: {},
          redirectPath: '/dashboard'
        });
      });
    });
  });

  describe('Registration Page Integration', () => {
    describe('Successful Registration Flow', () => {
      it('should complete successful registration with all fields', async () => {
        // Arrange
        const user = userEvent.setup();
        mockRegisterUser.mockResolvedValue({
          id: 1,
          name: 'New User',
          email: 'newuser@example.com',
          role: 'customer',
          permissions: {},
          redirectPath: '/dashboard'
        });

        render(<RegisterPage />);

        // Act - Fill basic information
        await user.type(screen.getByLabelText(/full name/i), 'New User');
        await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'SecurePass123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

        // Move to contact information
        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        await user.type(screen.getByLabelText(/phone/i), '+30 2101234567');
        await user.type(screen.getByLabelText(/address/i), '123 Main St');
        await user.type(screen.getByLabelText(/city/i), 'Athens');
        await user.type(screen.getByLabelText(/postal code/i), '12345');

        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          expect(mockRegisterUser).toHaveBeenCalledWith(
            'New User',
            'newuser@example.com',
            'SecurePass123!',
            '+30 2101234567',
            '123 Main St',
            'Athens',
            '12345'
          );
          expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
      });

      it('should complete registration with only required fields', async () => {
        // Arrange
        const user = userEvent.setup();
        mockRegisterUser.mockResolvedValue({
          id: 2,
          name: 'Minimal User',
          email: 'minimal@example.com',
          role: 'customer',
          permissions: {},
          redirectPath: '/dashboard'
        });

        render(<RegisterPage />);

        // Act
        await user.type(screen.getByLabelText(/full name/i), 'Minimal User');
        await user.type(screen.getByLabelText(/email/i), 'minimal@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'MinimalPass123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'MinimalPass123!');

        // Add required phone
        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        await user.type(screen.getByLabelText(/phone/i), '2101234567');

        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          expect(mockRegisterUser).toHaveBeenCalledWith(
            'Minimal User',
            'minimal@example.com',
            'MinimalPass123!',
            '2101234567',
            '',
            '',
            ''
          );
        });
      });
    });

    describe('Failed Registration Flow', () => {
      it('should handle user already exists error', async () => {
        // Arrange
        const user = userEvent.setup();
        mockRegisterUser.mockRejectedValue(new Error('user_already_exists'));

        render(<RegisterPage />);

        // Act
        await user.type(screen.getByLabelText(/full name/i), 'Existing User');
        await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        await user.type(screen.getByLabelText(/phone/i), '2101234567');

        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/account with this email already exists/i)).toBeInTheDocument();
        });
      });

      it('should handle password mismatch', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RegisterPage />);

        // Act
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');

        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        await user.type(screen.getByLabelText(/phone/i), '2101234567');

        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
      });

      it('should validate Greek phone number format', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RegisterPage />);

        // Act
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        await user.type(screen.getByLabelText(/phone/i), '123'); // Invalid phone

        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/please enter a valid greek phone number/i)).toBeInTheDocument();
        });
      });
    });

    describe('Form Validation', () => {
      it('should validate email format', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RegisterPage />);

        // Act
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email/i), 'invalid-email');
        await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        await user.type(screen.getByLabelText(/phone/i), '2101234567');

        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          const emailInput = screen.getByLabelText(/email/i);
          expect(emailInput).toHaveClass('border-red-500');
        });
      });

      it('should highlight required fields when empty', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RegisterPage />);

        // Act
        await user.click(screen.getByRole('button', { name: /create account/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByLabelText(/full name/i)).toHaveClass('border-red-500');
          expect(screen.getByLabelText(/email/i)).toHaveClass('border-red-500');
          expect(screen.getByLabelText(/^password$/i)).toHaveClass('border-red-500');
          expect(screen.getByLabelText(/confirm password/i)).toHaveClass('border-red-500');
        });
      });
    });

    describe('Tab Navigation', () => {
      it('should navigate between form tabs', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RegisterPage />);

        // Act & Assert
        expect(screen.getByRole('tab', { name: /basic information/i })).toHaveAttribute('aria-selected', 'true');

        await user.click(screen.getByRole('tab', { name: /contact information/i }));
        expect(screen.getByRole('tab', { name: /contact information/i })).toHaveAttribute('aria-selected', 'true');

        await user.click(screen.getByRole('tab', { name: /basic information/i }));
        expect(screen.getByRole('tab', { name: /basic information/i })).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Cross-Page Navigation', () => {
    it('should navigate from login to register', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginPage />);

      // Act
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toHaveAttribute('href', '/register');
    });

    it('should navigate from register to login', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Act
      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('should handle return button navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginPage />);

      // Act
      await user.click(screen.getByRole('button', { name: /return/i }));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
