import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserContext } from "./context/userContext";

import DashboardLayout from "./components/DashboardLayout"; 
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Home/DashBoard";
import InterviewPrep from "./pages/InterviewPre/InterviewPrep";
import InterviewBlueprintPage from "./pages/Home/InterviewBlueprintPage";
import InterviewSetup from "./pages/AIInterviewer/InterviewSetup";
import InterviewSession from "./pages/AIInterviewer/InterviewSession";
import InterviewFeedback from "./pages/AIInterviewer/InterviewFeedback";
import ResourcesPage from "./pages/ResourcesPage";
import ResourcesQuestions from "./pages/ResourcesQuestions";
import ContactUsPage from "./pages/ContactUsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

// ── Protected Route Wrapper ──
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  
  if (loading) return null; // Or a high-pro loader
  if (!user) return <Navigate to="/login" replace />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0d0d0f",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "16px 24px",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)"
          },
        }} 
      />
      
      <Routes>
        {/* Public Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected SaaS Workspace */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/blueprint" element={<ProtectedRoute><InterviewBlueprintPage /></ProtectedRoute>} />
        
        <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
        <Route path="/resources/questions" element={<ProtectedRoute><ResourcesQuestions /></ProtectedRoute>} />
        
        <Route path="/ai-interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
        <Route path="/ai-interview/session/:sessionId" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
        <Route path="/ai-interview/feedback/:sessionId" element={<ProtectedRoute><InterviewFeedback /></ProtectedRoute>} />
        
        <Route path="/interview-prep/:sessionId" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactUsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
