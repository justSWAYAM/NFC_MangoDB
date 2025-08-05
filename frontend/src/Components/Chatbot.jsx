import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your POSH law assistant. I can help you understand your rights, the complaint process, and answer questions about sexual harassment laws. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses = {
    hello:
      "Hello! I'm here to help you with POSH law questions. What would you like to know?",
    hi: "Hi there! How can I assist you with POSH law today?",
    complaint:
      "To file a POSH complaint: 1) Submit written complaint to Internal Committee within 3 months, 2) Committee will acknowledge within 7 days, 3) Inquiry completed within 90 days. You have rights to confidentiality and interim relief.",
    timeline:
      "You have 3 months from the incident date to file a POSH complaint. Extensions are possible in exceptional circumstances with written reasons.",
    committee:
      "Every workplace with 10+ employees must have an Internal Committee with: 1 Presiding Officer (senior woman), 2 employee members, 1 NGO member. At least half must be women.",
    harassment:
      "Sexual harassment includes: unwelcome physical contact, demands for sexual favors, sexually colored remarks, showing pornography, or any unwelcome sexual conduct.",
    rights:
      "Your rights include: confidentiality, interim relief, counseling, protection from retaliation, fair inquiry, and the right to appeal the decision.",
    help: "I can help with: POSH law basics, filing complaints, understanding your rights, committee structure, harassment definitions, and legal procedures. What specific topic interests you?",
    anonymous:
      "Anonymous complaints cannot be filed under POSH Act, but your identity remains confidential throughout the process. Breach of confidentiality is punishable.",
    "false complaint":
      "Filing false/malicious complaints can result in disciplinary action. However, inability to prove a complaint doesn't make it false automatically.",
    men: "POSH Act specifically protects women. Men facing harassment can file under Section 354A IPC or company policies for workplace harassment.",
    appeal:
      "If unsatisfied with IC decision, you can appeal to court/tribunal within 90 days of the committee's recommendation.",
    support:
      "Support available includes: legal aid, counseling, medical examination, interim relief, and protection from adverse consequences.",
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }

    if (
      message.includes("how") ||
      message.includes("what") ||
      message.includes("when") ||
      message.includes("where")
    ) {
      return "That's a great question! For detailed information about POSH law procedures, please refer to the guide above or contact our legal experts at help@poshguardian.com for personalized assistance.";
    }

    if (message.includes("thank")) {
      return "You're welcome! Remember, knowledge is power. Don't hesitate to ask if you have more questions about your rights under POSH law.";
    }

    return "I understand you're seeking information about POSH law. Could you please be more specific about what you'd like to know? I can help with complaints, committees, definitions, rights, or procedures.";
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
          id: messages.length + 1,
          text: inputText,
          isUser: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        try {
          const res = await axios.post("http://localhost:8000/chat", {
            message: inputText,
          });

          const botResponse = {
            id: messages.length + 2,
            text: res.data.response || "Sorry, I couldn't understand that.",
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
          console.error("Error calling chatbot:", error);
          const botResponse = {
            id: messages.length + 2,
            text: "Something went wrong while contacting the POSH assistant.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botResponse]);
        } finally {
          setIsTyping(false);
        }
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "How do I file a POSH complaint?",
    "What is considered sexual harassment?",
    "What are my rights under POSH law?",
    "Tell me about Internal Committees",
    "What support can I get?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-4 w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-6 w-6 text-white mr-2" />
                <h3 className="text-white font-semibold">POSH Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    {!message.isUser && (
                      <div className="bg-red-100 rounded-full p-1 mt-1">
                        <Bot className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.isUser
                          ? "bg-red-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.isUser && (
                      <div className="bg-gray-200 rounded-full p-1 mt-1">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="bg-red-100 rounded-full p-1 mt-1">
                      <Bot className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg rounded-bl-sm text-sm">
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

              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center">
                    Quick questions:
                  </p>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(question)}
                      className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about POSH law..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-colors"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </div>
  );
};

export default Chatbot;
