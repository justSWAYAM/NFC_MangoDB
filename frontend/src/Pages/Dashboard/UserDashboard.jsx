import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../../../firebase.js";
import NgoDashboard from "./NgoDashboard.jsx";
import HrDashboard from "./HrDashboard.jsx";
import {
  FileText,
  Search,
  MessageCircle,
  BookOpen,
  Megaphone,
  Plus,
  ChevronRight,
  Shield,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  Lock,
  Eye,
  Bell,
  Activity,
  LogOut,
  Menu,
  X,
  EyeOff
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase";
import ComplaintModal from "../../Components/Complaint";
import TrackCasesModal from "../../Components/TrackCasesModal";

const DeviDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { role: urlRole } = useParams();
  const [activeCard, setActiveCard] = useState(null);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [showTrackCases, setShowTrackCases] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Authentication and user data loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName || "User",
              role: userData.role || "User",
            });
            setUserRole(userData.role || "User");
          } else {
            // If user document doesn't exist, create basic user object
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "User",
              role: "User",
            });
            setUserRole("User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to basic user object
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            role: "User",
          });
          setUserRole("User");
        }
      } else {
        // No user is signed in, redirect to auth
        navigate("/auth");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Role-based routing logic
  useEffect(() => {
    if (urlRole && urlRole.toLowerCase() === "ngo") {
      return <NgoDashboard />;
    }
    if (urlRole && urlRole.toLowerCase() === "hr") {
      return <HrDashboard />;
    }
    if (userRole === "User") {
      // Continue with User Dashboard
    } else if (userRole === "NGO") {
      navigate("/NGO");
    } else if (userRole === "HR") {
      navigate("/HR");
    }
  }, [userRole, urlRole, navigate]);

  useEffect(() => {
    if (!user?.email) return;
    const q = query(
      collection(db, "complaints"),
      where("userEmail", "==", user.email),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComplaints(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsub();
  }, [user]);

  // Dashboard Cards
  const dashboardCards = [
    {
      id: "file-complaint",
      title: "File a Complaint",
      description:
        "Report a new incident or concern securely and confidentially.",
      icon: <Megaphone className="w-6 h-6" />,
      bgColor: "bg-[#FE7743]",
      status: "Online",
      stats: { label: "Total Filed", value: complaints.length },
      action: () => setComplaintModalOpen(true),
    },
    {
      id: "track-cases",
      title: "Track My Cases",
      description: "View the status and progress of your submitted complaints.",
      icon: <Search className="w-6 h-6" />,
      bgColor: "bg-[#447D9B]",
      status: "Active",
      stats: {
        label: "Pending",
        value: complaints.filter((c) => c.status === "Pending").length,
      },
      action: () => setShowTrackCases(true),
    },
    {
      id: "resources",
      title: "Resources",
      description:
        "Access guides, helplines, and support resources for your safety.",
      icon: <BookOpen className="w-6 h-6" />,
      bgColor: "bg-[#273F4F]",
      status: "Updated",
      stats: { label: "Guides", value: 8 },
      action: () => {
        console.log("Navigating to community page...");
        navigate("/community");
      },
    },
    {
      id: "community",
      title: "Community Support",
      description: "Connect with support groups and safe communities.",
      icon: <Users className="w-6 h-6" />,
      bgColor: "bg-[#D7D7D7]",
      status: "Online",
      stats: { label: "Groups", value: 3 },
      action: () => {
        console.log("Navigating to community page...");
        navigate("/community");
      },
    },
  ];

  // Quick Stats
  const quickStats = [
    {
      label: "Total Complaints",
      value: complaints.length,
      icon: <FileText className="w-5 h-5 text-[#FE7743]" />,
      color: "bg-[#FEF3ED]",
    },
    {
      label: "Pending Cases",
      value: complaints.filter((c) => c.status === "Pending").length,
      icon: <AlertTriangle className="w-5 h-5 text-[#447D9B]" />,
      color: "bg-[#F0F6FA]",
    },
    {
      label: "Resolved",
      value: complaints.filter((c) => c.status === "Resolved").length,
      icon: <CheckCircle className="w-5 h-5 text-[#273F4F]" />,
      color: "bg-[#F2F4F8]",
    },
    {
      label: "Last Filed",
      value: complaints[0]?.createdAt
        ? new Date(complaints[0].createdAt.seconds * 1000).toLocaleDateString()
        : "N/A",
      icon: <Clock className="w-5 h-5 text-[#FE7743]" />,
      color: "bg-[#FEF3ED]",
    },
  ];

  // Recent Activity
  const recentActivity = complaints.slice(0, 5).map((c) => ({
    icon: <Megaphone className="w-4 h-4" />,
    title: c.title || "Complaint Filed",
    time: c.createdAt
      ? new Date(c.createdAt.seconds * 1000).toLocaleString()
      : "N/A",
    status: c.status || "Pending",
    type: "complaint",
    priority: c.status === "Pending" ? "High" : "Medium",
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#D7D7D7] border-t-[#273F4F] rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-gray-50 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#273F4F]" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#273F4F] mb-1">
              Devi Platform
            </h2>
            <p className="text-[#447D9B] text-sm">Securing your access...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#273F4F] mb-1">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Complaint Modal and Track Cases Modal always mounted for accessibility */}
      <ComplaintModal
        open={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        user={user}
      />
      <TrackCasesModal
        open={showTrackCases}
        onClose={() => setShowTrackCases(false)}
        complaints={complaints}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Professional Header - Responsive */}
        <header className="bg-white border-b border-[#D7D7D7] sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Section - Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#273F4F] rounded-lg flex items-center justify-center">
                  <Link to="/">
                    <Shield className="w-6 h-6 text-white" />
                  </Link>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-[#273F4F]">Devi</h1>
                  <p className="text-xs text-[#447D9B] font-medium">
                    Women's Safety Platform
                  </p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-[#273F4F]">Devi</h1>
                </div>
              </div>

              {/* Right Section - Desktop */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-[#447D9B] font-medium">
                    Secure Connection
                  </span>
                </div>
                <div className="relative">
                  <Bell className="w-5 h-5 text-[#447D9B] hover:text-[#273F4F] cursor-pointer transition-colors" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FE7743] rounded-full"></span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#273F4F]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#447D9B]">{user.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-[#447D9B] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-[#447D9B] hover:text-[#273F4F] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => navigate("/stealth")}
                  className="bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center text-white"
                  title="Stealth Mode"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Stealth Mode
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center space-x-2">
                <div className="relative">
                  <Bell className="w-5 h-5 text-[#447D9B] hover:text-[#273F4F] cursor-pointer transition-colors" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FE7743] rounded-full"></span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-[#447D9B] hover:text-[#273F4F] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-[#D7D7D7] bg-white py-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-2">
                    <div className="w-10 h-10 bg-[#447D9B] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#273F4F]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#447D9B]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm px-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[#447D9B] font-medium">
                      Secure Connection
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-2 py-2 text-left text-[#447D9B] hover:text-[#273F4F] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* System Status Banner - Responsive */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-green-800 truncate sm:text-base">
                  System Status: All services operational
                </p>
                <p className="text-xs text-green-600">
                  Last updated: 2 minutes ago
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Overview - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border border-[#D7D7D7] rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg bg-gray-100 ${stat.color} flex-shrink-0`}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-lg font-bold text-[#273F4F] truncate">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-[#447D9B] truncate">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Dashboard and Sidebar - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Dashboard */}
            <div className="lg:col-span-2">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#273F4F] mb-1 sm:mb-2">
                  Dashboard
                </h2>
                <p className="text-sm sm:text-base text-[#447D9B]">
                  Access your services and track your cases
                </p>
              </div>

              {/* Dashboard Cards - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {dashboardCards.map((card) => (
                  <div
                    key={card.id}
                    className={`bg-white border border-[#D7D7D7] rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-[#447D9B] transition-all cursor-pointer group ${
                      activeCard === card.id ? "border-[#273F4F] shadow-lg" : ""
                    }`}
                    onClick={card.action}
                    onMouseEnter={() => setActiveCard(card.id)}
                    onMouseLeave={() => setActiveCard(null)}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div
                        className={`p-2 sm:p-3 ${card.bgColor} rounded-lg text-white group-hover:scale-105 transition-transform flex-shrink-0`}
                      >
                        {card.icon}
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                            card.status === "Online"
                              ? "bg-green-100 text-green-800"
                              : card.status === "Active"
                              ? "bg-blue-100 text-blue-800"
                              : card.status === "Updated"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {card.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#D7D7D7] group-hover:text-[#273F4F] group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#273F4F] mb-2 group-hover:text-[#447D9B] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[#447D9B] text-sm mb-3 sm:mb-4 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-600 font-medium">
                        {card.stats.label}
                      </span>
                      <span className="text-sm font-semibold text-[#273F4F]">
                        {card.stats.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar - Responsive Spacing */}
            <div className="space-y-4 sm:space-y-6 mt-6 lg:mt-0">
              {/* Activity Log - Responsive */}
              <div className="bg-white border border-[#D7D7D7] rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-[#273F4F]">
                    Activity Log
                  </h3>
                  <Activity className="w-4 h-4 text-[#447D9B] flex-shrink-0" />
                </div>
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                          activity.type === "complaint"
                            ? "bg-red-100 text-red-600"
                            : activity.type === "chat"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "security"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#273F4F] truncate">
                          {activity.title}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 space-y-1 sm:space-y-0">
                          <p className="text-xs text-[#447D9B] truncate">
                            {activity.time}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                activity.status === "In Review"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : activity.status === "Pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : activity.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {activity.status}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                activity.priority === "High"
                                  ? "bg-red-500"
                                  : activity.priority === "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact - Responsive */}
              <div className="bg-[#273F4F] rounded-lg p-4 sm:p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                    <Phone className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold truncate">
                      Emergency Helpline
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm">
                      24/7 Crisis Support
                    </p>
                  </div>
                </div>
                <p className="text-sm mb-4 text-white/90 leading-relaxed">
                  Immediate assistance available. All calls are confidential and
                  secure.
                </p>
                <button className="w-full bg-[#FE7743] hover:bg-[#e56633] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Call: 1800-XXX-XXXX
                  </span>
                </button>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <span className="text-white/80 text-xs sm:text-sm">
                      Encrypted & Anonymous
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice - Responsive */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Privacy Notice
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your data is protected with end-to-end encryption. Only
                      authorized personnel have access to your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeviDashboard;
