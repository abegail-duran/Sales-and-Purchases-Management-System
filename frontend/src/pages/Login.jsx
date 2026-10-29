import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Lock, User, Loader } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!username || username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    
    const result = await login(username, password);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.message || 'Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block p-3 md:p-4 bg-red-600 rounded-2xl mb-3 md:mb-4">
            <svg
              className="w-12 h-12 md:w-16 md:h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Sales and Purchases Management System</h1>
          <p className="text-sm font-semibold text-red-600">ESTRELLA FOOD HUB</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
            Login to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Username */}
            <div>
              <label htmlFor="username" className="label">
                Username <span className="text-red-600" aria-label="required">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: null });
                  }}
                  className={`input pl-10 ${errors.username ? 'input-error' : ''}`}
                  placeholder="Enter your username"
                  disabled={loading}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p id="username-error" className="error-message" role="alert">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password <span className="text-red-600" aria-label="required">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p id="password-error" className="error-message" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-base md:text-lg flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} aria-hidden="true" />
                  <span>Logging in...</span>
                  <span className="sr-only">Please wait</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Test Accounts:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>👤 <strong>Admin:</strong> admin / admin123</p>
              <p>👤 <strong>Manager:</strong> manager / manager123</p>
              <p>👤 <strong>Cashier:</strong> cashier / cashier123</p>
              <p>👤 <strong>Inventory:</strong> inventory / inventory123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs md:text-sm mt-6">
          © {new Date().getFullYear()} ESTRELLA FOOD HUB. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;




