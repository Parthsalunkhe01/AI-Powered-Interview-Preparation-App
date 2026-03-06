import React, { useState, useContext } from "react";
import HERO_IMG from "../assets/hero-img.png";
import { APP_FEATURES } from "../utils/data";
import { useNavigate } from "react-router-dom";
import { LuSparkles } from "react-icons/lu";
import Modal from "../components/Modal";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import { UserContext } from "../context/userContext";
import Navbar from "../components/layouts/Navbar";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      {/* Shared Navbar */}
      <Navbar onLoginClick={() => setOpenAuthModal(true)} />

      <div className="w-full min-h-full relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f1827 0%, #141c2e 40%, #111928 100%)' }}>
        <div className="w-[600px] h-[600px] blur-[100px] absolute top-0 left-0" style={{ background: 'radial-gradient(circle, rgba(255,147,36,0.08) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-4 pt-6 pb-[200px] relative z-10">

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 pr-4 mb-8 md:mb-0">
              <div className="flex items-center justify-start mb-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold px-3 py-1 rounded-full" style={{ color: '#818CF8', background: 'rgba(74,124,247,0.12)', border: '1px solid rgba(74,124,247,0.3)' }}>
                  <LuSparkles /> AI Powered
                </div>
              </div>

              <h1 className="text-5xl font-medium mb-6 leading-tight" style={{ color: '#f1f5f9' }}>
                Ace Interviews with <br />
                <span className="text-transparent bg-clip-text font-semibold" style={{ backgroundImage: 'linear-gradient(135deg, #4A7CF7 0%, #818CF8 100%)' }}>
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
            </div>

            <div className="w-full md:w-1/2">
              <p className="text-[17px] mr-0 md:mr-20 mb-6" style={{ color: '#94a3b8' }}>
                Get role-specified questions, expand answers when you need them,
                dive deeper into concepts, and organize everything your way.
                From preparation to mastery – your ultimate interview toolkit is here.
              </p>

              <button
                className="text-sm font-semibold text-white px-7 py-2.5 rounded-full cursor-pointer transition-all"
                style={{ background: 'linear-gradient(135deg, #4A7CF7 0%, #818CF8 100%)', boxShadow: '0 4px 20px rgba(74,124,247,0.35)' }}
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full min-h-full relative z-10">
        <section className="flex items-center justify-center -mt-36">
          <img
            src={HERO_IMG}
            alt="Hero"
            className="w-[80vw] rounded-lg"
          />
        </section>

        {/* Features Section */}
        <div className="w-full mt-10" style={{ background: '#0f1827' }}>
          <div className="container mx-auto px-4 pt-10 pb-20">
            <section className="mt-5">
              <h2 className="text-2xl font-medium text-center mb-12" style={{ color: '#f1f5f9' }}>
                Features That Make You Shine
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-8">
                {APP_FEATURES.slice(0, 3).map((feature) => (
                  <div
                    key={feature.id}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,124,247,0.12)', borderRadius: '16px', padding: '24px', transition: 'all 0.2s ease', cursor: 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,124,247,0.06)'; e.currentTarget.style.border = '1px solid rgba(74,124,247,0.28)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.border = '1px solid rgba(74,124,247,0.12)'; }}
                  >
                    <h3 className="text-base font-semibold mb-3" style={{ color: '#f1f5f9' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#7a8faa' }}>{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {APP_FEATURES.slice(3).map((feature) => (
                  <div
                    key={feature.id}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,124,247,0.12)', borderRadius: '16px', padding: '24px', transition: 'all 0.2s ease', cursor: 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,124,247,0.06)'; e.currentTarget.style.border = '1px solid rgba(74,124,247,0.28)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.border = '1px solid rgba(74,124,247,0.12)'; }}
                  >
                    <h3 className="text-base font-semibold mb-3" style={{ color: '#f1f5f9' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#7a8faa' }}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-center p-5 mt-5" style={{ background: '#0a1020', color: '#4a5a70', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          Made with ♥ — Interview Prep AI
        </div>
      </div>

      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && (
            <Login setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "signUp" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;
