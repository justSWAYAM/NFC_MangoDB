import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
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
  LogOut,
  AlertOctagon,
} from "lucide-react";

const DEFAULT_IMAGE_PATH = "/default-evidence.jpg"; // Place a jpg in your public folder with this name

const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedCase, setSelectedCase] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [caseToEscalate, setCaseToEscalate] = useState(null);
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

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== "NGO") {
          navigate("/unauthorized");
          return;
        }
        setUser(userData);
        await loadCases();
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadCases = async () => {
    try {
      // Load cases from both "cases" and "complaints" collections

      // Load from cases collection
      const casesQuery = query(
        collection(db, "cases"),
        orderBy("submittedDate", "desc")
      );
      const casesSnapshot = await getDocs(casesQuery);
      const casesData = casesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Load from complaints collection
      const complaintsQuery = query(
        collection(db, "complaints"),
        orderBy("createdAt", "desc")
      );
      const complaintsSnapshot = await getDocs(complaintsQuery);
      const complaintsData = complaintsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Transform complaint data to match case format
          victimName: data.userName || "Anonymous",
          victimAge: data.victimAge || "N/A",
          accusedName: data.accusedName || "Not specified",
          accusedPosition: data.accusedPosition || "Not specified",
          companyName: data.companyName || "Not specified",
          incidentType: data.incidentType || "Sexual Harassment",
          harassmentType: data.harassmentType || "Not specified",
          priority: data.priority || "Medium",
          status: data.status || "New",
          submittedDate:
            data.date ||
            (data.createdAt
              ? new Date(data.createdAt.seconds * 1000)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0]),
          lastUpdate:
            data.date ||
            (data.createdAt
              ? new Date(data.createdAt.seconds * 1000)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0]),
          description: data.description || "No description provided",
          location: data.location || "Not specified",
          witnesses: data.witnesses || [],
          evidence: data.evidenceUrl ? [data.evidenceUrl] : [],
          emotionalImpact: data.emotionalImpact || "Not specified",
          requestedSupport: data.requestedSupport || [],
          responseHistory: data.responseHistory || [],
          // Additional fields from actual schema
          isAnonymous: data.isAnonymous || false,
          ngo: data.ngo || "",
          userEmail: data.userEmail || "anonymous",
        };
      });

      // Combine cases and complaints
      const allCases = [...casesData, ...complaintsData];

      // Filter for NGO: Show cases that are NOT workplace-related or are public/community incidents
      const ngoRelevantCases = allCases.filter((case_) => {
        const location = case_.location?.toLowerCase() || "";
        const incidentType = case_.incidentType?.toLowerCase() || "";

        // Exclude cases that are clearly workplace-related
        const isWorkplaceRelated =
          location.includes("office") ||
          location.includes("workplace") ||
          location.includes("company") ||
          location.includes("work") ||
          location.includes("corporate") ||
          location.includes("business") ||
          location.includes("firm") ||
          location.includes("enterprise");

        // Include cases that are:
        // 1. NOT workplace-related (public places, community, etc.)
        // 2. Workplace discrimination (NGOs often handle these)
        // 3. Cases with "pending" status (new complaints)
        // 4. Cases with public/community locations

        const isDiscrimination = incidentType.includes("discrimination");
        const isPending =
          case_.status === "pending" || case_.status === "Pending";
        const isPublicPlace =
          location.includes("public") ||
          location.includes("community") ||
          location.includes("street") ||
          location.includes("transport") ||
          location.includes("online") ||
          location.includes("digital") ||
          location.includes("social media") ||
          location.includes("educational") ||
          location.includes("university") ||
          location.includes("college") ||
          location.includes("school");

        // First, exclude all workplace-related cases
        if (isWorkplaceRelated) {
          return false;
        }

        // Then include non-workplace cases, discrimination cases, pending cases, or public place cases
        return true || isDiscrimination || isPending || isPublicPlace;
      });

      // Separate active and resolved cases
      const active = ngoRelevantCases.filter(
        (case_) =>
          case_.status === "New" ||
          case_.status === "In Progress" ||
          case_.status === "pending" ||
          case_.status === "Pending"
      );
      const resolved = ngoRelevantCases.filter(
        (case_) => case_.status === "Resolved" || case_.status === "Closed"
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
      formData.append(
        "file",
        fileToSend,
        selectedFile ? selectedFile.name : "evidence.jpg"
      );

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
      id: "SH-001",
      victimName: "Sarah M.",
      victimAge: "28",
      companyName: "Community Center",
      incidentType: "Workplace Discrimination",
      harassmentType: "Gender Discrimination",
      priority: "High",
      status: "pending",
      submittedDate: "2024-01-15",
      description:
        "Experiencing discrimination based on gender while volunteering at community center. Denied opportunities and treated differently from male volunteers.",
      lastUpdate: "2024-01-15",
      location: "Public Place",
      witnesses: ["Jane Doe", "John Smith"],
      evidence: [
        "Email screenshots",
        "Audio recording",
        "https://example.com/evidence1.jpg",
      ],
      emotionalImpact: "High stress, anxiety, difficulty sleeping",
      requestedSupport: ["Legal advice", "Counseling", "Support group"],
      responseHistory: [],
    },
    {
      id: "SH-002",
      victimName: "Jessica R.",
      victimAge: "32",
      companyName: "Public Transport",
      incidentType: "Sexual Harassment",
      harassmentType: "Physical Harassment",
      priority: "High",
      status: "In Progress",
      submittedDate: "2024-01-12",
      description:
        "Experienced unwanted physical contact while using public transport. Stranger making inappropriate advances and touching without consent.",
      lastUpdate: "2024-01-16",
      location: "Public Transport",
      witnesses: ["Mike Johnson"],
      evidence: [
        "Security camera footage",
        "Witness statements",
        "https://example.com/evidence2.jpg",
      ],
      emotionalImpact: "Fear, anxiety, avoiding public transport",
      requestedSupport: [
        "Immediate intervention",
        "Legal protection",
        "Safety measures",
      ],
      responseHistory: [
        {
          date: "2024-01-14",
          action: "Initial contact made",
          response:
            "Contacted victim to provide emotional support and legal guidance",
        },
      ],
    },
    {
      id: "SH-003",
      victimName: "Amanda K.",
      victimAge: "25",
      companyName: "Community Event",
      incidentType: "Sexual Harassment",
      harassmentType: "Verbal Harassment",
      priority: "Medium",
      status: "In Progress",
      submittedDate: "2024-01-10",
      description:
        "Experienced verbal harassment at a community event. Multiple people making inappropriate comments and creating uncomfortable environment.",
      lastUpdate: "2024-01-14",
      location: "Community Event",
      witnesses: ["Multiple attendees"],
      evidence: [
        "Documented incidents",
        "Witness statements",
        "https://example.com/evidence3.jpg",
      ],
      emotionalImpact:
        "Depression, loss of confidence, avoiding community events",
      requestedSupport: [
        "Community awareness",
        "Policy changes",
        "Support group",
      ],
      responseHistory: [
        {
          date: "2024-01-12",
          action: "Case investigation started",
          response: "Initiated community awareness and support process",
        },
      ],
    },
  ];

  const sampleResolvedCases = [
    {
      id: "SH-004",
      victimName: "Maria L.",
      victimAge: "29",
      companyName: "Online Platform",
      incidentType: "Sexual Harassment",
      harassmentType: "Digital Harassment",
      priority: "Medium",
      status: "Resolved",
      submittedDate: "2024-01-05",
      description:
        "Receiving inappropriate sexual messages and emails from online acquaintance, including explicit content and threats.",
      lastUpdate: "2024-01-13",
      location: "Digital/Online",
      witnesses: ["Email evidence"],
      evidence: [
        "Screenshots",
        "Email records",
        "https://example.com/evidence4.jpg",
      ],
      emotionalImpact: "Stress, violation of privacy",
      requestedSupport: ["Digital safety training", "Legal protection"],
      resolution:
        "Perpetrator blocked, legal action taken, victim received support",
      responseHistory: [
        {
          date: "2024-01-07",
          action: "Evidence collected",
          response: "Gathered all digital evidence and witness statements",
        },
        {
          date: "2024-01-10",
          action: "Legal action taken",
          response:
            "Filed formal complaint with platform and legal authorities",
        },
        {
          date: "2024-01-13",
          action: "Case resolved",
          response:
            "Perpetrator blocked, victim received compensation and support",
        },
      ],
    },
    {
      id: "SH-005",
      victimName: "Rachel T.",
      victimAge: "31",
      companyName: "Educational Institution",
      incidentType: "Workplace Discrimination",
      harassmentType: "Gender Discrimination",
      priority: "Low",
      status: "Resolved",
      submittedDate: "2024-01-02",
      description:
        "Experiencing discrimination based on gender while applying for educational opportunities. Denied access based on gender stereotypes.",
      lastUpdate: "2024-01-11",
      location: "Educational Institution",
      witnesses: ["None - private meeting"],
      evidence: [
        "Documented conversations",
        "Application records",
        "https://example.com/evidence5.jpg",
      ],
      emotionalImpact: "Career anxiety, moral distress",
      requestedSupport: ["Legal protection", "Educational guidance"],
      resolution:
        "Institution policy changed, victim received equal opportunities",
      responseHistory: [
        {
          date: "2024-01-04",
          action: "Initial assessment",
          response: "Provided legal counsel and emotional support",
        },
        {
          date: "2024-01-08",
          action: "Investigation completed",
          response: "Institution found evidence of discrimination",
        },
        {
          date: "2024-01-11",
          action: "Resolution achieved",
          response:
            "Victim received equal opportunities, institution policy changed",
        },
      ],
    },
  ];

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
      case "In Progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Escalated":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getHarassmentTypeColor = (type) => {
    switch (type) {
      case "Physical Harassment":
        return "bg-red-50 text-red-700 border-red-200";
      case "Verbal Harassment":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Digital Harassment":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Quid Pro Quo":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "Hostile Work Environment":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleCaseAction = (caseId, action) => {
    console.log(`Action ${action} performed on case ${caseId}`);
    // Implementation for case actions
  };

  const handleEscalate = (caseId) => {
    setCaseToEscalate(caseId);
    setShowEscalationModal(true);
  };

  const submitEscalation = async () => {
    if (caseToEscalate && escalationReason.trim()) {
      try {
        const caseRef = doc(db, "cases", caseToEscalate);
        const escalationRecord = {
          date: new Date().toISOString().split("T")[0],
          action: "Case Escalated",
          response: `Case escalated: ${escalationReason}`,
          escalatedBy: user?.name || user?.email || "NGO Staff",
        };

        await updateDoc(caseRef, {
          responseHistory: [
            ...(selectedCase?.responseHistory || []),
            escalationRecord,
          ],
          status: "Escalated",
          lastUpdate: new Date().toISOString().split("T")[0],
          escalationReason: escalationReason,
        });

        console.log(
          `Case ${caseToEscalate} escalated with reason: ${escalationReason}`
        );
        setShowEscalationModal(false);
        setEscalationReason("");
        setCaseToEscalate(null);
        await loadCases(); // Reload cases to show updated data
      } catch (error) {
        console.error("Error escalating case:", error);
      }
    }
  };

  const sendResponse = async () => {
    if (selectedCase && responseText.trim()) {
      try {
        const caseRef = doc(db, "cases", selectedCase.id);
        const newResponse = {
          date: new Date().toISOString().split("T")[0],
          action: "NGO Response",
          response: responseText,
          responder: user?.name || user?.email || "NGO Staff",
        };

        await updateDoc(caseRef, {
          responseHistory: [
            ...(selectedCase.responseHistory || []),
            newResponse,
          ],
          lastUpdate: new Date().toISOString().split("T")[0],
          status:
            selectedCase.status === "New" ? "In Progress" : selectedCase.status,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-200 text-red-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Shield className="h-8 w-8 mr-3" />
                Women's Safety Support Network
              </h1>
              <p className="text-purple-200 text-sm">
                Empowering women against workplace sexual harassment
              </p>
              {user && (
                <p className="text-purple-200 text-xs mt-1">
                  Welcome, {user.name || user.email}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  Active Cases: {activeCases.length}
                </span>
              </div>
              <div className="bg-red-500 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  High Priority:{" "}
                  {activeCases.filter((c) => c.priority === "High").length}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-black px-4 py-2 rounded-lg hover:bg-black/50 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Emergency Banner */}
        <div className="bg-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            <div>
              <h3 className="font-bold">24/7 Crisis Support Available</h3>
              <p className="text-red-800">
                Immediate assistance for victims of sexual harassment
              </p>
            </div>
          </div>
          <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center">
            <PhoneCall className="h-4 w-4 mr-2" />
            Emergency Hotline
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeCases.filter((c) => c.status === "New").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeCases.filter((c) => c.status === "In Progress").length}
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
                  {resolvedCases.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">96%</p>
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
                        ? "border-purple-600 text-purple-600 bg-purple-50"
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
                      placeholder="Search cases by victim name, company, or case ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                {(activeTab === "active" ? activeCases : resolvedCases)
                  .filter(
                    (case_) =>
                      searchTerm === "" ||
                      case_.victimName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      case_.companyName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      case_.id?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((case_) => (
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
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getHarassmentTypeColor(
                                case_.harassmentType
                              )}`}
                            >
                              {case_.harassmentType}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Victim:</strong> {case_.victimName} (
                                {case_.victimAge} years)
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Company:</strong> {case_.companyName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Location:</strong> {case_.location}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Witnesses:</strong>{" "}
                                {case_.witnesses.length}
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

                          {case_.responseHistory.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <p className="text-xs text-blue-800">
                                <strong>Last Response:</strong>{" "}
                                {
                                  case_.responseHistory[
                                    case_.responseHistory.length - 1
                                  ].response
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => setSelectedCase(case_)}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center"
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
                                onClick={() => handleEscalate(case_.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center"
                              >
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                                Escalate
                              </button>
                            </>
                          )}

                          {activeTab === "resolved" && (
                            <button
                              onClick={() => handleEscalate(case_.id)}
                              className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              Re-escalate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pink-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 bg-red-200 border border-red-800 rounded-lg">
                  <Phone className="h-4 w-4 mr-3" />
                  Emergency Hotline
                </button>
                <button className="w-full flex items-center p-3 bg-purple-200 border border-purple-800 rounded-lg">
                  <FileText className="h-4 w-4 mr-3" />
                  Generate Report
                </button>
                <button className="w-full flex items-center p-3 bg-blue-200 border border-blue-800 rounded-lg">
                  <Calendar className="h-4 w-4 mr-3" />
                  Schedule Support Session
                </button>
                <button className="w-full flex items-center p-3 bg-green-200 border border-green-800 rounded-lg">
                  <Users className="h-4 w-4 mr-3" />
                  Connect Volunteer
                </button>
              </div>
            </div>

            {/* Support Resources */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Support Resources
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Crisis Support
                  </h4>
                  <p className="text-red-700 text-xs mt-1">
                    24/7 emergency assistance and immediate intervention
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Legal Aid
                  </h4>
                  <p className="text-blue-700 text-xs mt-1">
                    Free legal consultation and representation services
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 text-sm flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Counseling
                  </h4>
                  <p className="text-green-700 text-xs mt-1">
                    Professional mental health and trauma support
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 text-sm flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Safety Planning
                  </h4>
                  <p className="text-purple-700 text-xs mt-1">
                    Personal safety strategies and workplace protection
                  </p>
                </div>
              </div>
            </div>

            {/* Response Guidelines */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Response Guidelines
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Respond to High priority cases within 2 hours
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Maintain absolute victim confidentiality
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Document all interactions thoroughly
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Escalate if company is unresponsive
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Provide emotional support and resources
                </p>
                <p className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Ensure victim safety is prioritized
                </p>
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
                  Case #{selectedCase.id} - {selectedCase.victimName}
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
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Case Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Victim:</strong> {selectedCase.victimName} (
                        {selectedCase.victimAge} years)
                      </p>
                      <p>
                        <strong>Company:</strong> {selectedCase.companyName}
                      </p>
                      <p>
                        <strong>Harassment Type:</strong>{" "}
                        {selectedCase.harassmentType}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedCase.location}
                      </p>
                      <p>
                        <strong>Priority:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            selectedCase.priority
                          )}`}
                        >
                          {selectedCase.priority}
                        </span>
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            selectedCase.status
                          )}`}
                        >
                          {selectedCase.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Evidence & Witnesses
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          <strong>Evidence:</strong>
                        </p>
                        <ul className="list-disc list-inside ml-2 text-sm">
                          {selectedCase.evidence?.map((item, index) => (
                            <li key={index}>
                              {item.startsWith("http") ? (
                                <a
                                  href={item}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
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
                        <p className="text-sm font-medium mb-2">
                          <strong>Witnesses:</strong>
                        </p>
                        <ul className="list-disc list-inside ml-2 text-sm">
                          {selectedCase.witnesses?.map((witness, index) => (
                            <li key={index}>{witness}</li>
                          )) || <li>No witnesses listed</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Image Analysis Section - Enhanced */}
                  {selectedCase.evidence &&
                    selectedCase.evidence.length > 0 && (
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
                                onChange={(e) => {
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
                                  : selectedCase.evidence[0]?.startsWith("http")
                                  ? selectedCase.evidence[0]
                                  : DEFAULT_IMAGE_PATH
                              }
                              alt="Evidence"
                              className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedFile
                                  ? selectedFile.name
                                  : "Evidence Image"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Click "Analyze Image" to detect potential
                                deepfakes
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
                                    <span className="text-sm font-medium text-gray-700">
                                      Analysis Result:
                                    </span>
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        analysisResult.is_deepfake
                                          ? "bg-red-100 text-red-800 border border-red-200"
                                          : "bg-green-100 text-green-800 border border-green-200"
                                      }`}
                                    >
                                      {analysisResult.is_deepfake
                                        ? "🚨 Deepfake Detected"
                                        : "✅ Real Image"}
                                    </span>
                                  </div>

                                  {/* Confidence Score */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">
                                        Confidence Score:
                                      </span>
                                      <span className="text-sm font-bold text-gray-900">
                                        {(
                                          analysisResult.confidence_score * 100
                                        ).toFixed(1)}
                                        %
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
                                          width: `${
                                            analysisResult.confidence_score *
                                            100
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Probability Breakdown */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                                      <p className="text-xs text-red-600 font-medium">
                                        FAKE PROBABILITY
                                      </p>
                                      <p className="text-lg font-bold text-red-800">
                                        {(
                                          analysisResult.probabilities.fake *
                                          100
                                        ).toFixed(1)}
                                        %
                                      </p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                      <p className="text-xs text-green-600 font-medium">
                                        REAL PROBABILITY
                                      </p>
                                      <p className="text-lg font-bold text-green-800">
                                        {(
                                          analysisResult.probabilities.real *
                                          100
                                        ).toFixed(1)}
                                        %
                                      </p>
                                    </div>
                                  </div>

                                  {/* Recommendation */}
                                  <div
                                    className={`p-3 rounded-lg border ${
                                      analysisResult.is_deepfake
                                        ? "bg-red-50 border-red-200"
                                        : "bg-green-50 border-green-200"
                                    }`}
                                  >
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      Recommendation:
                                    </p>
                                    <p
                                      className={`text-sm ${
                                        analysisResult.is_deepfake
                                          ? "text-red-700"
                                          : "text-green-700"
                                      }`}
                                    >
                                      {analysisResult.is_deepfake
                                        ? "⚠️ This image appears to be manipulated. Consider additional verification before using as evidence."
                                        : "✅ This image appears to be authentic and can be used as evidence."}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Impact & Support Needed
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Emotional Impact:</strong>{" "}
                        {selectedCase.emotionalImpact}
                      </p>
                      <p>
                        <strong>Requested Support:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2">
                        {selectedCase.requestedSupport.map((support, index) => (
                          <li key={index}>{support}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Response Section */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Case Description
                    </h3>
                    <p className="text-sm text-gray-700">
                      {selectedCase.description}
                    </p>
                  </div>

                  {selectedCase.responseHistory.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Response History
                      </h3>
                      <div className="space-y-2">
                        {selectedCase.responseHistory.map((response, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-blue-400 pl-3"
                          >
                            <p className="text-xs text-gray-600">
                              {response.date} - {response.action}
                            </p>
                            <p className="text-sm text-gray-700">
                              {response.response}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Your Response
                    </h3>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your response to the victim... Include emotional support, next steps, and available resources."
                    />
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={sendResponse}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Send Response
                      </button>
                      <button
                        onClick={() => handleEscalate(selectedCase.id)}
                        className="px-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Escalation Modal */}
        {showEscalationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md m-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Escalate Case
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for escalating this case:
              </p>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Explain why this case needs escalation..."
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={submitEscalation}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Submit Escalation
                </button>
                <button
                  onClick={() => setShowEscalationModal(false)}
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

export default NgoDashboard;
