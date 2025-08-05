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
  LogOut,
} from "lucide-react";

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
      // Load active cases
      const activeQuery = query(
        collection(db, "cases"),
        where("status", "in", ["New", "In Progress"]),
        orderBy("submittedDate", "desc")
      );
      const activeSnapshot = await getDocs(activeQuery);
      const activeData = activeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveCases(activeData);

      // Load resolved cases
      const resolvedQuery = query(
        collection(db, "cases"),
        where("status", "==", "Resolved"),
        orderBy("submittedDate", "desc")
      );
      const resolvedSnapshot = await getDocs(resolvedQuery);
      const resolvedData = resolvedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResolvedCases(resolvedData);
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

  // Sample data for fallback
  const sampleActiveCases = [
    {
      id: "SH-001",
      victimName: "Sarah M.",
      victimAge: "28",
      companyName: "Tech Solutions Inc.",
      incidentType: "Sexual Harassment",
      harassmentType: "Verbal Harassment",
      priority: "High",
      status: "New",
      submittedDate: "2024-01-15",
      description:
        "Experiencing repeated inappropriate sexual comments from supervisor during team meetings. Comments include sexual innuendos and unwanted advances.",
      lastUpdate: "2024-01-15",
      location: "Office - Conference Room",
      witnesses: ["Jane Doe", "John Smith"],
      evidence: ["Email screenshots", "Audio recording"],
      emotionalImpact: "High stress, anxiety, difficulty sleeping",
      requestedSupport: [
        "Legal advice",
        "Counseling",
        "Transfer to different team",
      ],
      responseHistory: [],
    },
    {
      id: "SH-002",
      victimName: "Jessica R.",
      victimAge: "32",
      companyName: "Marketing Group LLC",
      incidentType: "Sexual Harassment",
      harassmentType: "Physical Harassment",
      priority: "High",
      status: "In Progress",
      submittedDate: "2024-01-12",
      description:
        "Colleague making unwanted physical contact including touching, hugging without consent, and standing too close despite clear objections.",
      lastUpdate: "2024-01-16",
      location: "Office - Break Room",
      witnesses: ["Mike Johnson"],
      evidence: ["Security camera footage", "Witness statements"],
      emotionalImpact: "Fear, anxiety, avoiding work areas",
      requestedSupport: [
        "Immediate intervention",
        "Legal protection",
        "Workplace safety measures",
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
      companyName: "Finance Corp",
      incidentType: "Sexual Harassment",
      harassmentType: "Hostile Work Environment",
      priority: "Medium",
      status: "In Progress",
      submittedDate: "2024-01-10",
      description:
        "Creating hostile environment through sexual comments, inappropriate jokes, and discriminatory behavior based on gender.",
      lastUpdate: "2024-01-14",
      location: "Office - Open workspace",
      witnesses: ["Multiple team members"],
      evidence: ["Documented incidents", "HR complaints"],
      emotionalImpact:
        "Depression, loss of confidence, considering resignation",
      requestedSupport: [
        "Workplace investigation",
        "Policy changes",
        "Training for team",
      ],
      responseHistory: [
        {
          date: "2024-01-12",
          action: "Case investigation started",
          response: "Initiated formal investigation process with HR department",
        },
      ],
    },
  ];

  const sampleResolvedCases = [
    {
      id: "SH-004",
      victimName: "Maria L.",
      victimAge: "29",
      companyName: "Consulting Firm",
      incidentType: "Sexual Harassment",
      harassmentType: "Digital Harassment",
      priority: "Medium",
      status: "Resolved",
      submittedDate: "2024-01-05",
      description:
        "Receiving inappropriate sexual messages and emails from manager outside work hours, including explicit content.",
      lastUpdate: "2024-01-13",
      location: "Digital/Online",
      witnesses: ["Email evidence"],
      evidence: ["Screenshots", "Email records"],
      emotionalImpact: "Stress, violation of privacy",
      requestedSupport: ["Digital harassment policy", "Manager transfer"],
      resolution: "Manager was terminated, new policies implemented",
      responseHistory: [
        {
          date: "2024-01-07",
          action: "Evidence collected",
          response: "Gathered all digital evidence and witness statements",
        },
        {
          date: "2024-01-10",
          action: "Legal action taken",
          response: "Filed formal complaint with company and legal authorities",
        },
        {
          date: "2024-01-13",
          action: "Case resolved",
          response:
            "Manager terminated, victim received compensation and support",
        },
      ],
    },
    {
      id: "SH-005",
      victimName: "Rachel T.",
      victimAge: "31",
      companyName: "Design Studio",
      incidentType: "Sexual Harassment",
      harassmentType: "Quid Pro Quo",
      priority: "Low",
      status: "Resolved",
      submittedDate: "2024-01-02",
      description:
        "Experiencing quid pro quo harassment where supervisor implied career advancement in exchange for sexual favors.",
      lastUpdate: "2024-01-11",
      location: "Office - Private meeting room",
      witnesses: ["None - private meeting"],
      evidence: ["Documented conversations", "Performance records"],
      emotionalImpact: "Career anxiety, moral distress",
      requestedSupport: ["Legal protection", "Career guidance"],
      resolution: "Supervisor disciplined, victim promoted to new role",
      responseHistory: [
        {
          date: "2024-01-04",
          action: "Initial assessment",
          response: "Provided legal counsel and emotional support",
        },
        {
          date: "2024-01-08",
          action: "Investigation completed",
          response: "Company found evidence of harassment",
        },
        {
          date: "2024-01-11",
          action: "Resolution achieved",
          response: "Victim received promotion, supervisor disciplined",
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
          date: new Date().toISOString().split('T')[0],
          action: "Case Escalated",
          response: `Case escalated: ${escalationReason}`,
          escalatedBy: user?.name || user?.email || "NGO Staff"
        };
        
        await updateDoc(caseRef, {
          responseHistory: [...(selectedCase?.responseHistory || []), escalationRecord],
          status: "Escalated",
          lastUpdate: new Date().toISOString().split('T')[0],
          escalationReason: escalationReason
        });
        
        console.log(`Case ${caseToEscalate} escalated with reason: ${escalationReason}`);
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
          date: new Date().toISOString().split('T')[0],
          action: "NGO Response",
          response: responseText,
          responder: user?.name || user?.email || "NGO Staff"
        };
        
        await updateDoc(caseRef, {
          responseHistory: [...(selectedCase.responseHistory || []), newResponse],
          lastUpdate: new Date().toISOString().split('T')[0],
          status: selectedCase.status === "New" ? "In Progress" : selectedCase.status
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
      <header className="bg-gradient-to-r from-purple-800 to-pink-800 text-white shadow-lg">
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
              <div className="bg-white/20 px-4 py-2 rounded-lg">
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
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            <div>
              <h3 className="font-bold">24/7 Crisis Support Available</h3>
              <p className="text-red-100">
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
                  .filter(case_ => 
                    searchTerm === "" || 
                    case_.victimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <Heart className="h-5 w-5 mr-2 text-pink-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Phone className="h-4 w-4 mr-3" />
                  Emergency Hotline
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <FileText className="h-4 w-4 mr-3" />
                  Generate Report
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Calendar className="h-4 w-4 mr-3" />
                  Schedule Support Session
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Evidence:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2">
                        {selectedCase.evidence.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                      <p className="mt-2">
                        <strong>Witnesses:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2">
                        {selectedCase.witnesses.map((witness, index) => (
                          <li key={index}>{witness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

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
