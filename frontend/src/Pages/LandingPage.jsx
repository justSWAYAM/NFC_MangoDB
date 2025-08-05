import SplitText from "../TextAnimations/SplitText/SplitText";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CircularText from '../TextAnimations/CircularText/CircularText';
import { Link } from 'react-router-dom';


const EmpowermentLanding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const poems = {
    en: "Devi — In every voice, in every struggle, she rises. A step towards self-respect.",
    hi: "देवी — हर स्वर, हर संघर्ष में नारी की शक्ति। एक कदम, आत्मसम्मान की ओर।"
  };

  const slides = [
    {
      title: "Stand Together",
      description: "United we are stronger. Join a community where every voice matters and every story creates change.",
      gradient: "from-orange-500 to-red-400"    
    },
    {
      title: "Break the Silence",
      description: "Your courage inspires others. Safe, anonymous reporting that transforms individual stories into collective power.",
      gradient: "from-red-400 to-pink-500"
    },
    {
      title: "Justice Delivered",
      description: "Expert legal support at your fingertips. We connect you with specialists who fight for your rights with passion.",
      gradient: "from-pink-500 to-purple-500"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <div className="relative">
      {/* Background Image Container - First Screen */}
      <div className="relative h-screen overflow-hidden">
        <div className="w-full h-full">
          <img 
            src="/vecteezy_women-of-different-cultures-and-nationalities-stand-side-by_51291019.jpg"
            alt="Women of different cultures"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/10 via-transparent to-red-900/10" />

        {/* Website Name */}
        

        {/* Navigation Buttons */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <Link
            to="/auth"
            className="px-5 py-1.5 rounded-full bg-red-700 text-white font-semibold border border-orange-500 hover:bg-red-800 transition-colors"
          >
            Login / Sign Up
          </Link>
          <button
            onClick={toggleLanguage}
            className="px-5 py-1.5 rounded-full text-red-700 font-semibold border border-orange-500 hover:bg-orange-50 transition-colors"
          >
            {language === "en" ? "हिन्दी" : "English"}
          </button>
        </div>

        {/* Poem with Circular Text */}
        <div className="absolute top-1/2 right-16 transform -translate-y-1/2 flex items-center gap-32">
        
          <div className={`text-3xl md:text-5xl font-extrabold text-red-700 max-w-lg leading-relaxed drop-shadow-xl ${language === "hi" ? "font-hindi tracking-wide" : ""}`}>
            <SplitText
              key={language} // Add key to force re-render on language change
              text={poems[language]}
              className="text-right"
              delay={50}
              duration={0.3}
              ease="power2.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="right"
              onLetterAnimationComplete={handleAnimationComplete}
            />
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="relative mx-auto" style={{height: '65vh', maxWidth: '65vw'}}>
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden h-full border border-orange-200/50">
              <div className="relative h-full">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ${
                      index === currentSlide ? 'opacity-100 translate-x-0' : 
                      index < currentSlide ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className="h-full flex items-center p-12">
                      <div className="w-full text-center">
                        <div className={`w-32 h-32 bg-gradient-to-br ${slide.gradient} rounded-full mx-auto mb-8 flex items-center justify-center text-4xl shadow-2xl`}>
                          💪
                        </div>
                        <h3 className="text-3xl font-bold text-orange-900 mb-6">
                          {slide.title}
                        </h3>
                        <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Navigation */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-200 border-orange-500 bg-orange-50 text-orange-700 shadow-md hover:shadow-xl hover:scale-105"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-200 border-orange-500 bg-orange-50 text-orange-700 shadow-md hover:shadow-xl hover:scale-105"
                >
                  <ChevronRight size={24} />
                </button>
                
                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide 
                          ? 'bg-orange-600 w-8' 
                          : 'bg-orange-300 w-3 hover:bg-orange-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpowermentLanding;
