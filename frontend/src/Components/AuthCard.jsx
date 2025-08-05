import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Github, Mail, Lock, User, ArrowRight, Sparkles, Shield, Code, FileText } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import gsap from 'gsap';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);
;


const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const authService = {
  async signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error) {
      return {
        error: error.message,
        success: false
      };
    }
  },
  async signin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error) {
      return {
        error: error.message,
        success: false
      };
    }
  },
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // You can store additional user info here if needed
      return {
        user,
        success: true
      };
    } catch (error) {
      console.error('Google Sign In Error:', error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  async signout() {
    try {
      await auth.signOut();
      return {
        success: true
      };
    } catch (error) {
      return {
        error: error.message,
        success: false
      };
    }
  },
  getCurrentUser() {
    return auth.currentUser;
  }
};

const AuthComponent = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Generate random dots for animation
    const generateDots = () => {
      const newDots = [];
      for (let i = 0; i < 80; i++) {
        newDots.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 2,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 1.5 + 0.3,
          direction: Math.random() * 360,
          color: Math.random() > 0.5 ? 'from-red-500 to-pink-500' : 'from-purple-500 to-indigo-500'
        });
      }
      setDots(newDots);
    };
    

    generateDots();

    // Animate dots
    const animateDots = () => {
      setDots(prevDots =>
        prevDots.map(dot => ({
          ...dot,
          y: (dot.y + dot.speed * 0.1) % 100,
          x: (dot.x + Math.sin(Date.now() * 0.001 + dot.id) * 0.05) % 100,
          opacity: 0.2 + Math.sin(Date.now() * 0.002 + dot.id) * 0.3
        }))
      );
    };

    const interval = setInterval(animateDots, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  gsap.to(".float-element", {
    y: 20,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}, []);


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
      if (result.success) {
        setSuccess('Successfully signed in with Google!');
        // Add navigation here if needed
        // navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to sign in with Google');
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError('Failed to sign in with Google. Please try again.');
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
        
        const result = await authService.signup(formData.email, formData.password);
        if (result.success) {
          setSuccess('Account created successfully! Welcome to README Generator Pro!');
          // Redirect or handle success
        } else {
          setError(result.error);
        }
      } else {
        // Sign in
        const result = await authService.signin(formData.email, formData.password);
        if (result.success) {
          setSuccess('Welcome back! Redirecting to your dashboard...');
          // Redirect or handle success
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setError('');
    setSuccess('');
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false },
    background: {
        color: {
            value: "transparent",
        },
    },
    fpsLimit: 60,
    interactivity: {
        events: {
            onClick: {
                enable: true,
                mode: "push",
            },
            onHover: {
                enable: true,
                mode: "grab",
                parallax: { enable: true, force: 80, smooth: 10 }
            },
            resize: true,
        },
        modes: {
            push: {
                quantity: 4,
            },
            repulse: {
                distance: 150,
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: ["#f43f5e", "#ec4899", "#d946ef", "#a855f7"],
        },
        links: {
            color: "#f43f5e",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
        },
        collisions: {
            enable: true,
        },
        move: {
            direction: "none",
            enable: true,
            outModes: {
                default: "bounce",
            },
            random: true,
            speed: 2,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 80,
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: "circle",
        },
        size: {
            value: { min: 1, max: 5 },
        },
    },
    detectRetina: true,
};

// Animation variants for the form elements
const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const buttonVariants = {
    hover: { 
        scale: 1.03,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    },
    tap: { 
        scale: 0.97 
    }
};

const overlayVariants = {
    initial: {
        opacity: 0,
        scale: 0.8
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
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

      {/* 🌈 Floating GSAP Elements */}
      <div className="absolute top-10 left-10 z-0 float-element">
        <div className="h-12 w-12 bg-orange-400 opacity-30 blur-xl rounded-full"></div>
      </div>
      <div className="absolute bottom-16 right-16 z-0 float-element">
        <div className="h-16 w-16 bg-red-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

  {/* Particle Background */}
  <div className="absolute inset-0">
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0"
    />
  </div>

  {/* 🔥 OPTIONAL: Remove dark overlay for white aesthetic */}
  {/* <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-emerald-900/70"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
  /> */}

        {/* Particle Background */}
        <div className="absolute inset-0">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particlesOptions}
                className="absolute inset-0"
            />
        </div>

        {/* Animated Gradient Overlay */}
      

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-end p-4 pr-16">
            <div className="w-full max-w-md">
                {/* Auth Form */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <motion.div 
                        className="w-full max-w-md"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                    >
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
                              {/* Name field for sign up */}
                              {!isSignIn && (
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
                                      required={!isSignIn}
                                    />
                                  </div>
                                </div>
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
                                      required={!isSignIn}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Submit Button */}
                              <motion.button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 flex items-center justify-center space-x-2"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                              >
                                {loading ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <span className="mr-2">{isSignIn ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight className="h-5 w-5 inline-block" />
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

                              {/* Social Login Buttons */}
                              <div className="space-y-3">
                                <button
                                  onClick={handleGoogleSignIn}
                                  disabled={loading}
                                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                  <GoogleIcon />
                                  <span>Continue with Google</span>
                                </button>

                                <button
                                  type="button"
                                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                  <Github className="h-5 w-5" />
                                  <span>GitHub</span>
                                </button>
                              </div>
                            </div>

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
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </div>
  );
  
};

export default AuthComponent;