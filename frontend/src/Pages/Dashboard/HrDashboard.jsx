import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { auth } from "../../../firebase.js";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Phone,
  ArrowUpCircle,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Search,
  Shield,
  Heart,
  Eye,
  Edit,
  Flag,
  UserCheck,
  AlertTriangle,
  PhoneCall,
  Mail,
  MapPin,
  Clock as ClockIcon,
  Building,
  Gavel,
  Target,
  BarChart3,
  Settings,
  UserX,
  CheckSquare,
  XCircle,
  AlertOctagon,
  LogOut,
} from "lucide-react";

const DEFAULT_IMAGE_PATH = "/default-evidence.jpg"; // Place a jpg in your public folder with this name

const HrDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedCase, setSelectedCase] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [showInvestigationModal, setShowInvestigationModal] = useState(false);
  const [caseToInvestigate, setCaseToInvestigate] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCases, setActiveCases] = useState([]);
  const [resolvedCases, setResolvedCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();

  // Authentication and data loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role !== "HR") {
            navigate("/unauthorized");
            return;
          }
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: userData.name || currentUser.displayName || 'HR Staff',
            role: userData.role
          });
          await loadCases();
        } else {
          // If user document doesn't exist, redirect to auth
          navigate("/auth");
          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/auth");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, db]);

  const loadCases = async () => {
    try {
      // Load all cases (both complaints and cases collections)
      const casesQuery = query(
        collection(db, "cases"),
        orderBy("submittedDate", "desc")
      );
      const casesSnapshot = await getDocs(casesQuery);
      const casesData = casesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load complaints from complaints collection
      const complaintsQuery = query(
        collection(db, "complaints"),
        orderBy("createdAt", "desc")
      );
      const complaintsSnapshot = await getDocs(complaintsQuery);
      const complaintsData = complaintsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Transform complaint data to match case format using actual schema
          victimName: data.userName || 'Anonymous',
          victimAge: data.victimAge || 'N/A',
          accusedName: data.accusedName || 'Not specified',
          accusedPosition: data.accusedPosition || 'Not specified',
          companyName: data.companyName || 'Not specified',
          incidentType: data.incidentType || 'Sexual Harassment',
          harassmentType: data.harassmentType || 'Not specified',
          priority: data.priority || 'Medium',
          status: data.status || 'New',
          submittedDate: data.date || (data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          lastUpdate: data.date || (data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          description: data.description || 'No description provided',
          location: data.location || 'Not specified',
          witnesses: data.witnesses || [],
          evidence: data.evidenceUrl ? [data.evidenceUrl] : [],
          emotionalImpact: data.emotionalImpact || 'Not specified',
          requestedSupport: data.requestedSupport || [],
          investigationStatus: data.investigationStatus || 'Not Started',
          investigator: data.investigator || 'Not assigned',
          nextSteps: data.nextSteps || [],
          responseHistory: data.responseHistory || [],
          // Additional fields from actual schema
          isAnonymous: data.isAnonymous || false,
          ngo: data.ngo || '',
          userEmail: data.userEmail || 'anonymous'
        };
      });

      // Combine cases and complaints
      const allCases = [...casesData, ...complaintsData];

      // Separate active and resolved cases
      const active = allCases.filter(case_ => 
        case_.status === "New" || 
        case_.status === "Under Investigation" || 
        case_.status === "In Progress" ||
        case_.status === "Pending" ||
        case_.status === "pending"
      );
      const resolved = allCases.filter(case_ => 
        case_.status === "Resolved" || 
        case_.status === "Closed"
      );

      setActiveCases(active);
      setResolvedCases(resolved);
    } catch (error) {
      console.error("Error loading cases:", error);
      // Fallback to sample data if Firebase fails
      setActiveCases(sampleActiveCases);
      setResolvedCases(sampleResolvedCases);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Analyze image handler
  const handleAnalyzeImage = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      let fileToSend;
      if (selectedFile) {
        fileToSend = selectedFile;
      } else {
        const response = await fetch(DEFAULT_IMAGE_PATH);
        fileToSend = await response.blob();
      }
      const formData = new FormData();
      formData.append("file", fileToSend, selectedFile ? selectedFile.name : "evidence.jpg");

      const apiResponse = await fetch("http://localhost:8000/detect-deepfake", {
        method: "POST",
        body: formData,
      });
      const result = await apiResponse.json();
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult({ error: "Failed to analyze image." });
    }
    setAnalyzing(false);
  };

  // Sample data for fallback
  const sampleActiveCases = [
    {
      id: "HR-001",
      victimName: "Sarah M.",
      victimAge: "28",
      accusedName: "John Smith",
      accusedPosition: "Senior Manager",
      companyName: "Tech Solutions Inc.",
      incidentType: "Sexual Harassment",
      harassmentType: "Verbal Harassment",
      priority: "High",
      status: "Under Investigation",
      submittedDate: "2024-01-15",
      description: "Experiencing repeated inappropriate sexual comments from supervisor during team meetings. Comments include sexual innuendos and unwanted advances.",
      lastUpdate: "2024-01-15",
      location: "Office - Conference Room",
      witnesses: ["Jane Doe", "Mike Johnson"],
      evidence: ["Email screenshots", "Audio recording", "Witness statements"],
      emotionalImpact: "High stress, anxiety, difficulty sleeping",
      requestedSupport: ["Legal advice", "Counseling", "Transfer to different team"],
      investigationStatus: "In Progress",
      investigator: "HR Manager - Lisa Chen",
      nextSteps: ["Interview witnesses", "Review evidence", "Schedule mediation"],
      responseHistory: [
        {
          date: "2024-01-15",
          action: "Case received",
          response: "Initial case review completed, investigation assigned"
        }
      ]
    },
    {
      id: "HR-002",
      victimName: "Jessica R.",
      victimAge: "32",
      accusedName: "David Wilson",
      accusedPosition: "Team Lead",
      companyName: "Marketing Group LLC",
      incidentType: "Sexual Harassment",
      harassmentType: "Physical Harassment",
      priority: "High",
      status: "Under Investigation",
      submittedDate: "2024-01-12",
      description: "Colleague making unwanted physical contact including touching, hugging without consent, and standing too close despite clear objections.",
      lastUpdate: "2024-01-16",
      location: "Office - Break Room",
      witnesses: ["Mike Johnson", "Sarah Lee"],
      evidence: ["Security camera footage", "Witness statements", "Documented complaints"],
      emotionalImpact: "Fear, anxiety, avoiding work areas",
      requestedSupport: ["Immediate intervention", "Legal protection", "Workplace safety measures"],
      investigationStatus: "Evidence Collection",
      investigator: "HR Director - Mark Thompson",
      nextSteps: ["Review security footage", "Interview accused", "Prepare disciplinary action"],
      responseHistory: [
        {
          date: "2024-01-14",
          action: "Investigation started",
          response: "Security footage requested, witnesses interviewed"
        }
      ]
    },
    {
      id: "HR-003",
      victimName: "Amanda K.",
      victimAge: "25",
      accusedName: "Robert Davis",
      accusedPosition: "Department Head",
      companyName: "Finance Corp",
      incidentType: "Sexual Harassment",
      harassmentType: "Hostile Work Environment",
      priority: "Medium",
      status: "Under Investigation",
      submittedDate: "2024-01-10",
      description: "Creating hostile environment through sexual comments, inappropriate jokes, and discriminatory behavior based on gender.",
      lastUpdate: "2024-01-14",
      location: "Office - Open workspace",
      witnesses: ["Multiple team members"],
      evidence: ["Documented incidents", "HR complaints", "Team feedback"],
      emotionalImpact: "Depression, loss of confidence, considering resignation",
      requestedSupport: ["Workplace investigation", "Policy changes", "Training for team"],
      investigationStatus: "Witness Interviews",
      investigator: "HR Specialist - Emily Rodriguez",
      nextSteps: ["Complete witness interviews", "Review company policies", "Plan corrective actions"],
      responseHistory: [
        {
          date: "2024-01-12",
          action: "Investigation initiated",
          response: "Multiple witnesses identified, interviews scheduled"
        }
      ]
    },
  ];

  const sampleResolvedCases = [
    {
      id: "HR-004",
      victimName: "Maria L.",
      victimAge: "29",
      accusedName: "James Brown",
      accusedPosition: "Manager",
      companyName: "Consulting Firm",
      incidentType: "Sexual Harassment",
      harassmentType: "Digital Harassment",
      priority: "Medium",
      status: "Resolved",
      submittedDate: "2024-01-05",
      description: "Receiving inappropriate sexual messages and emails from manager outside work hours, including explicit content.",
      lastUpdate: "2024-01-13",
      location: "Digital/Online",
      witnesses: ["Email evidence"],
      evidence: ["Screenshots", "Email records", "Digital forensics"],
      emotionalImpact: "Stress, violation of privacy",
      requestedSupport: ["Digital harassment policy", "Manager transfer"],
      resolution: "Manager was terminated, new policies implemented",
      investigationStatus: "Completed",
      investigator: "HR Manager - Lisa Chen",
      outcome: "Termination of accused, policy updates implemented",
      responseHistory: [
        {
          date: "2024-01-07",
          action: "Evidence collected",
          response: "Digital evidence gathered and verified"
        },
        {
          date: "2024-01-10",
          action: "Disciplinary action",
          response: "Manager terminated for policy violation"
        },
        {
          date: "2024-01-13",
          action: "Case closed",
          response: "Victim compensated, new policies implemented"
        }
      ]
    },
    {
      id: "HR-005",
      victimName: "Rachel T.",
      victimAge: "31",
      accusedName: "Michael Johnson",
      accusedPosition: "Senior Director",
      companyName: "Design Studio",
      incidentType: "Sexual Harassment",
      harassmentType: "Quid Pro Quo",
      priority: "Low",
      status: "Resolved",
      submittedDate: "2024-01-02",
      description: "Experiencing quid pro quo harassment where supervisor implied career advancement in exchange for sexual favors.",
      lastUpdate: "2024-01-11",
      location: "Office - Private meeting room",
      witnesses: ["None - private meeting"],
      evidence: ["Documented conversations", "Performance records", "Career timeline"],
      emotionalImpact: "Career anxiety, moral distress",
      requestedSupport: ["Legal protection", "Career guidance"],
      resolution: "Supervisor disciplined, victim promoted to new role",
      investigationStatus: "Completed",
      investigator: "HR Director - Mark Thompson",
      outcome: "Supervisor disciplined, victim promoted",
      responseHistory: [
        {
          date: "2024-01-04",
          action: "Investigation started",
          response: "Career records reviewed, timeline established"
        },
        {
          date: "2024-01-08",
          action: "Resolution reached",
          response: "Supervisor disciplined, victim promoted to new role"
        },
        {
          date: "2024-01-11",
          action: "Case closed",
          response: "All parties satisfied with resolution"
        }
      ]
    },
  ];

  // Helper to determine if we should use sample data
  const useSampleData = activeCases.length === 0 && resolvedCases.length === 0 && !loading;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Under Investigation":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Escalated":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInvestigationStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Evidence Collection":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Witness Interviews":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Not Started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCaseAction = (caseId, action) => {
    console.log(`Action ${action} performed on case ${caseId}`);
  };

  const handleInvestigation = (caseId) => {
    setCaseToInvestigate(caseId);
    setShowInvestigationModal(true);
  };

  const submitInvestigation = async () => {
    if (caseToInvestigate && investigationNotes.trim()) {
      try {
        // Determine if it's a case or complaint based on the ID format
        const isComplaint = caseToInvestigate.includes('complaint') || caseToInvestigate.length > 10;
        const collectionName = isComplaint ? "complaints" : "cases";
        
        const caseRef = doc(db, collectionName, caseToInvestigate);
        const investigationRecord = {
          date: new Date().toISOString().split('T')[0],
          action: "Investigation Update",
          response: investigationNotes,
          investigator: user?.name || user?.email || "HR Staff"
        };
        
        await updateDoc(caseRef, {
          responseHistory: [...(selectedCase?.responseHistory || []), investigationRecord],
          lastUpdate: new Date().toISOString().split('T')[0],
          investigationStatus: "In Progress",
          status: "Under Investigation"
        });
        
        console.log(`Investigation updated for case ${caseToInvestigate}`);
        setShowInvestigationModal(false);
        setInvestigationNotes("");
        setCaseToInvestigate(null);
        await loadCases(); // Reload cases to show updated data
      } catch (error) {
        console.error("Error updating investigation:", error);
      }
    }
  };

  const sendResponse = async () => {
    if (selectedCase && responseText.trim()) {
      try {
        // Determine if it's a case or complaint based on the ID format
        const isComplaint = selectedCase.id.includes('complaint') || selectedCase.id.length > 10;
        const collectionName = isComplaint ? "complaints" : "cases";
        
        const caseRef = doc(db, collectionName, selectedCase.id);
        const newResponse = {
          date: new Date().toISOString().split('T')[0],
          action: "HR Response",
          response: responseText,
          responder: user?.name || user?.email || "HR Staff"
        };
        
        await updateDoc(caseRef, {
          responseHistory: [...(selectedCase.responseHistory || []), newResponse],
          lastUpdate: new Date().toISOString().split('T')[0]
        });
        
        console.log(`Response sent to case ${selectedCase.id}`);
        setResponseText("");
        setSelectedCase(null);
        await loadCases(); // Reload cases to show updated data
      } catch (error) {
        console.error("Error sending response:", error);
      }
    }
  };

  if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Building className="h-8 w-8 mr-3" />
                HR Sexual Harassment Management
              </h1>
              <p className="text-blue-200 text-sm">
                Professional investigation and resolution of workplace harassment cases
              </p>
              {user && (
                <p className="text-blue-200 text-xs mt-1">
                  Welcome, {user.name || user.email}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  Active Cases: {activeCases.length}
                </span>
              </div>
              <div className="bg-red-500 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  High Priority: {activeCases.filter((c) => c.priority === "High").length}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Compliance Banner */}
        <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Gavel className="h-6 w-6 mr-3" />
            <div>
              <h3 className="font-bold">Legal Compliance Required</h3>
              <p className="text-blue-100">All investigations must follow EEOC guidelines and company policies</p>
            </div>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            View Guidelines
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Investigation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(useSampleData ? sampleActiveCases : activeCases).filter((c) => c.status === "Under Investigation").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(useSampleData ? sampleResolvedCases : resolvedCases).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-gray-900">7 days</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cases List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "active"
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Active Cases ({activeCases.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("resolved")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "resolved"
                        ? "border-green-600 text-green-600 bg-green-50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Resolved Cases ({resolvedCases.length})
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search cases by victim, accused, or case ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Cases List */}
              <div className="divide-y divide-gray-200">
                {(activeTab === "active"
                  ? (useSampleData ? sampleActiveCases : activeCases)
                  : (useSampleData ? sampleResolvedCases : resolvedCases)
                )
                  .filter(case_ =>
                    searchTerm === "" ||
                    case_.victimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    case_.accusedName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    case_.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    case_.id?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(
                  (case_) => (
                    <div
                      key={case_.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-gray-900">
                              Case #{case_.id}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                case_.priority
                              )}`}
                            >
                              {case_.priority}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                case_.status
                              )}`}
                            >
                              {case_.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getInvestigationStatusColor(
                                case_.investigationStatus
                              )}`}
                            >
                              {case_.investigationStatus}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Victim:</strong> {case_.victimName} ({case_.victimAge} years)
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Accused:</strong> {case_.accusedName} - {case_.accusedPosition}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Investigator:</strong> {case_.investigator}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Witnesses:</strong> {case_.witnesses.length}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">
                            <strong>Description:</strong> {case_.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Submitted: {case_.submittedDate}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Updated: {case_.lastUpdate}
                            </span>
                          </div>

                            {case_.nextSteps && case_.nextSteps.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                <p className="text-xs text-blue-800 font-medium mb-1">Next Steps:</p>
                                <ul className="text-xs text-blue-700">
                                  {case_.nextSteps.map((step, index) => (
                                    <li key={index} className="flex items-center">
                                      <span className="mr-1">•</span> {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {case_.responseHistory.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <p className="text-xs text-gray-800">
                                <strong>Last Update:</strong> {case_.responseHistory[case_.responseHistory.length - 1].response}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => setSelectedCase(case_)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                          
                          {activeTab === "active" && (
                            <>
                              <button
                                onClick={() => setSelectedCase(case_)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Respond
                              </button>
                              <button
                                onClick={() => handleInvestigation(case_.id)}
                                className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Update Investigation
                              </button>
                            </>
                          )}
                          
                          {activeTab === "resolved" && (
                            <button
                              onClick={() => setSelectedCase(case_)}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                HR Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText className="h-4 w-4 mr-3" />
                  Generate Report
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Calendar className="h-4 w-4 mr-3" />
                  Schedule Interview
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Users className="h-4 w-4 mr-3" />
                  Assign Investigator
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Gavel className="h-4 w-4 mr-3" />
                  Legal Review
                </button>
              </div>
            </div>

            {/* Investigation Guidelines */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Investigation Guidelines
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Complete investigation within 30 days
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Maintain strict confidentiality
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Document all interviews and evidence
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Follow EEOC guidelines strictly
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Provide regular updates to all parties
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Ensure fair and impartial process
                </p>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Compliance Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-800">EEOC Compliance</span>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Documentation</span>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-800">Timeline</span>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Legal Review</span>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl max-h-[90vh] overflow-y-auto m-4">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Case #{selectedCase.id} - {selectedCase.victimName} vs {selectedCase.accusedName}
                </h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Case Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Case Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Victim:</strong> {selectedCase.victimName} {selectedCase.isAnonymous && "(Anonymous)"} ({selectedCase.victimAge} years)</p>
                      <p><strong>Accused:</strong> {selectedCase.accusedName} - {selectedCase.accusedPosition}</p>
                      <p><strong>Company:</strong> {selectedCase.companyName}</p>
                      <p><strong>Investigator:</strong> {selectedCase.investigator}</p>
                      {selectedCase.ngo && (
                        <p><strong>NGO:</strong> {selectedCase.ngo}</p>
                      )}
                      <p><strong>User Email:</strong> {selectedCase.userEmail}</p>
                      <p><strong>Investigation Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getInvestigationStatusColor(selectedCase.investigationStatus)}`}>
                          {selectedCase.investigationStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                                     <div className="bg-gray-50 p-4 rounded-lg">
                     <h3 className="font-semibold text-gray-900 mb-3">Evidence & Witnesses</h3>
                     <div className="space-y-4">
                       <div>
                         <p className="text-sm font-medium mb-2"><strong>Evidence:</strong></p>
                         <ul className="list-disc list-inside ml-2 text-sm">
                           {selectedCase.evidence?.map((item, index) => (
                             <li key={index}>
                               {item.startsWith('http') ? (
                                 <a href={item} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                   View Evidence
                                 </a>
                               ) : (
                                 item
                               )}
                             </li>
                           )) || <li>No evidence provided</li>}
                         </ul>
                       </div>
                       
                       <div>
                         <p className="text-sm font-medium mb-2"><strong>Witnesses:</strong></p>
                         <ul className="list-disc list-inside ml-2 text-sm">
                           {selectedCase.witnesses?.map((witness, index) => (
                             <li key={index}>{witness}</li>
                           )) || <li>No witnesses listed</li>}
                         </ul>
                       </div>
                     </div>
                   </div>

                   {/* Evidence Image Analysis Section - Enhanced */}
                   {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                     <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                       <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                         <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                         Evidence Image Analysis
                       </h3>
                       
                       <div className="space-y-4">
                         {/* Image Upload and Preview */}
                         <div className="flex items-start space-x-4">
                           <div className="flex-1">
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Upload or Select Evidence Image
                             </label>
                             <input
                               type="file"
                               accept="image/jpeg,image/png"
                               className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                               onChange={e => {
                                 setSelectedFile(e.target.files[0]);
                                 setAnalysisResult(null);
                               }}
                             />
                           </div>
                           <button
                             onClick={handleAnalyzeImage}
                             className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center disabled:opacity-50"
                             disabled={analyzing}
                           >
                             {analyzing ? (
                               <>
                                 <Clock className="h-4 w-4 mr-2 animate-spin" />
                                 Analyzing...
                               </>
                             ) : (
                               <>
                                 <Eye className="h-4 w-4 mr-2" />
                                 Analyze Image
                               </>
                             )}
                           </button>
                         </div>
                         
                         {/* Image Preview */}
                         <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                           <img
                             src={
                               selectedFile
                                 ? URL.createObjectURL(selectedFile)
                                 : selectedCase.evidence[0]?.startsWith('http') 
                                   ? selectedCase.evidence[0] 
                                   : DEFAULT_IMAGE_PATH
                             }
                             alt="Evidence"
                             className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                           />
                           <div className="flex-1">
                             <p className="text-sm font-medium text-gray-900">
                               {selectedFile ? selectedFile.name : "Evidence Image"}
                             </p>
                             <p className="text-xs text-gray-500">
                               Click "Analyze Image" to detect potential deepfakes
                             </p>
                           </div>
                         </div>
                         
                         {/* Analysis Results */}
                         {analysisResult && (
                           <div className="bg-white p-4 rounded-lg border shadow-sm">
                             <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                               <Shield className="h-4 w-4 mr-2 text-blue-600" />
                               Analysis Results
                             </h4>
                             
                             {analysisResult.error ? (
                               <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                 <AlertOctagon className="h-4 w-4 inline mr-2" />
                                 {analysisResult.error}
                               </div>
                             ) : (
                               <div className="space-y-4">
                                 {/* Result Summary */}
                                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                   <span className="text-sm font-medium text-gray-700">Analysis Result:</span>
                                   <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                     analysisResult.is_deepfake 
                                       ? 'bg-red-100 text-red-800 border border-red-200' 
                                       : 'bg-green-100 text-green-800 border border-green-200'
                                   }`}>
                                     {analysisResult.is_deepfake ? '🚨 Deepfake Detected' : '✅ Real Image'}
                                   </span>
                                 </div>
                                 
                                 {/* Confidence Score */}
                                 <div className="space-y-2">
                                   <div className="flex items-center justify-between">
                                     <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
                                     <span className="text-sm font-bold text-gray-900">
                                       {(analysisResult.confidence_score * 100).toFixed(1)}%
                                     </span>
                                   </div>
                                   <div className="w-full bg-gray-200 rounded-full h-3">
                                     <div
                                       className={`h-3 rounded-full transition-all duration-300 ${
                                         analysisResult.is_deepfake
                                           ? "bg-red-500"
                                           : "bg-green-500"
                                       }`}
                                       style={{
                                         width: `${analysisResult.confidence_score * 100}%`,
                                       }}
                                     ></div>
                                   </div>
                                 </div>
                                 
                                 {/* Probability Breakdown */}
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                                     <p className="text-xs text-red-600 font-medium">FAKE PROBABILITY</p>
                                     <p className="text-lg font-bold text-red-800">
                                       {(analysisResult.probabilities.fake * 100).toFixed(1)}%
                                     </p>
                                   </div>
                                   <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                     <p className="text-xs text-green-600 font-medium">REAL PROBABILITY</p>
                                     <p className="text-lg font-bold text-green-800">
                                       {(analysisResult.probabilities.real * 100).toFixed(1)}%
                                     </p>
                                   </div>
                                 </div>
                                 
                                 {/* Recommendation */}
                                 <div className={`p-3 rounded-lg border ${
                                   analysisResult.is_deepfake 
                                     ? 'bg-red-50 border-red-200' 
                                     : 'bg-green-50 border-green-200'
                                 }`}>
                                   <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                                   <p className={`text-sm ${
                                     analysisResult.is_deepfake 
                                       ? 'text-red-700' 
                                       : 'text-green-700'
                                   }`}>
                                     {analysisResult.is_deepfake 
                                       ? '⚠️ This image appears to be manipulated. Consider additional verification before using as evidence.'
                                       : '✅ This image appears to be authentic and can be used as evidence.'
                                     }
                                   </p>
                                 </div>
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Evidence Image Analysis Section - Enhanced */}
                   {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                     <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                       <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                         <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                         Evidence Image Analysis
                       </h3>
                       
                       <div className="space-y-4">
                         {/* Image Upload and Preview */}
                         <div className="flex items-start space-x-4">
                           <div className="flex-1">
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Upload or Select Evidence Image
                             </label>
                             <input
                               type="file"
                               accept="image/jpeg,image/png"
                               className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                               onChange={e => {
                                 setSelectedFile(e.target.files[0]);
                                 setAnalysisResult(null);
                               }}
                             />
                           </div>
                           <button
                             onClick={handleAnalyzeImage}
                             className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center disabled:opacity-50"
                             disabled={analyzing}
                           >
                             {analyzing ? (
                               <>
                                 <Clock className="h-4 w-4 mr-2 animate-spin" />
                                 Analyzing...
                               </>
                             ) : (
                               <>
                                 <Eye className="h-4 w-4 mr-2" />
                                 Analyze Image
                               </>
                             )}
                           </button>
                         </div>
                         
                         {/* Image Preview */}
                         <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                           <img
                             src={
                               selectedFile
                                 ? URL.createObjectURL(selectedFile)
                                 : selectedCase.evidence[0]?.startsWith('http') 
                                   ? selectedCase.evidence[0] 
                                   : DEFAULT_IMAGE_PATH
                             }
                             alt="Evidence"
                             className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                           />
                           <div className="flex-1">
                             <p className="text-sm font-medium text-gray-900">
                               {selectedFile ? selectedFile.name : "Evidence Image"}
                             </p>
                             <p className="text-xs text-gray-500">
                               Click "Analyze Image" to detect potential deepfakes
                             </p>
                           </div>
                         </div>
                         
                         {/* Analysis Results */}
                         {analysisResult && (
                           <div className="bg-white p-4 rounded-lg border shadow-sm">
                             <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                               <Shield className="h-4 w-4 mr-2 text-blue-600" />
                               Analysis Results
                             </h4>
                             
                             {analysisResult.error ? (
                               <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                 <AlertOctagon className="h-4 w-4 inline mr-2" />
                                 {analysisResult.error}
                               </div>
                             ) : (
                               <div className="space-y-4">
                                 {/* Result Summary */}
                                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                   <span className="text-sm font-medium text-gray-700">Analysis Result:</span>
                                   <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                     analysisResult.is_deepfake 
                                       ? 'bg-red-100 text-red-800 border border-red-200' 
                                       : 'bg-green-100 text-green-800 border border-green-200'
                                   }`}>
                                     {analysisResult.is_deepfake ? '🚨 Deepfake Detected' : '✅ Real Image'}
                                   </span>
                                 </div>
                                 
                                 {/* Confidence Score */}
                                 <div className="space-y-2">
                                   <div className="flex items-center justify-between">
                                     <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
                                     <span className="text-sm font-bold text-gray-900">
                                       {(analysisResult.confidence_score * 100).toFixed(1)}%
                                     </span>
                                   </div>
                                   <div className="w-full bg-gray-200 rounded-full h-3">
                                     <div
                                       className={`h-3 rounded-full transition-all duration-300 ${
                                         analysisResult.is_deepfake
                                           ? "bg-red-500"
                                           : "bg-green-500"
                                       }`}
                                       style={{
                                         width: `${analysisResult.confidence_score * 100}%`,
                                       }}
                                     ></div>
                                   </div>
                                 </div>
                                 
                                 {/* Probability Breakdown */}
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                                     <p className="text-xs text-red-600 font-medium">FAKE PROBABILITY</p>
                                     <p className="text-lg font-bold text-red-800">
                                       {(analysisResult.probabilities.fake * 100).toFixed(1)}%
                                     </p>
                                   </div>
                                   <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                     <p className="text-xs text-green-600 font-medium">REAL PROBABILITY</p>
                                     <p className="text-lg font-bold text-green-800">
                                       {(analysisResult.probabilities.real * 100).toFixed(1)}%
                                     </p>
                                   </div>
                                 </div>
                                 
                                 {/* Recommendation */}
                                 <div className={`p-3 rounded-lg border ${
                                   analysisResult.is_deepfake 
                                     ? 'bg-red-50 border-red-200' 
                                     : 'bg-green-50 border-green-200'
                                 }`}>
                                   <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                                   <p className={`text-sm ${
                                     analysisResult.is_deepfake 
                                       ? 'text-red-700' 
                                       : 'text-green-700'
                                   }`}>
                                     {analysisResult.is_deepfake 
                                       ? '⚠️ This image appears to be manipulated. Consider additional verification before using as evidence.'
                                       : '✅ This image appears to be authentic and can be used as evidence.'
                                     }
                                   </p>
                                 </div>
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                  {selectedCase.nextSteps && selectedCase.nextSteps.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                      <ul className="space-y-1 text-sm">
                        {selectedCase.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2 text-blue-600">•</span> {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Response Section */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Case Description</h3>
                    <p className="text-sm text-gray-700">{selectedCase.description}</p>
                  </div>

                  {selectedCase.responseHistory && selectedCase.responseHistory.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Investigation History</h3>
                      <div className="space-y-2">
                        {selectedCase.responseHistory.map((response, index) => (
                          <div key={index} className="border-l-2 border-blue-400 pl-3">
                            <p className="text-xs text-gray-600">{response.date} - {response.action}</p>
                            <p className="text-sm text-gray-700">{response.response}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">HR Response</h3>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your response to the case... Include investigation updates, next steps, and any decisions made."
                    />
                    <div className="mt-3 flex space-x-3">
                      <button 
                        onClick={sendResponse}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Send Response
                      </button>
                      <button
                        onClick={() => handleInvestigation(selectedCase.id)}
                        className="px-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Investigation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investigation Update Modal */}
        {showInvestigationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md m-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Update Investigation</h3>
              <p className="text-gray-600 mb-4">
                Add investigation notes and update status:
              </p>
              <textarea
                value={investigationNotes}
                onChange={(e) => setInvestigationNotes(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Enter investigation notes, findings, or next steps..."
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={submitInvestigation}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Investigation
                </button>
                <button
                  onClick={() => setShowInvestigationModal(false)}
                  className="px-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default HrDashboard;

// Firebase Storage Rules (console)

