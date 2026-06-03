import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  Heart,
  User,
  PlusCircle,
  LogOut,
  MapPin,
  Calendar,
  Layers,
  Activity,
  Trash2,
  Users,
  Search,
  Filter,
  Check,
  Building,
  Bell,
  Clock,
  ArrowRight
} from "lucide-react";

import { UserProfile, Donation, SystemStats } from "./types";
import MapWidget from "./components/MapWidget";
import Leaderboard from "./components/Leaderboard";
import ChatWidget from "./components/ChatWidget";
import AIScannerPlayground from "./components/AIScannerPlayground";

export default function App() {
  // Navigation & session state
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<
    "landing" | "dashboard" | "create_donation" | "ngo_browse" | "volunteer_tasks" | "leaderboard" | "scanner_playground" | "analytics" | "admin"
  >("landing");

  // Authentication inputs
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [regRole, setRegRole] = useState<"donor" | "ngo" | "volunteer">("donor");
  const [organizationInput, setOrganizationInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App global state data
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalDonations: 120,
    totalMealsSaved: 4800,
    foodWasteReductionKg: 1400,
    activeNGOsCount: 8,
    activeVolunteersCount: 22
  });

  // Filters for browse
  const [searchQuery, setSearchQuery] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState<"all" | "Veg" | "Non-Veg">("all");

  // Selected details modal
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Form states for creating donation
  const [foodName, setFoodName] = useState("");
  const [foodType, setFoodType] = useState<"Veg" | "Non-Veg">("Veg");
  const [quantity, setQuantity] = useState("");
  const [peopleServed, setPeopleServed] = useState(20);
  const [pickupAddress, setPickupAddress] = useState("");
  const [expiryHours, setExpiryHours] = useState("4");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState("https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

  // Alerts inbox state
  const [alerts, setAlerts] = useState<{ id: string; text: string; time: string }[]>([
    { id: "1", text: "Welcome to Save N Serve! Select your community role to start listing or reclaiming meals.", time: "Just now" },
    { id: "2", text: "Green Garden Bistro created a fresh Basmati Biryani donation. Smart Matching recommends prioritizing Priya's Feed Mumbai NGO.", time: "10 mins ago" }
  ]);

  // Vetting list for admin
  const [ngoApplicants, setNgoApplicants] = useState<UserProfile[]>([]);

  // Sample Food Image Gallery for fast, high-quality listings
  const sampleImages = [
    { label: "Rice / Biryani", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { label: "Pasta & Baked Meals", url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { label: "Bread / Buns / Roti", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { label: "Snacks / Sandwiches", url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
  ];

  // Load app status data on load or state updates
  const loadData = () => {
    fetch("/api/donations")
      .then((res) => res.json())
      .then((data) => setDonations(data))
      .catch((err) => console.error(err));

    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));

    fetch("/api/admin/ngos")
      .then((res) => res.json())
      .then((data) => setNgoApplicants(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  // Set default initial user profile simulation if they use Google auth mock
  const handleGoogleAuth = () => {
    const userEmail = "anug08771@gmail.com"; // runtime direct bootstrapped owner
    setAuthSessionUser(userEmail, "Anug (Platform Owner)", "admin");
    setShowAuthModal(false);
  };

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setAuthSessionUser(emailInput, nameInput || emailInput.split("@")[0], regRole);
    setShowAuthModal(false);
  };

  const setAuthSessionUser = (email: string, name: string, role: string) => {
    fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role })
    })
      .then((res) => res.json())
      .then((data) => {
        setSessionUser(data);
        setActiveTab("dashboard");
        // Welcome notification alert triggers
        setAlerts((prev) => [
          { id: Math.random().toString(), text: `Authenticated as ${data.name} with ${data.role.toUpperCase()} privileges enabled.`, time: "Just now" },
          ...prev
        ]);
      })
      .catch((err) => console.error(err));
  };

  const logout = () => {
    setSessionUser(null);
    setActiveTab("landing");
  };

  // Helper: Fast role switcher utility for testing loops easily
  const forceSwitchRole = (newRole: "donor" | "ngo" | "volunteer" | "admin") => {
    if (!sessionUser) return;
    fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: sessionUser.id,
        updates: { role: newRole }
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setSessionUser(data);
        loadData();
      });
  };

  // Create Donation Submission
  const handleCreateDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser || !foodName || !quantity) return;
    setIsSubmittingDonation(true);

    const payload = {
      foodName,
      foodType,
      quantity,
      numberPeopleServed: peopleServed,
      pickupAddress: pickupAddress || "Senapati Bapat Marg, Lower Parel, Mumbai",
      expiryHours,
      description,
      imageUrl: selectedImage,
      donorId: sessionUser.id,
      donorName: sessionUser.organizationName || sessionUser.name,
      donorPhone: sessionUser.phone || "+91 99999 88888"
    };

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      // Update local state list and nav back
      setDonations((prev) => [data, ...prev]);
      setIsSubmittingDonation(false);
      setActiveTab("dashboard");
      
      // Clear inputs
      setFoodName("");
      setQuantity("");
      setDescription("");
      setPeopleServed(20);

      // Trigger pop-up alert
      setAlerts((prev) => [
        { id: Math.random().toString(), text: `Successfully posted ${foodName}! Save N Serve AI is matching recommended drivers & nearby NGOs.`, time: "Just now" },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      setIsSubmittingDonation(false);
    }
  };

  // Accept Donation Trigger (NGO Action)
  const acceptDonation = (id: string) => {
    if (!sessionUser) return;
    fetch(`/api/donations/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Accepted",
        ngoId: sessionUser.id,
        ngoName: sessionUser.organizationName || sessionUser.name
      })
    })
      .then((res) => res.json())
      .then((updated) => {
        setDonations((prev) => prev.map((d) => (d.id === id ? updated : d)));
        if (selectedDonation?.id === id) setSelectedDonation(updated);
        // Alert trigger
        setAlerts((prev) => [
          { id: Math.random().toString(), text: `Task claimed! ${updated.foodName} has changed status to ACCEPTED. Direct logistics line opened.`, time: "Just now" },
          ...prev
        ]);
      });
  };

  // Volunteer Pick up / delivery workflows
  const updateDonationStatus = (id: string, nextStatus: "Picked Up" | "Delivered" | "Completed") => {
    if (!sessionUser) return;
    const body: any = { status: nextStatus };
    if (nextStatus === "Picked Up") {
      body.volunteerId = sessionUser.id;
      body.volunteerName = sessionUser.name;
    }

    fetch(`/api/donations/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then((res) => res.json())
      .then((updated) => {
        setDonations((prev) => prev.map((d) => (d.id === id ? updated : d)));
        if (selectedDonation?.id === id) setSelectedDonation(updated);
        setAlerts((prev) => [
          { id: Math.random().toString(), text: `Transit update for ${updated.foodName}: Checked and shifted to [${nextStatus}].`, time: "Just now" },
          ...prev
        ]);
      });
  };

  // NGO Approve workflow (Admin)
  const verifyNGO = (id: string, isVerified: boolean) => {
    fetch("/api/admin/ngos/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ngoId: id, isVerified })
    })
      .then((res) => res.json())
      .then(() => {
        loadData();
        setAlerts((prev) => [
          { id: Math.random().toString(), text: `NGO partnership vetting log verified successfully. Vetted credentials flag active.`, time: "Just now" },
          ...prev
        ]);
      });
  };

  // NGO/Volunteer available tasks sorting filters
  const filteredDonations = donations.filter((d) => {
    const matchesSearch = d.foodName.toLowerCase().includes(searchQuery.toLowerCase()) || d.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = foodTypeFilter === "all" || d.foodType === foodTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="full_app_container" className="min-h-screen bg-lime-50/40 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* 1. BRAND SUPERHEADER HEADER */}
      <header className="bg-white border-b border-lime-100/80 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab(sessionUser ? "dashboard" : "landing")}>
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-lime-500 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/10 scale-100 hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <span className="text-base font-extrabold font-display tracking-tight text-slate-800 flex items-center gap-1">
                Save N Serve <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded ml-1 font-mono uppercase font-bold tracking-wider">Full-stack AI</span>
              </span>
              <p className="text-[9px] text-emerald-600 font-medium">Bridges Donors, NGOs, and Volunteers</p>
            </div>
          </div>

          {/* Quick Stats Ticker for authenticated layout */}
          {sessionUser && (
            <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-5 py-1.5 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> <b>{stats.totalMealsSaved}</b> Meals Saved</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-600" /> <b>{stats.foodWasteReductionKg} KG</b> CO2 prevented</span>
            </div>
          )}

          {/* User Session Controller */}
          <div className="flex items-center gap-3">
            {sessionUser ? (
              <div className="flex items-center gap-3">
                
                {/* DEV ROLE-SWITCHER HUD GADGET */}
                <div className="bg-amber-50 border border-amber-200/50 rounded-2xl px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-900 shadow-sm">
                  <span className="uppercase text-[8px] font-mono tracking-wider text-amber-500">Fast Testing Control</span>
                  <select
                    value={sessionUser.role}
                    onChange={(e) => forceSwitchRole(e.target.value as any)}
                    className="bg-white border border-amber-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-[10px]"
                  >
                    <option value="donor">Donor (Bistro)</option>
                    <option value="ngo">NGO Partner</option>
                    <option value="volunteer">Volunteer Driver</option>
                    <option value="admin">App Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1.5 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                    {sessionUser.name[0]}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-[11px] font-bold text-slate-800 truncate max-w-[80px]">{sessionUser.name}</p>
                    <span className="text-[8px] font-mono text-emerald-600 uppercase font-bold tracking-widest">{sessionUser.role}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 hover:scale-[1.02] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-1 cursor-pointer font-display"
              >
                Sign In / Register <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. AUTHENTICATION POPUP DIALOG */}
      {showAuthModal && (
        <div id="auth_portal_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-lime-100 shadow-xl overflow-hidden p-6 md:p-8 flex flex-col gap-5 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold p-1 bg-slate-100 rounded-full w-7 h-7 flex items-center justify-center"
            >
              ×
            </button>

            <div className="text-center">
              <span className="text-2xl">🌱</span>
              <h3 className="text-xl font-bold font-display text-slate-800 mt-2">Join Save N Serve</h3>
              <p className="text-xs text-slate-500 mt-1">Select your focus role and register your details securely</p>
            </div>

            {/* Google Quick Sign-In action */}
            <button
              onClick={handleGoogleAuth}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl text-xs font-bold font-display text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.65 1.58 14.97 1 12 1 7.28 1 3.26 3.72 1.3 7.72l3.82 2.96C6.06 7.4 8.78 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.69 2.86c2.16-1.99 3.74-4.91 3.74-8.53z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.12 14.76c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.3 7.18C.47 8.8.01 10.6.01 12.5s.46 3.7 1.29 5.32l3.82-3.06z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-3.96 1.09-3.22 0-5.94-2.36-6.91-5.64L1.58 15.7C3.54 19.72 7.56 23 12 23z"
                />
              </svg>
              Quick Google Sign-In (Simulation)
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-[1px] bg-slate-200 flex-1"></div>
              <span>OR USE REGISTER FORM</span>
              <div className="h-[1px] bg-slate-200 flex-1"></div>
            </div>

            <form onSubmit={handleCustomAuth} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("donor")}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border cursor-pointer ${
                      regRole === "donor" ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🏠 Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("ngo")}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border cursor-pointer ${
                      regRole === "ngo" ? "bg-[#0284c7]/10 border-blue-500 text-[#0284c7] shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🏢 NGO Org
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("volunteer")}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border cursor-pointer ${
                      regRole === "volunteer" ? "bg-amber-50 border-amber-500 text-amber-800 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🛵 Rider
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@organization.com"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                />
              </div>

              {regRole === "ngo" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NGO Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Feeding Hearts Charity"
                    required={regRole === "ngo"}
                    value={organizationInput}
                    onChange={(e) => setOrganizationInput(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                  />
                  <p className="text-[9px] text-[#0284c7] mt-1">💡 All registered NGOs will require verification by our admin team before accepting food bags.</p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold font-display shadow-md transition-all cursor-pointer"
              >
                Register & Initialize Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. CORE ROUTING CANVAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        
        {/* Dynamic Global Tab Navigation for Authenticated User */}
        {sessionUser && (
          <div className="flex flex-wrap gap-2 text-xs bg-white border border-lime-100 rounded-3xl p-3 shadow-sm">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all ${
                activeTab === "dashboard"
                  ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
              }`}
            >
              🏠 Live Dashboard
            </button>

            {sessionUser.role === "donor" && (
              <button
                onClick={() => setActiveTab("create_donation")}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === "create_donation"
                    ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" /> List Fresh Meal Box
              </button>
            )}

            {sessionUser.role === "ngo" && (
              <button
                onClick={() => setActiveTab("ngo_browse")}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === "ngo_browse"
                    ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
                }`}
              >
                <Search className="w-4 h-4 text-emerald-600" /> Search Meals Registry
              </button>
            )}

            {sessionUser.role === "volunteer" && (
              <button
                onClick={() => setActiveTab("volunteer_tasks")}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === "volunteer_tasks"
                    ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600" /> Deliveries Pipeline
              </button>
            )}

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "leaderboard"
                  ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
              }`}
            >
              <Award className="w-4 h-4 text-emerald-500" /> Claim Rewards & Certificates
            </button>

            <button
              onClick={() => setActiveTab("scanner_playground")}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "scanner_playground"
                  ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI Scanner Playground
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-emerald-700 text-white font-bold shadow-md scale-[1.01]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 font-semibold"
              }`}
            >
              <Activity className="w-4 h-4 text-blue-500" /> Metrics Charts
            </button>

            {sessionUser.role === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-display cursor-pointer transition-all flex items-center gap-1 ${
                  activeTab === "admin"
                    ? "bg-red-700 text-white font-bold shadow-md scale-[1.01]"
                    : "bg-red-50 text-red-900 border border-red-200/50 font-semibold"
                }`}
              >
                🛡️ Admin Panels
              </button>
            )}
          </div>
        )}
        
        {/* LANDING PAGE MISSION BOARD */}
        {activeTab === "landing" && (
          <div id="landing_hero" className="flex flex-col gap-10 py-10">
            
            {/* Visual Mission Intro */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-lime-100 rounded-[40px] p-6 md:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Heart className="w-96 h-96 text-emerald-600" />
              </div>

              <div className="lg:col-span-7 flex flex-col items-start gap-5">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1">
                  🌱 Serving Humanity Since 2026
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold font-display leading-[1.1] text-slate-900 tracking-tight">
                  Leftovers aren't waste. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-lime-600">They are a lifeline.</span>
                </h1>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
                  Save N Serve leverages advanced Gemini AI quality indexes and smart mapping interfaces to instantly capture hot excess buffet prep from hotels/weddings and wire it safely to nearby community free kitchens.
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 hover:scale-[1.01] active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer font-display"
                  >
                    Connect Wallet / Start Gifting <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab("scanner_playground")}
                    className="px-6 py-3.5 bg-[#f0fdf4] hover:bg-emerald-100/50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 transition-all cursor-pointer font-display"
                  >
                    Assess Food Qualities Live
                  </button>
                </div>
              </div>

              {/* Big Hero Banner Image */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-600 to-lime-400 rounded-3xl blur opacity-25"></div>
                <img
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Save N Serve charity delivery"
                  className="rounded-3xl shadow-lg border border-lime-100 w-full aspect-video md:aspect-[4/3] object-cover relative z-10"
                />
              </div>
            </div>

            {/* Platform metrics panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-lime-100 p-5 rounded-3xl text-center shadow-sm">
                <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-widest">Total Food Donations</p>
                <h3 className="text-2xl font-black text-emerald-800 mt-1 font-mono">{stats.totalDonations}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-display">Active hotel listings</span>
              </div>
              <div className="bg-white border border-lime-100 p-5 rounded-3xl text-center shadow-sm">
                <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-widest">Distributed Servings</p>
                <h3 className="text-2xl font-black text-emerald-800 mt-1 font-mono">{stats.totalMealsSaved} Meals</h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-display">Zero Hunger driven</span>
              </div>
              <div className="bg-white border border-lime-100 p-5 rounded-3xl text-center shadow-sm">
                <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-widest">Emissions Avoidance</p>
                <h3 className="text-2xl font-black text-emerald-800 mt-1 font-mono">{stats.foodWasteReductionKg} KG CO2</h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-display">Environmental offset</span>
              </div>
              <div className="bg-white border border-lime-100 p-5 rounded-3xl text-center shadow-sm">
                <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-widest">Verified Partnerships</p>
                <h3 className="text-2xl font-black text-[#0284c7] mt-1 font-mono">{stats.activeNGOsCount + stats.activeVolunteersCount} Active NGO/Rider</h3>
                <span className="text-[10px] text-blue-600 font-semibold font-display">Vetted security logs</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. MAIN USER DASHBOARD */}
        {sessionUser && activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            
            {/* Main view layout grid: Splits between primary views and alerts inbox sidebars */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* PRIMARY LEFT WORKSPACE SUMMARY */}
              <div className="lg:col-span-8 flex flex-col gap-6">

                {/* Dashboard Intro Widget */}
                <div className="bg-white border border-lime-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-800">Welcome back, {sessionUser.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Role Privilege: <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase text-[9px] font-mono">{sessionUser.role}</span>
                      {sessionUser.organizationName && ` | Organization: ${sessionUser.organizationName}`}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl px-4 py-2 border border-amber-200">
                    <p className="text-[10px] text-amber-800 uppercase font-bold tracking-widest">Honor Balance</p>
                    <p className="text-lg font-black text-amber-900 font-display leading-tight">{sessionUser.points} XP</p>
                  </div>
                </div>

                {/* ROLE CONTROLLER VIEW: DONOR FLOWS */}
                {sessionUser.role === "donor" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-[#1e293b]">My Food Listings ({donations.filter(d => d.donorId === sessionUser.id).length})</h4>
                      <button
                        onClick={() => setActiveTab("create_donation")}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> List New leftover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {donations
                        .filter((d) => d.donorId === sessionUser.id)
                        .map((d) => (
                          <div key={d.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <div className="p-4 flex gap-3">
                              <img
                                referrerPolicy="no-referrer"
                                src={d.imageUrl}
                                alt={d.foodName}
                                className="w-20 h-20 object-cover rounded-2xl border border-slate-100 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  d.foodType === "Veg" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                }`}>
                                  {d.foodType}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{d.foodName}</h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Quantity: {d.quantity}</p>
                                
                                <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  d.status === "Pending" ? "bg-amber-50 text-amber-800 border-amber-200" :
                                  d.status === "Accepted" ? "bg-sky-50 text-sky-800 border-sky-200" :
                                  d.status === "Completed" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-blue-50 text-blue-800"
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                            </div>

                            {/* Actions bar */}
                            <div className="bg-slate-50/50 border-t border-slate-100/60 p-3.5 flex justify-between items-center">
                              <button
                                onClick={() => setSelectedDonation(d)}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                              >
                                View Logistics details <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      {donations.filter(d => d.donorId === sessionUser.id).length === 0 && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center col-span-2">
                          <p className="text-xs text-slate-500">You haven't listed any surplus buffet foods yet.</p>
                          <button
                            onClick={() => setActiveTab("create_donation")}
                            className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Create First Listing
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ROLE CONTROLLER VIEW: NGO FLOWS */}
                {sessionUser.role === "ngo" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-slate-800">My Claimed Shipments ({donations.filter(d => d.ngoId === sessionUser.id).length})</h4>
                      <button
                        onClick={() => setActiveTab("ngo_browse")}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" /> Claim Available Food Bags
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {donations
                        .filter((d) => d.ngoId === sessionUser.id)
                        .map((d) => (
                          <div key={d.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <div className="p-4 flex gap-3">
                              <img
                                referrerPolicy="no-referrer"
                                src={d.imageUrl}
                                alt={d.foodName}
                                className="w-20 h-20 object-cover rounded-2xl border border-slate-100 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  d.foodType === "Veg" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                }`}>
                                  {d.foodType}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{d.foodName}</h4>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Quantity: {d.quantity}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5 truncate">Source: {d.donorName}</p>

                                <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  d.status === "Accepted" ? "bg-sky-50 text-sky-800 border-sky-200 animate-pulse" :
                                  d.status === "Completed" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-blue-50 text-blue-800"
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 p-3.5 flex justify-between items-center">
                              <button
                                onClick={() => setSelectedDonation(d)}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                              >
                                Live GPS Tracker & Chat <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      {donations.filter(d => d.ngoId === sessionUser.id).length === 0 && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center col-span-2">
                          <p className="text-xs text-slate-500">You haven't claimed any active shipments yet.</p>
                          <button
                            onClick={() => setActiveTab("ngo_browse")}
                            className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Explore Available Foods
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ROLE CONTROLLER VIEW: VOLUNTEER WORKFLOW */}
                {sessionUser.role === "volunteer" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-slate-800">My Pickups & Task Tracker</h4>
                      <button
                        onClick={() => setActiveTab("ngo_browse")}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" /> Claim Nearby Deliveries
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {donations
                        .filter((d) => d.volunteerId === sessionUser.id)
                        .map((d) => (
                          <div key={d.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <div className="p-4 flex gap-3">
                              <img
                                referrerPolicy="no-referrer"
                                src={d.imageUrl}
                                alt={d.foodName}
                                className="w-20 h-20 object-cover rounded-2xl border border-slate-100 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">{d.foodName}</h4>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Quantity: {d.quantity}</p>
                                <p className="text-[10px] text-[indigo-700] mt-0.5">Pickup: {d.donorName}</p>
                                <p className="text-[10px] text-emerald-800">Deliver: {d.ngoName || "Awaiting NGO Assignee"}</p>
                                
                                <span className="inline-block mt-2 text-[9px] bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded uppercase font-bold">
                                  {d.status}
                                </span>
                              </div>
                            </div>

                            <div className="bg-indigo-50/45 border-t border-indigo-100/50 p-3.5 flex justify-between items-center">
                              <button
                                onClick={() => setSelectedDonation(d)}
                                className="text-xs font-bold text-indigo-800 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                              >
                                Open Navigation Dashboard <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      {donations.filter(d => d.volunteerId === sessionUser.id).length === 0 && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center col-span-2">
                          <p className="text-xs text-slate-500">No deliveries currently assigned to you.</p>
                          <button
                            onClick={() => setActiveTab("ngo_browse")}
                            className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Reclaim Nearby Tasks
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* DIRECT SIDEBAR ALERTS & INBOX SUMMARY */}
              <div className="lg:col-span-4 flex flex-col gap-6">

                {/* Simulated notifications widget */}
                <div id="alerts_widget" className="bg-white rounded-3xl p-5 border border-lime-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Bell className="w-4.5 h-4.5 text-emerald-600" /> Notifications Feed
                    </h4>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">Active Sim</span>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {alerts.map((al) => (
                      <div key={al.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0 animate-ping"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">{al.text}</p>
                          <span className="text-[8px] text-slate-400 font-mono mt-1 block">{al.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct quick matching diagnostic indicator */}
                <div className="bg-[#f0fdf4] border border-emerald-200 rounded-3xl p-5 text-left flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">💡</div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Gemini Matching Hub</h4>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    AI uses live geometry indexes to find optimal transport routes, reducing meal decay by avoiding traffic delays.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 5. CREATE DONATION FORM SECTION */}
        {activeTab === "create_donation" && (
          <div className="bg-white rounded-3xl border border-lime-100 shadow-sm p-6 max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-800 flex items-center gap-2"><PlusCircle className="text-emerald-700 w-5 h-5" /> Pack & List Surplus Foods</h3>
                <p className="text-xs text-slate-500 mt-1">AI checks fresh ratios and predicts expiry timelines automatically</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Back to Inbox
              </button>
            </div>

            <form onSubmit={handleCreateDonationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Food Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Paneer Biryani"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Quantity (KG / Boxes) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12 KG"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Veg / Non-Veg *</label>
                    <select
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                    >
                      <option value="Veg">🥕 Vegetarian</option>
                      <option value="Non-Veg">🍗 Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Est. Servings Pack *</label>
                    <input
                      type="number"
                      required
                      min={5}
                      value={peopleServed}
                      onChange={(e) => setPeopleServed(Number(e.target.value))}
                      className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Suggested Max Expiry (Hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pickup Location Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Green Garden Cafeteria, Lower Parel, Mumbai"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cook parameters / Allergens Info *</label>
                  <textarea
                    placeholder="e.g. Cooked and blast-chilled immediately at 14:00 today. Packed in safe airtight boxes."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 min-h-[90px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Select Visual Food Thumbnail</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img.url)}
                        className={`border rounded-xl overflow-hidden p-1 transition-all cursor-pointer ${
                          selectedImage === img.url ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img referrerPolicy="no-referrer" src={img.url} alt={img.label} className="w-full h-10 object-cover rounded-lg" />
                        <span className="text-[8px] text-slate-500 truncate block mt-1 text-center font-medium">{img.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDonation}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 font-display mt-auto shadow-md"
                >
                  {isSubmittingDonation ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" /> Performing AI Fresh check...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" /> Finalize Listing & Launch AI Match
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 6. Browse available donations registry (NGO/Volunteer UI) */}
        {activeTab === "ngo_browse" && (
          <div className="flex flex-col gap-6">
            
            <div className="bg-white border border-lime-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">Browse Available Excess Foods</h3>
                <p className="text-xs text-slate-500 mt-1">One-click claim to launch immediate local rider support channels</p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Search query input */}
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by meal name or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                  />
                </div>

                {/* Type Filter togglers */}
                <select
                  value={foodTypeFilter}
                  onChange={(e) => setFoodTypeFilter(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none"
                >
                  <option value="all">🍅 All Food Types</option>
                  <option value="Veg">🥕 Veggie Only</option>
                  <option value="Non-Veg">🍗 Chicken / Meat</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((d) => {
                const isClaimedByMe = d.ngoId === sessionUser?.id || d.volunteerId === sessionUser?.id;
                const canNGOClaim = sessionUser?.role === "ngo" && !d.ngoId;
                const canVolunteerClaim = sessionUser?.role === "volunteer" && d.ngoId && !d.volunteerId;

                return (
                  <div key={d.id} id={`donation_card_${d.id}`} className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-all">
                    
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative">
                        <img referrerPolicy="no-referrer" src={d.imageUrl} alt={d.foodName} className="w-full h-44 object-cover" />
                        <span className={`absolute top-3 left-3 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          d.foodType === "Veg" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                        }`}>
                          {d.foodType}
                        </span>
                        
                        {d.aiAssessment && (
                          <div className="absolute top-3 right-3 bg-slate-900/90 text-white px-2.5 py-1 rounded-xl text-[10px] font-mono flex items-center gap-1 font-semibold">
                            <Sparkles className="w-3 h-3 text-emerald-400" /> {d.aiAssessment.qualityScore}% AI Fresh
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex flex-col gap-2">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight truncate">{d.foodName}</h4>
                        
                        <div className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl text-[11px] font-medium my-1">
                          <span className="text-slate-500 font-mono">Weight: <b>{d.quantity}</b></span>
                          <span className="text-emerald-800 font-sans">Feeds: <b>~{d.numberPeopleServed} pack</b></span>
                        </div>

                        <div className="flex gap-2 items-start mt-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-zinc-400 flex-shrink-0" />
                          <p className="text-[11px] text-slate-500 truncate font-medium">{d.pickupAddress}</p>
                        </div>

                        <div className="flex gap-2 items-center text-[10px] text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Expires at: {new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {d.aiAssessment && (
                          <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/30 text-[10px] text-emerald-800 leading-relaxed mt-2.5">
                            <b>AI Rec:</b> {d.aiAssessment.matchingNgoRecommendation}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Claim CTAs */}
                    <div className="bg-slate-50 border-t border-slate-100 p-4">
                      {isClaimedByMe ? (
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="w-full py-2.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Already claimed. Open Logistics Map
                        </button>
                      ) : canNGOClaim ? (
                        <button
                          onClick={() => acceptDonation(d.id)}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1 font-display"
                        >
                          Accept Bag & Claim (One-click)
                        </button>
                      ) : canVolunteerClaim ? (
                        <button
                          onClick={() => updateDonationStatus(d.id, "Picked Up")}
                          className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1 font-display animate-pulse-subtle"
                        >
                          Accept Task & Deliver (Rider)
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
                        >
                          {d.status === "Pending" ? "Awaiting NGO verification" : `In transit with volunteer`}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}

              {filteredDonations.length === 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center col-span-3">
                  <p className="text-xs text-slate-500">No surplus food logs match current queries.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VOLUNTEER TASKS STANDALONE PANEL */}
        {sessionUser && activeTab === "volunteer_tasks" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-bold text-slate-800">My Pickups & Task Tracker</h4>
                  <button
                    onClick={() => setActiveTab("ngo_browse")}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" /> Claim Nearby Deliveries
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {donations
                    .filter((d) => d.volunteerId === sessionUser.id)
                    .map((d) => (
                      <div key={d.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className="p-4 flex gap-3">
                          <img
                            referrerPolicy="no-referrer"
                            src={d.imageUrl}
                            alt={d.foodName}
                            className="w-20 h-20 object-cover rounded-2xl border border-slate-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{d.foodName}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Quantity: {d.quantity}</p>
                            <p className="text-[10px] text-[indigo-700] mt-0.5">Pickup: {d.donorName}</p>
                            <p className="text-[10px] text-emerald-800">Deliver: {d.ngoName || "Awaiting NGO Assignee"}</p>
                            
                            <span className="inline-block mt-2 text-[9px] bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded uppercase font-bold">
                              {d.status}
                            </span>
                          </div>
                        </div>

                        <div className="bg-indigo-50/45 border-t border-indigo-100/50 p-3.5 flex justify-between items-center">
                          <button
                            onClick={() => setSelectedDonation(d)}
                            className="text-xs font-bold text-indigo-800 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                          >
                            Open Navigation Dashboard <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {donations.filter(d => d.volunteerId === sessionUser.id).length === 0 && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center col-span-2">
                      <p className="text-xs text-slate-500">No deliveries currently assigned to you.</p>
                      <button
                        onClick={() => setActiveTab("ngo_browse")}
                        className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Reclaim Nearby Tasks
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DIRECT SIDEBAR ALERTS & INBOX SUMMARY FOR VOLUNTEER TAB */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div id="alerts_widget_vol" className="bg-white rounded-3xl p-5 border border-lime-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-4.5 h-4.5 text-emerald-600" /> Notifications Feed
                  </h4>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">Active Sim</span>
                </div>

                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {alerts.map((al) => (
                    <div key={al.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0 animate-ping"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{al.text}</p>
                        <span className="text-[8px] text-slate-400 font-mono mt-1 block">{al.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. LEADERBOARD REWARDS PANEL */}
        {activeTab === "leaderboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <Leaderboard currentUser={sessionUser} />
            </div>
            <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col gap-4">
              <h4 className="font-display font-bold text-slate-800">Save N Serve Carbon Scorecard</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We offset environmental footprints by capturing prepared foods before decomposition sets in. Landfill rot decomposes into active Methane which holds 25x higher heat traps than straight CO2.
              </p>
              <div className="h-[1px] bg-slate-100"></div>
              
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono font-bold">Your Total Footprint Prevention</span>
                <p className="text-xl font-bold font-mono text-emerald-800 mt-1">{(sessionUser.points * 0.15).toFixed(1)} KG CO₂</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono font-bold">Rider Contributed Hours Equivalent</span>
                <p className="text-base font-bold font-mono text-emerald-800">{(sessionUser.points * 0.05).toFixed(1)} delivery hours</p>
              </div>
            </div>
          </div>
        )}

        {/* 8. AI SCANNER PLAYGROUND SCREEN */}
        {activeTab === "scanner_playground" && (
          <div className="flex flex-col gap-6">
            <AIScannerPlayground />
          </div>
        )}

        {/* 9. ANALYTICS METRICS CHART PANEL */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-lime-100 rounded-3xl p-5 shadow-sm">
              <h3 className="font-display font-extrabold text-lg text-slate-800">Save N Serve Food Rescue Index</h3>
              <p className="text-xs text-slate-500 mt-1">Real-time charts illustrating food waste prevents and volunteer routing offsets</p>
            </div>

            {/* Simulated analytics charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: Month by month savings */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-mono">Monthly Meals Reclaimed</h4>
                  <p className="text-xl font-black text-emerald-800 font-display mt-1">~4.8K Servings Distributed</p>
                </div>
                
                {/* SVG Pure Vector Chart */}
                <div className="w-full aspect-[4/2] bg-slate-50 border border-slate-100/60 rounded-2xl p-4 my-4 flex items-end justify-between relative">
                  <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-400">Total Servings Pack</div>
                  
                  {/* Bar vectors */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 bg-emerald-200 rounded-t-lg transition-all duration-500" style={{ height: "45px" }} />
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Jan</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 bg-emerald-300 rounded-t-lg transition-all duration-500" style={{ height: "70px" }} />
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Feb</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 bg-emerald-500 rounded-t-lg transition-all duration-500" style={{ height: "110px" }} />
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Mar</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 bg-emerald-700 rounded-t-lg transition-all duration-500" style={{ height: "140px" }} />
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Apr</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Category Breakdown */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-mono">Rescued Food Category Weight</h4>
                  <p className="text-xl font-black text-[#0284c7] font-display mt-1">68% Cooked Grains & curries</p>
                </div>

                <div className="w-full aspect-[4/2] bg-slate-50 border border-slate-100/60 rounded-2xl p-6 my-4 flex justify-between items-center">
                  <div className="flex-1 max-w-[120px]">
                    <div className="w-24 h-24 rounded-full border-8 border-emerald-600 border-t-amber-600 border-r-indigo-600 animate-spin" style={{ animationDuration: '10s' }} />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block"></span>
                      <span>Rice/Grains: <b>68%</b></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 bg-amber-600 rounded-full inline-block"></span>
                      <span>Breads/Roti: <b>22%</b></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span>
                      <span>Flesh Poultry: <b>10%</b></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 10. SYSTEM ADMIN PANEL WORKSPACE SCREEN */}
        {sessionUser && activeTab === "admin" && (
          <div className="flex flex-col gap-6">
            
            <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-display font-extrabold text-[#991b1b]">App Administration Command Center</h3>
                <p className="text-xs text-slate-500 mt-1">Vetting and approve NGOs, monitor active listings, and review logs</p>
              </div>
              <span className="bg-red-50 text-red-800 text-[10px] font-mono px-3 py-1 rounded-full font-bold">Privileged Root Console</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* NGO vetting list */}
              <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
                <h4 className="font-display font-bold text-slate-800 mb-4">Pending NGO Approvals ({ngoApplicants.filter(n => !n.isVerifiedNGO).length})</h4>
                
                <div className="flex flex-col gap-3">
                  {ngoApplicants.map((ngo) => (
                    <div key={ngo.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{ngo.organizationName || ngo.name}</h5>
                        <p className="text-[10px] text-slate-500">Contact Email: {ngo.email} | Tel: {ngo.phone}</p>
                        
                        <div className="flex gap-2 mt-2">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                            ngo.isVerifiedNGO ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                          }`}>
                            {ngo.isVerifiedNGO ? "VERIFIED VETTEE" : "AWAITING CREDENTIAL CHECK"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!ngo.isVerifiedNGO ? (
                          <button
                            onClick={() => verifyNGO(ngo.id, true)}
                            className="px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                          >
                            Approve Partnership
                          </button>
                        ) : (
                          <button
                            onClick={() => verifyNGO(ngo.id, false)}
                            className="px-4.5 py-2 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Block Partner
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {ngoApplicants.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">No pending NGO registration files currently registered.</p>
                  )}
                </div>
              </div>

              {/* Admin system actions logs */}
              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
                <h4 className="font-display font-bold text-slate-800">Direct System Analytics Audit</h4>
                
                <div className="bg-slate-50/60 p-4 border border-slate-100 rounded-2xl flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Vetted NGO Partners</span>
                    <h5 className="text-base font-bold text-slate-800">{ngoApplicants.filter(n => n.isVerifiedNGO).length} verified</h5>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Volunteer Riders Count</span>
                    <h5 className="text-base font-bold text-slate-800">{stats.activeVolunteersCount} active</h5>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-red-50 text-red-900 border border-red-100 p-3 rounded-xl text-xs font-medium">
                  <span>🛡️ Root credentials verified for live audit compliance on Senapati road.</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* 11. DETAILED TRACKER LOGISTICS DETAILED POPUP MODAL (MAPS & DIRECT CHAT COOPERATIVE BOX) */}
      {selectedDonation && (
        <div id="logistics_detail_modal_container" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-4xl w-full border border-lime-100 shadow-2xl overflow-hidden p-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold cursor-pointer"
            >
              ×
            </button>

            <div className="pb-4 border-b border-slate-100 mb-6 text-left">
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                selectedDonation.foodType === "Veg" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {selectedDonation.foodType}
              </span>
              <h3 className="font-display font-extrabold text-lg text-slate-800 mt-1">{selectedDonation.foodName}</h3>
              <p className="text-xs text-slate-400">Listed by {selectedDonation.donorName} | Weight: {selectedDonation.quantity}</p>
            </div>

            {/* Split layout: Live Map Widget on the Left, Coordination Chat Widget on the Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-7">
                <MapWidget
                  pickupAddress={selectedDonation.pickupAddress}
                  status={selectedDonation.status}
                  onTaskCompleted={() => {
                    const statusCycle: any = {
                      "Accepted": "Picked Up",
                      "Picked Up": "Delivered",
                      "Delivered": "Completed"
                    };
                    const next = statusCycle[selectedDonation.status];
                    if (next) {
                      updateDonationStatus(selectedDonation.id, next);
                    }
                  }}
                />
              </div>

              <div className="lg:col-span-5">
                <ChatWidget donationId={selectedDonation.id} currentUser={sessionUser || { id: "anon", name: "Guest", role: "donor", email: "", points: 0, badges: [], createdAt: "" }} />
              </div>

            </div>

            {/* AI Diagnostics details card footer inside details */}
            {selectedDonation.aiAssessment && (
              <div className="mt-6 bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-4 text-left flex gap-3.5 items-start">
                <div className="p-2 bg-emerald-200 text-emerald-800 rounded-xl mt-0.5 font-bold">🤖</div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-widest font-mono">Gemini AI Safety Audit Summary</h4>
                  <ul className="text-xs text-emerald-900 leading-relaxed space-y-1 mt-1.5 list-disc pl-4">
                    <li>Assessment Fresh Match Check: <b>Verified ({selectedDonation.aiAssessment.qualityScore}% Safety rating)</b></li>
                    <li>Risk Evaluation Warnings: <b>{selectedDonation.aiAssessment.spoilageSignsDetected && selectedDonation.aiAssessment.spoilageSignsDetected.length > 0 ? selectedDonation.aiAssessment.spoilageSignsDetected.join(", ") : "Zero staling detected."}</b></li>
                    <li>Predicted Safe consumption envelope: <b>{selectedDonation.aiAssessment.suggestedConsumptionWindow}</b></li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FOOTER CREDITS */}
      <footer className="bg-white border-t border-lime-100/60 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p>© 2026 Save N Serve Platform • Carbon-Neutral Food Distribution Services • Made using advanced Gemini-Flash Diagnostics</p>
        </div>
      </footer>

    </div>
  );
}
