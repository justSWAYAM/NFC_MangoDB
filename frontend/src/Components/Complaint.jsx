import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SpeechEmotionAnalyzer from "./SpeechEmotionAnalyzer";

const questions = [
  {
    question: "What type of incident are you reporting?",
    options: [
      "Sexual Harassment",
      "Workplace Discrimination",
      "Violence",
      "Others",
    ],
    key: "incidentType",
  },
  {
    question: "Where did the incident take place?",
    options: ["Office", "Public Place", "Home", "Other"],
    key: "location",
  },
  {
    question: "Please describe what happened:",
    textarea: true,
    key: "description",
  },
  {
    question: "When did the incident occur?",
    inputType: "date",
    key: "date",
  },
];

const ComplaintModal = ({ open, onClose, user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [addEvidence, setAddEvidence] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [addNgo, setAddNgo] = useState(false);
  const [ngoName, setNgoName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // New state variables for scheduled evidence submission
  const [scheduleEvidence, setScheduleEvidence] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [evidenceSubmitted, setEvidenceSubmitted] = useState(false);
  
  // Speech-to-text emotion analysis states
  const [useVoiceInput, setUseVoiceInput] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [emotionAnalysisCount, setEmotionAnalysisCount] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(0);
      // Reset scheduling state when modal opens
      setScheduleEvidence(false);
      setScheduledDate("");
      setEvidenceSubmitted(false);
    }
  }, [open]);

  // Calculate minimum and maximum dates for scheduling (3 days to 2 weeks from now)
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    return minDate.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSelect = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    setStep((prev) => prev + 1);
  };

  const handleInput = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  // Handle voice transcript updates
  const handleTranscriptUpdate = (transcript) => {
    setVoiceTranscript(transcript);
    // Auto-fill description if it's empty
    if (!responses.description && transcript.trim()) {
      setResponses((prev) => ({ ...prev, description: transcript.trim() }));
    }
  };

  // Handle emotion analysis completion
  const handleEmotionAnalysisComplete = (analysisData) => {
    setEmotionAnalysisCount(prev => prev + 1);
    console.log('Emotion analysis completed:', analysisData);
  };

  // Dummy upload function, replace with Firebase Storage if needed
  const uploadEvidence = async (file) => {
    // In production, upload to Firebase Storage and return the URL
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            "https://dummyimage.com/600x400/000/fff&text=Uploaded+Evidence"
          ),
        1000
      );
    });
  };

  // Generate legal report from evidence
  const generateLegalReport = async () => {
    if (!evidenceFile) {
      alert("Please upload evidence first");
      return;
    }

    setGeneratingReport(true);
    try {
      const formData = new FormData();
      formData.append("evidence", evidenceFile);

      const response = await fetch("http://127.0.0.1:5000/generate_report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create a URL for the blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open PDF in new tab
      window.open(pdfUrl, "_blank");
      
      // Clean up the URL object after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      
    } catch (error) {
      console.error("Error generating legal report:", error);
      alert("Failed to generate legal report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Function to determine priority based on incident type
  const getPriority = (incidentType) => {
    switch (incidentType) {
      case "Sexual Harassment":
        return "High";
      case "Violence":
        return "Medium";
      case "Workplace Discrimination":
      case "Others":
        return "Low";
      default:
        return "Low";
    }
  };

  // Handle immediate evidence submission
  const handleImmediateEvidenceSubmit = async () => {
    if (!evidenceFile) {
      alert("Please select evidence file first");
      return;
    }
    
    setUploading(true);
    try {
      const evidenceUrl = await uploadEvidence(evidenceFile);
      setEvidenceSubmitted(true);
      setEvidenceFile(null); // Clear the file after submission
      alert("Evidence submitted successfully!");
    } catch (error) {
      alert("Failed to submit evidence. Please try again.");
      console.error("Error submitting evidence:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    setUploading(true);
    let evidenceUrl = "";
    let evidenceSchedule = null;
    
    // Handle evidence submission
    if (addEvidence) {
      if (scheduleEvidence) {
        // Scheduled evidence submission
        if (scheduledDate) {
          evidenceSchedule = {
            scheduledDate: scheduledDate,
            submitted: evidenceSubmitted,
            submittedAt: evidenceSubmitted ? serverTimestamp() : null
          };
        }
      } else if (evidenceFile) {
        // Immediate evidence submission
        evidenceUrl = await uploadEvidence(evidenceFile);
      }
    }
    
    const priority = getPriority(responses.incidentType);
    
    try {
      await addDoc(collection(db, "complaints"), {
        ...responses,
        userEmail: isAnonymous ? "anonymous" : user?.email || "",
        userName: isAnonymous ? "Anonymous" : user?.name || "",
        status: "pending",
        priority: priority,
        createdAt: serverTimestamp(),
        evidenceUrl,
        evidenceSchedule,
        ngo: addNgo ? ngoName : "",
        isAnonymous,
      });
      alert("Your complaint has been submitted successfully.");
      if (onClose) onClose();

      // Redirect to community page with incident type
      const incidentType = responses.incidentType || "Sexual Harassment";
      navigate(`/community?incidentType=${encodeURIComponent(incidentType)}`);
    } catch (error) {
      alert("Failed to submit complaint. Please try again.");
      console.error("Error submitting complaint:", error);
    }
    setUploading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 p-8 flex flex-col min-h-[520px]">
        <button
          className="absolute top-4 right-4 text-orange-500 hover:text-orange-700 text-2xl font-bold z-20"
          onClick={onClose}
        >
          ×
        </button>
        {step < questions.length ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {questions[step].question}
            </h2>
            {questions[step].key === "incidentType" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Priority Information:</strong> Sexual Harassment cases are automatically marked as High Priority, 
                  Violence as Medium Priority, and other cases as Low Priority for faster response.
                </p>
              </div>
            )}
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
                {/* Voice Input Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useVoiceInput}
                      onChange={() => setUseVoiceInput(!useVoiceInput)}
                      className="accent-orange-500"
                    />
                    <span className="text-gray-700 font-medium">
                      Use Voice Input for Description
                    </span>
                  </label>
                  {useVoiceInput && (
                    <p className="text-sm text-gray-600 mt-1">
                      Speak naturally and your words will be transcribed automatically. 
                      The system will also analyze your emotional state for case management.
                    </p>
                  )}
                </div>

                {/* Speech Emotion Analyzer */}
                {useVoiceInput && (
                  <div className="mb-4">
                    <SpeechEmotionAnalyzer
                      onTranscriptUpdate={handleTranscriptUpdate}
                      onEmotionAnalysisComplete={handleEmotionAnalysisComplete}
                      userId={user?.email || 'anonymous'}
                      isActive={useVoiceInput}
                    />
                  </div>
                )}

                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder={useVoiceInput ? "Your voice transcript will appear here..." : "Type your response here..."}
                  value={useVoiceInput ? voiceTranscript : responses[questions[step].key] || ""}
                  onChange={(e) =>
                    handleInput(questions[step].key, e.target.value)
                  }
                  readOnly={useVoiceInput}
                ></textarea>
                
                {useVoiceInput && emotionAnalysisCount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Voice analysis completed {emotionAnalysisCount} time{emotionAnalysisCount > 1 ? 's' : ''}. 
                      Your emotional state has been recorded for case management.
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setStep((prev) => prev + 1)}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  disabled={useVoiceInput && !voiceTranscript.trim()}
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
                  onChange={(e) =>
                    handleInput(questions[step].key, e.target.value)
                  }
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
            
            {/* Priority Display */}
            {responses.incidentType && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-orange-800">Priority Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    getPriority(responses.incidentType) === 'High' ? 'bg-red-100 text-red-700' :
                    getPriority(responses.incidentType) === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getPriority(responses.incidentType)} Priority
                  </span>
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  This case will be prioritized accordingly for faster response.
                </p>
              </div>
            )}
            
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
            {/* Toggles */}
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous((v) => !v)}
                  className="accent-orange-500"
                />
                <span className="text-gray-700">Submit as Anonymous</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addEvidence}
                  onChange={() => setAddEvidence((v) => !v)}
                  className="accent-orange-500"
                />
                <span className="text-gray-700">Add Evidence (JPG only)</span>
              </label>
              {addEvidence && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  {/* Evidence submission options */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="evidenceOption"
                        checked={!scheduleEvidence}
                        onChange={() => setScheduleEvidence(false)}
                        className="accent-orange-500"
                      />
                      <span className="text-gray-700">Submit evidence immediately</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="evidenceOption"
                        checked={scheduleEvidence}
                        onChange={() => setScheduleEvidence(true)}
                        className="accent-orange-500"
                      />
                      <span className="text-gray-700">Schedule evidence submission</span>
                    </label>
                  </div>

                  {!scheduleEvidence ? (
                    // Immediate evidence submission
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        onChange={(e) => setEvidenceFile(e.target.files[0])}
                      />
                      {evidenceFile && (
                        <div className="space-y-2">
                          <button
                            onClick={generateLegalReport}
                            disabled={generatingReport}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm"
                          >
                            {generatingReport ? "Generating Report..." : "Generate Legal Report"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Scheduled evidence submission
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Scheduled Evidence Submission:</strong> You can schedule evidence submission between 3 days and 2 weeks from now. 
                          If not submitted by the scheduled date, evidence will be automatically shared with HR or NGO.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Schedule submission date:
                        </label>
                        <input
                          type="date"
                          min={getMinDate()}
                          max={getMaxDate()}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-xs text-gray-500">
                          Available: {getMinDate()} to {getMaxDate()}
                        </p>
                      </div>

                      {scheduledDate && (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/jpeg"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            onChange={(e) => setEvidenceFile(e.target.files[0])}
                          />
                          
                          {evidenceFile && (
                            <div className="space-y-2">
                              <button
                                onClick={handleImmediateEvidenceSubmit}
                                disabled={uploading}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
                              >
                                {uploading ? "Submitting..." : "Submit Evidence Now"}
                              </button>
                              <button
                                onClick={() => {
                                  setEvidenceFile(null);
                                  setEvidenceSubmitted(false);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                              >
                                Cancel & Keep Scheduled
                              </button>
                            </div>
                          )}
                          
                          {evidenceSubmitted && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700">
                                ✓ Evidence submitted successfully! Scheduled submission cancelled.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addNgo}
                  onChange={() => setAddNgo((v) => !v)}
                  className="accent-orange-500"
                />
                <span className="text-gray-700">Connect to a related NGO</span>
              </label>
              {addNgo && (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter NGO name"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                />
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 w-full"
              disabled={uploading}
            >
              {uploading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintModal;
