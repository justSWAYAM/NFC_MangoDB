import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

  const handleSubmit = async () => {
    setUploading(true);
    let evidenceUrl = "";
    if (addEvidence && evidenceFile) {
      evidenceUrl = await uploadEvidence(evidenceFile);
    }
    try {
      await addDoc(collection(db, "complaints"), {
        ...responses,
        userEmail: isAnonymous ? "anonymous" : user?.email || "",
        userName: isAnonymous ? "Anonymous" : user?.name || "",
        status: "pending",
        createdAt: serverTimestamp(),
        evidenceUrl,
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
                  onChange={(e) =>
                    handleInput(questions[step].key, e.target.value)
                  }
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
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg"
                    className="block"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                  />
                  {evidenceFile && (
                    <button
                      onClick={generateLegalReport}
                      disabled={generatingReport}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm"
                    >
                      {generatingReport ? "Generating Report..." : "Generate Legal Report"}
                    </button>
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
