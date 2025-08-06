import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SpeechEmotionAnalyzer.css';

const SpeechEmotionAnalyzer = ({ 
  onTranscriptUpdate, 
  onEmotionAnalysisComplete, 
  userId = 'anonymous',
  isActive = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [sessionId] = useState(Date.now().toString());
  const [analysisCount, setAnalysisCount] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      lastSpeechTimeRef.current = Date.now();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
        setInterimTranscript('');
        lastSpeechTimeRef.current = Date.now();
        
        // Reset silence timer
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // Set new silence timer (3 seconds)
        silenceTimeoutRef.current = setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, 3000);
      } else {
        setInterimTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Auto-analyze emotion when transcript changes significantly
  useEffect(() => {
    if (!isActive || !transcript.trim()) return;

    const wordCount = transcript.split(' ').length;
    const timeSinceLastAnalysis = lastAnalysisTime ? Date.now() - lastAnalysisTime : Infinity;
    
    // Analyze if we have at least 10 words and it's been at least 5 seconds since last analysis
    if (wordCount >= 10 && timeSinceLastAnalysis > 5000) {
      analyzeEmotion();
    }
  }, [transcript, isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, []);

  const analyzeEmotion = async () => {
    if (!transcript.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastAnalysisTime(Date.now());

    try {
      const response = await fetch('http://localhost:3001/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcript.trim(),
          userEmail: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalysisCount(prev => prev + 1);
        if (onEmotionAnalysisComplete) {
          onEmotionAnalysisComplete({
            wordCount: result.wordCount,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setAnalysisCount(0);
    setLastAnalysisTime(null);
  };

  // Update parent component with transcript
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript + (interimTranscript ? ' ' + interimTranscript : ''));
    }
  }, [transcript, interimTranscript, onTranscriptUpdate]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="speech-emotion-analyzer">
      <div className="analyzer-header">
        <h3>Voice Complaint Assistant</h3>
        <p className="analyzer-subtitle">
          Speak your complaint naturally. The system will automatically transcribe and analyze your emotional state.
        </p>
      </div>

      <div className="controls-section">
        <div className="control-buttons">
          {!isListening ? (
            <button
              onClick={startListening}
              className="control-btn start-btn"
              disabled={isProcessing}
            >
              <span className="btn-icon">🎤</span>
              Start Speaking
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="control-btn stop-btn"
            >
              <span className="btn-icon">⏹️</span>
              Stop Recording
            </button>
          )}
          
          <button
            onClick={clearTranscript}
            className="control-btn clear-btn"
            disabled={!transcript && !interimTranscript}
          >
            <span className="btn-icon">🗑️</span>
            Clear
          </button>
        </div>

        <div className="status-indicators">
          {isListening && (
            <div className="status-item listening">
              <span className="status-dot pulse"></span>
              Listening...
            </div>
          )}
          {isProcessing && (
            <div className="status-item processing">
              <span className="status-dot spinning"></span>
              Analyzing emotion...
            </div>
          )}
          {analysisCount > 0 && (
            <div className="status-item analyzed">
              <span className="status-dot">✓</span>
              Analyzed {analysisCount} time{analysisCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="transcript-section">
        <div className="transcript-header">
          <h4>Live Transcript</h4>
          <div className="word-count">
            {transcript.split(' ').filter(word => word.trim()).length} words
          </div>
        </div>
        
        <div className="transcript-content">
          {transcript && (
            <div className="final-transcript">
              {transcript}
            </div>
          )}
          {interimTranscript && (
            <div className="interim-transcript">
              {interimTranscript}
            </div>
          )}
          {!transcript && !interimTranscript && (
            <div className="empty-transcript">
              Start speaking to see your transcript here...
            </div>
          )}
        </div>
      </div>

      <div className="privacy-notice">
        <div className="privacy-icon">🔒</div>
        <div className="privacy-text">
          <strong>Privacy Protected:</strong> Your emotional analysis is stored securely and is not visible to you. 
          Only authorized personnel can access this data for case management.
        </div>
      </div>
    </div>
  );
};

export default SpeechEmotionAnalyzer; 