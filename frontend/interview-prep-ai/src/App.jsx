import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout"; // ✅ ADD THIS

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Home/DashBoard2";
import InterviewPrep from "./pages/InterviewPre/InterviewPrep";
import InterviewBlueprintPage from "./pages/Home/InterviewBlueprintPage";
import InterviewSetup from "./pages/AIInterviewer/InterviewSetup";
import InterviewSession from "./pages/AIInterviewer/InterviewSession";
import InterviewFeedback from "./pages/AIInterviewer/InterviewFeedback";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Layout wrapped routes */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/blueprint"
          element={
            <Layout>
              <InterviewBlueprintPage />
            </Layout>
          }
        />

        <Route
          path="/interview-prep/:sessionId"
          element={
            <Layout>
              <InterviewPrep />
            </Layout>
          }
        />

        <Route
          path="/ai-interview/setup"
          element={
            <Layout>
              <InterviewSetup />
            </Layout>
          }
        />

        <Route
          path="/ai-interview/session/:sessionId"
          element={
            <Layout>
              <InterviewSession />
            </Layout>
          }
        />

        <Route
          path="/ai-interview/feedback/:sessionId"
          element={
            <Layout>
              <InterviewFeedback />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;