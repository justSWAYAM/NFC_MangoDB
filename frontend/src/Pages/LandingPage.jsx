import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Users,
  Scale,
  Menu,
  X,
} from "lucide-react";

const EmpowermentLanding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState("en");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
    setCurrentIndex(0);
    setAnimatedText("");
  };

  const poems = {
    en: "Devi She rises in every voice, every storm. A symbol of strength, a journey to self respect.",
    hi: "देवी हर स्वर में, हर तूफ़ान में वह उठती है। शक्ति की प्रतीक, आत्मसम्मान की यात्रा।",
  };

  // Typewriter effect
  useEffect(() => {
    const currentPoem = poems[language];
    if (currentIndex < currentPoem.length) {
      const timer = setTimeout(() => {
        setAnimatedText((prev) => prev + currentPoem[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, language]);

  useEffect(() => {
    setAnimatedText("");
    setCurrentIndex(0);
  }, [language]);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const slides = [
    {
      title: "Stand Together",
      description:
        "United we are stronger. Join a community where every voice matters and every story creates change.",
      gradient: "from-orange-500 to-amber-400",
      icon: <Users className="w-8 h-8" />,
    },
    {
      title: "Break the Silence",
      description:
        "Your courage inspires others. Safe, anonymous reporting that transforms individual stories into collective power.",
      gradient: "from-amber-400 to-orange-500",
      icon: <Shield className="w-8 h-8" />,
    },
    {
      title: "Justice Delivered",
      description:
        "Expert legal support at your fingertips. We connect you with specialists who fight for your rights with passion.",
      gradient: "from-orange-500 to-red-500",
      icon: <Scale className="w-8 h-8" />,
    },
  ];

  const testimonials = [
    {
      name: "Priya S.",
      role: "Software Engineer",
      content:
        "This platform helped me understand my rights and gave me the courage to speak up. The legal support was invaluable.",
      rating: 5,
    },
    {
      name: "Anjali M.",
      role: "Marketing Manager",
      content:
        "The POSH law guide is so comprehensive yet easy to understand. It should be mandatory reading for everyone.",
      rating: 5,
    },
    {
      name: "Kavya R.",
      role: "HR Professional",
      content:
        "As an HR professional, this resource has been incredibly helpful in creating a safer workplace for everyone.",
      rating: 5,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  // Navigation functions
  const handlePOSHExplainer = () => {
    navigate("/posh-explainer");
    setIsMenuOpen(false);
  };

  const handleAuth = () => {
    navigate("/auth");
    setIsMenuOpen(false);
  };

  const handleStartJourney = () => {
    if (isLoggedIn) {
      navigate("/user-dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleReadStories = () => {
    navigate("/community");
    setIsMenuOpen(false);
  };

  return (
    <div className="relative font-sans">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/vecteezy_women-of-different-cultures-and-nationalities-stand-side-by_51291019.jpg"
            alt="Women of different cultures"
            className="w-full h-full object-cover object-center"
          />
          {/* Enhanced Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/40 via-amber-900/20 to-orange-800/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        </div>

        {/* Navigation Header */}
        <nav className="relative z-10 flex items-center justify-between p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-white">
            <span className="text-orange-300">देवी</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handlePOSHExplainer}
              className="px-6 py-2 rounded-full bg-orange-600/90 shadow text-white font-semibold    transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              POSH Explainer
            </button>
            <button
              onClick={handleAuth}
              className="px-6 py-2 rounded-full bg-[#c04247] text-white font-semibold border border-red-500 hover:bg-red-800 transition-all duration-300 backdrop-blur-sm"
            >
              Login / Sign Up
            </button>
            <button
              onClick={toggleLanguage}
              className="px-6 py-2 rounded-full text-white font-semibold border border-orange-400 hover:bg-orange-50/20 transition-all duration-300 backdrop-blur-sm"
            >
              {language === "en" ? "हिन्दी" : "English"}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute top-0 left-0 w-full h-full  backdrop-blur-sm z-20 md:hidden">
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <button
                onClick={handlePOSHExplainer}
                className="text-white text-xl font-semibold hover:text-orange-300 transition-colors"
              >
                POSH Explainer
              </button>
              <button
                onClick={handleAuth}
                className="text-white text-xl font-semibold hover:text-orange-300 transition-colors"
              >
                Login / Sign Up
              </button>
              <button
                onClick={toggleLanguage}
                className="text-white text-xl font-semibold hover:text-orange-300 transition-colors"
              >
                {language === "en" ? "हिन्दी" : "English"}
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6 text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-end min-h-[80vh] px-12 md:px-12">
          <div className="w-full md:w-1/2 text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="text-[#c04247] block">Empower</span>
              <span className="text-[#c04247] block">Every Voice</span>
            </h1>

            {/* Animated Poem */}
            <div className="mb-8  rounded-2xl">
              <div
                className={`text-lg md:text-2xl lg:text-3xl font-bold text-white leading-relaxed ${
                  language === "hi" ? "font-hindi tracking-wide" : ""
                } min-h-[120px] md:min-h-[160px] flex items-center justify-end`}
              >
                <span className="text-left">{animatedText}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-left">
              <button
                onClick={handleStartJourney}
                className="px-8 py-4 bg-gradient-to-r from-[#d57c31] to-[#e09b59] text-white font-bold rounded-full hover:from-[#d57c31] hover:[#e09b59] transform hover:scale-105 transition-all duration-300 shadow-sm shadow-amber-600"
              >
                Start Your Journey
              </button>
              <button
                onClick={handleReadStories}
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#d57c31] transition-all duration-300 backdrop-blur-sm"
              >
                Read Stories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-amber-50 mb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-900 mb-4">
              Your Path to <span className="text-amber-600">Empowerment</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Discover the tools and support that will help you build confidence
              and strength
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-orange-200/50 min-h-[400px] md:min-h-[500px] relative">
              <div className="relative h-full min-h-[400px] md:min-h-[500px]">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? "opacity-100 translate-x-0"
                        : index < currentSlide
                        ? "opacity-0 -translate-x-full"
                        : "opacity-0 translate-x-full"
                    }`}
                  >
                    <div className="h-full flex items-center p-8 md:p-12">
                      <div className="w-full text-center">
                        <div
                          className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${slide.gradient} rounded-full mx-auto mb-8 flex items-center justify-center text-white shadow-2xl transform hover:scale-110 transition-transform duration-300`}
                        >
                          {slide.icon}
                        </div>
                        <h3 className="text-2xl md:text-4xl font-bold text-orange-900 mb-6">
                          {slide.title}
                        </h3>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-200 border-orange-500 bg-orange-50 text-orange-700 shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-200 border-orange-500 bg-orange-50 text-orange-700 shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-100"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-orange-600 w-8 shadow-md"
                          : "bg-orange-300 w-3 hover:bg-orange-400 hover:w-6"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-orange-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-900 mb-4">
              Stories of <span className="text-amber-600">Empowerment</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Real experiences from women who found strength through knowledge
              and community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-orange-200/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t border-orange-200 pt-4">
                  <p className="font-bold text-orange-900 text-lg">
                    {testimonial.name}
                  </p>
                  <p className="text-amber-600 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#d57c31] to-[#e09b59]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of women who have found their voice, their strength,
            and their power through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartJourney}
              className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:bg-orange-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Get Started Today
            </button>
            <button
              onClick={handlePOSHExplainer}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800;900&display=swap");

        .font-hindi {
          font-family: "Noto Sans Devanagari", sans-serif;
        }

        * {
          font-family: "Inter", sans-serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EmpowermentLanding;
