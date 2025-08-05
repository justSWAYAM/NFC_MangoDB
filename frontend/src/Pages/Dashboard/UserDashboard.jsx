import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../../../firebase.js";

const UserDashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          navigate("/auth");
          return;
        }

        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data.role);

          if (data.role !== "User") {
            navigate("/unauthorized");
          } else {
            setLoading(false);
          }
        } else {
          navigate("/auth");
        }
      });
    };

    checkUserRole();
  }, [navigate]);

  if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white p-8"
      style={{ backgroundImage: "url('/women_empowerment.jpg')" }}
    >
      <div className="bg-black/60 rounded-xl p-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>

        <ul className="space-y-4 text-lg">
          <li className="bg-white/10 p-4 rounded-lg">🔍 Track Previous Complaints</li>
          <li className="bg-white/10 p-4 rounded-lg">📝 Enter a New Complaint</li>
          <li className="bg-white/10 p-4 rounded-lg">🤝 Connect to an NGO</li>
          <li className="bg-white/10 p-4 rounded-lg">📄 Download Help Documents</li>
          <li className="bg-white/10 p-4 rounded-lg">📢 Awareness Campaigns Near You</li>
          <li className="bg-white/10 p-4 rounded-lg">💬 Chat with Assigned Volunteer</li>
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
