import React, { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Shield, FileText, MapPin, Calendar, AlertTriangle,
  Eye, EyeOff, Upload, Loader, CheckCircle, Clock
} from "lucide-react";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const incidentTypes = [
  "Harassment",
  "Discrimination",
  "Violence",
  "Bullying",
  "Other"
];

const initialFormData = {
  date: "",
  description: "",
  evidenceUrl: "",
  incidentType: "",
  isAnonymous: true,
  location: "",
  ngo: "",
  status: "pending",
  userEmail: "anonymous",
  userName: "Anonymous"
};

const AIComplaintChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello, I'm here to help you file your complaint securely. Please share your experience with me, and I'll help fill out the necessary details automatically. Everything you share is confidential.",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [chat, setChat] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Google GenAI
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Initialize chat on component mount
  useEffect(() => {
    const initializeChat = () => {
      const newChat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: [
          {
            role: "user",
            parts: [{ text: "Hello, I need help filing a complaint. Please help me extract relevant information from my description including date, location, incident type (harassment, discrimination, violence, bullying, or other), and any other important details. Format your response as JSON when possible with fields: date, location, incidentType, description." }],
          },
          {
            role: "model",
            parts: [{ text: "I'm here to help you file your complaint securely. Please share your experience with me, and I'll extract the relevant information to help fill out the necessary details automatically. I'll look for dates, locations, incident types, and other important details. Everything you share is confidential." }],
          },
        ],
      });
      setChat(newChat);
    };

    initializeChat();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Helper: Parse Gemini response to extract form fields
  function extractFieldsFromGemini(text) {
    // Try to parse JSON from Gemini response
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = text.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);
        return {
          ...initialFormData,
          date: parsed.date || formData.date,
          location: parsed.location || formData.location,
          incidentType: parsed.incidentType || formData.incidentType,
          description: parsed.description || text,
        };
      }
    } catch (e) {
      // Fallback to text analysis
      const lowerText = text.toLowerCase();
      let extractedType = formData.incidentType;
      
      // Simple keyword matching for incident types
      if (lowerText.includes('harassment') || lowerText.includes('harass')) extractedType = 'Harassment';
      else if (lowerText.includes('discrimination') || lowerText.includes('discriminat')) extractedType = 'Discrimination';
      else if (lowerText.includes('violence') || lowerText.includes('violent') || lowerText.includes('assault')) extractedType = 'Violence';
      else if (lowerText.includes('bully') || lowerText.includes('bullying')) extractedType = 'Bullying';
      else if (extractedType === '') extractedType = 'Other';

      return {
        ...initialFormData,
        incidentType: extractedType,
        description: text
      };
    }
    
    return { 
      ...initialFormData, 
      description: text 
    };
  }

  // Send message to Gemini (text only or with file)
  const handleSendMessage = async () => {
    if (!currentMessage.trim() && !file) return;
    if (!chat) {
      console.error("Chat not initialized");
      return;
    }

    const userMsg = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setIsProcessing(true);
    setExtractionProgress(0);

    // Animate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setExtractionProgress(progress);
      if (progress >= 90) clearInterval(progressInterval);
    }, 150);

    try {
      let response;
      
      if (file) {
        // Multi-modal (text + file)
        const uploadedFile = await ai.files.upload({
          file: file,
        });
        
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            createUserContent([
              currentMessage + " Please analyze this content and extract complaint details including date, location, incident type (harassment, discrimination, violence, bullying, or other), and description. Format as JSON when possible.",
              createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
            ]),
          ],
        });
      } else {
        // Text only using existing chat
        response = await chat.sendMessage({
          message: currentMessage + " Please extract any relevant complaint details including date, location, incident type (harassment, discrimination, violence, bullying, or other), and provide a structured response."
        });
      }

      clearInterval(progressInterval);
      setExtractionProgress(100);

      // Parse Gemini response for form fields
      const responseText = response.text || response.response?.text() || "I received your message and I'm processing it.";
      const newFields = extractFieldsFromGemini(responseText);
      
      setFormData((prev) => ({
        ...prev,
        date: newFields.date || prev.date,
        location: newFields.location || prev.location,
        incidentType: newFields.incidentType || prev.incidentType,
        description: prev.description
          ? prev.description + " " + (newFields.description || "")
          : newFields.description || prev.description
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: responseText,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          type: "bot",
          content: "Sorry, I couldn't process your request. Please try again. Make sure your API key is configured correctly.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
      setExtractionProgress(0);
      setCurrentMessage("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // File upload handler
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Submit complaint (dummy, replace with your backend logic)
  const handleSubmitComplaint = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-6 mb-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#273F4F] to-[#447D9B] rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#273F4F]">AI Complaint Assistant</h1>
              <p className="text-[#447D9B]">Powered by Gemini AI • End-to-end encrypted</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-[#447D9B] font-medium">Gemini Active</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chat Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#273F4F] to-[#447D9B] p-4 text-white">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Secure Conversation</span>
                {isProcessing && (
                  <div className="ml-auto flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI Processing ({extractionProgress}%)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                      message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user"
                          ? "bg-[#FE7743] text-white"
                          : "bg-[#273F4F] text-white"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-3 ${
                        message.type === "user"
                          ? "bg-[#FE7743] text-white rounded-br-sm"
                          : "bg-gray-100 text-[#273F4F] rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.type === "user" ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#273F4F] rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                {file && (
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800 truncate">{file.name}</span>
                      <button
                        onClick={() => setFile(null)}
                        className="ml-auto text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Describe your incident here..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#447D9B] focus:border-transparent"
                  disabled={isProcessing}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Upload Evidence"
                  disabled={isProcessing}
                >
                  <Upload className="w-5 h-5 text-[#447D9B]" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!currentMessage.trim() && !file) || isProcessing}
                  className="px-6 py-3 bg-[#273F4F] hover:bg-[#1e2f3a] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg">
            <div className="bg-gradient-to-r from-[#FE7743] to-[#447D9B] p-4 text-white">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Auto-Generated Complaint Form</span>
                {isProcessing && (
                  <div className="ml-auto">
                    <div className="w-4 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${extractionProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-[#273F4F] mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Incident Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#447D9B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#273F4F] mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Incident Type
                </label>
                <select
                  value={formData.incidentType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      incidentType: e.target.value
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#447D9B]"
                >
                  <option value="">Select incident type</option>
                  {incidentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#273F4F] mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value
                    }))
                  }
                  placeholder="Where did this occur?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#447D9B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#273F4F] mb-2">
                  Description
                  {formData.description && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Auto-filled from conversation
                    </span>
                  )}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#447D9B] resize-none"
                  placeholder="This field will be automatically populated as you describe your incident in the chat..."
                />
              </div>
              {(formData.incidentType || formData.location || formData.date) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    AI Analysis Results:
                  </h4>
                  <div className="space-y-1 text-xs">
                    {formData.incidentType && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-blue-800">
                          Incident type identified: {formData.incidentType}
                        </span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-blue-800">
                          Location extracted: {formData.location}
                        </span>
                      </div>
                    )}
                    {formData.date && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-blue-800">
                          Date detected: {formData.date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isAnonymous: !prev.isAnonymous
                    }))
                  }
                  className="flex items-center space-x-2"
                >
                  {formData.isAnonymous ? (
                    <EyeOff className="w-4 h-4 text-[#447D9B]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#447D9B]" />
                  )}
                  <span className="text-sm text-[#273F4F]">
                    File {formData.isAnonymous ? "Anonymously" : "with Identity"}
                  </span>
                </button>
              </div>
              {file && (
                <div>
                  <label className="block text-sm font-medium text-[#273F4F] mb-2">
                    Evidence Attached
                  </label>
                  <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {file.name} - Ready to upload
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#273F4F] mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 capitalize">
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSubmitComplaint}
                disabled={!formData.description || !formData.incidentType || isSubmitting}
                className="w-full bg-[#273F4F] hover:bg-[#1e2f3a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Submitting Complaint...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Complaint Submitted Successfully</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIComplaintChatbot;