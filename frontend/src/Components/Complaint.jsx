import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const questions = [
  {
    question: "What type of incident are you reporting?",
    options: ["Sexual Harassment", "Workplace Discrimination", "Violence", "Other"],
    key: "incidentType"
  },
  {
    question: "Where did the incident take place?",
    options: ["Office", "Public Place", "Home", "Other"],
    key: "location"
  },
  {
    question: "Please describe what happened:",
    textarea: true,
    key: "description"
  },
  {
    question: "When did the incident occur?",
    inputType: "date",
    key: "date"
  }
];

const ComplaintModal = ({ open, onClose, user }) => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const handleSelect = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    setStep((prev) => prev + 1);
  };

  const handleInput = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'complaints'), {
        ...responses,
        userEmail: user?.email || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert('Your complaint has been submitted successfully.');
      if (onClose) onClose();
    } catch (error) {
      alert('Failed to submit complaint. Please try again.');
      console.error('Error submitting complaint:', error);
    }
  };

  useEffect(() => {
    const floatingElements = gsap.utils.toArray(".floating-element");
    floatingElements.forEach((el) => {
      gsap.to(el, {
        y: 20,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        duration: 2 + Math.random(),
        delay: Math.random(),
      });
    });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl z-10 p-6 flex flex-col">
        <button
          className="absolute top-3 right-3 text-orange-500 hover:text-orange-700 text-xl font-bold z-20"
          onClick={onClose}
        >
          ×
        </button>
        {step < questions.length ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {questions[step].question}
            </h2>
            {questions[step].options && (
              <div className="space-y-2">
                {questions[step].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(questions[step].key, option)}
                    className="w-full text-left px-4 py-2 border border-orange-300 rounded-lg hover:bg-orange-100 transition"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            {questions[step].textarea && (
              <div>
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Type your response here..."
                  onChange={(e) => handleInput(questions[step].key, e.target.value)}
                ></textarea>
                <button
                  onClick={() => setStep((prev) => prev + 1)}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Next
                </button>
              </div>
            )}
            {questions[step].inputType === "date" && (
              <div>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onChange={(e) => handleInput(questions[step].key, e.target.value)}
                />
                <button
                  onClick={() => setStep((prev) => prev + 1)}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Please review your complaint:
            </h2>
            <ul className="mb-4 space-y-2">
              {questions.map((q, i) => (
                <li key={i}>
                  <strong>{q.question}</strong>
                  <div className="ml-2 text-gray-700">
                    {responses[q.key] || "Not answered"}
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubmit}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Submit Complaint
            </button>
          </div>
        )}
        {/* No floating elements for a simpler modal */}
      </div>
    </div>
  );
};

export default ComplaintModal;