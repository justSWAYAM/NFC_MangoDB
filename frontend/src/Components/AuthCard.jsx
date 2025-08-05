import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import authService from '../Utils/authService';

const db = getFirestore();

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

// Using authService for authentication

const AuthComponent = () => {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState('User');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'User'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle redirect result when component mounts
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await authService.handleRedirectResult();
        if (result.success) {
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (userDoc.exists()) {
            // If user exists, redirect to dashboard with their role
            navigate(`/dashboard/${userDoc.data().role}`);
          } else {
            // Only show role selection for new users
            setSuccess('Successfully signed in with Google! Please select your role.');
            setShowRoleModal(true);
          }
        }
      } catch (err) {
        console.error('Redirect Result Error:', err);
        setError('Failed to complete Google sign-in. Please try again.');
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.signInWithGoogle();
      if (result.success && result.redirecting) {
        // User will be redirected to Google, then back to this component
        // The redirect result will be handled in useEffect
        setSuccess('Redirecting to Google...');
      } else {
        setError(result.error || 'Failed to sign in with Google');
        setLoading(false);
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    setLoading(true);
    try {
      // Get current user from auth service
      const user = authService.getCurrentUser();
      if (!user) {
        setError('No authenticated user found');
        return;
      }

      // Create new user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: selectedGoogleRole,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      setSuccess('Account created successfully!');
      navigate(`/dashboard/${selectedGoogleRole}`);
      setShowRoleModal(false);
    } catch (err) {
      console.error('Role Update Error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isSignIn) {
        // Sign up validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const result = await authService.signup(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.role
        );
        
        if (result.success) {
          setSuccess('Account created successfully! Welcome to DEVI!');
          navigate(`/dashboard/${formData.role}`);
        } else {
          setError(result.error || 'Failed to create account');
        }
      } else {
        // Sign in
        const result = await authService.signin(formData.email, formData.password);
        if (result.success) {
          const userDocRef = doc(db, "users", result.user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setSuccess('Welcome back! Redirecting to your dashboard...');
            navigate(`/dashboard/${userData.role}`);
          } else {
            setError('User data not found');
          }
        } else {
          setError(result.error || 'Failed to sign in');
        }
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'User'
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/vecteezy_women-of-different-cultures-and-nationalities-stand-side-by_51291019.jpg"
          alt="Women of different cultures"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-red-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-end p-4 pr-16">
        <div className="w-full max-w-md">
          <motion.div 
            className="bg-white/80 backdrop-blur-xl border border-red-100/50 rounded-2xl shadow-2xl p-8"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isSignIn ? 'Welcome Back to DEVI' : 'Join DEVI'}
              </h2>
              <p className="text-gray-600">
                {isSignIn 
                  ? 'Sign in to access your safe space'
                  : 'Join our community of strong, supportive women'
                }
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Name and Role fields for sign up */}
              {!isSignIn && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white/50"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white/50"
                      >
                        <option value="User">User</option>
                        <option value="HR">HR</option>
                        <option value="NGO">NGO</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white/50"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field for sign up */}
              {!isSignIn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white/50"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>{isSignIn ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or continue with</span>
                </div>
              </div>

              {/* Social Login Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              {/* Toggle Auth Mode */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isSignIn ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={toggleAuthMode}
                    className="text-red-600 hover:text-red-700 font-semibold hover:underline"
                  >
                    {isSignIn ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Role Selection Modal */}
          {showRoleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Select Your Role</h3>
                <p className="text-gray-600 mb-4">Please select your role to continue to the dashboard.</p>
                
                <div className="space-y-3">
                  {['User', 'HR', 'NGO'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedGoogleRole(role)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2
                        ${selectedGoogleRole === role 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50'
                        }`}
                    >
                      <Shield className={`h-5 w-5 ${selectedGoogleRole === role ? 'text-red-500' : 'text-gray-400'}`} />
                      <span>{role}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleSubmit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
