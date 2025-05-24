import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch, clearToken, isAuthenticated } from "../auth";
import SentimentDashboard from "../components/SentimentDashboard";
import {logo} from '../assets';
import Header from "../components/Header";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("")
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
    if (username !== "") {
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await authFetch("/api/auth/me");
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
        if (data.role == "enterprise") {
          setRole("Enterprise")
        }
        else {
          setRole("User")
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  });

  useEffect(() => {
    function handleClickOutside(event) {
        if (profileMenuOpen && !event.target.closest('.relative')) {
        setProfileMenuOpen(false);
        }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [profileMenuOpen]);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <main className="min-h-screen dark:bg-gray-800">
      {/* Header */}
      <Header username={username} email={email} role={role} handleLogout={handleLogout} />

      {/* Dashboard */}
      <SentimentDashboard />
    </main>
  );
}
