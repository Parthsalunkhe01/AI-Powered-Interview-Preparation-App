import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import { Menu, X, ArrowRight } from "lucide-react";

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-slate-200/60 py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105 no-underline">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center">
            <img src={logo} alt="InterviewAI" className="h-full w-full object-contain rounded-xl" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            InterviewAI
          </span>
        </Link>


        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/signup")}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center gap-2 group"
          >
            Try for Free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200/60 shadow-lg overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">

              <button 
                onClick={() => navigate("/login")}
                className="text-left font-bold text-lg text-muted-foreground"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate("/signup")}
                className="bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
