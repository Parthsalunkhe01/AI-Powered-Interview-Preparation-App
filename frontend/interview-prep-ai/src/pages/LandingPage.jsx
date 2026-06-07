import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  FileDown, 
  Brain, 
  Sparkles, 
  Code, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe
} from "lucide-react";
import { UserContext } from "../context/userContext";
import LandingNavbar from "../components/layouts/LandingNavbar";
import HERO_IMG from "../assets/hero-img.png";
import logo from "../assets/logo.png";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      title: "AI Mock Interviews",
      description: "Realistic, role-based interview practice that adapts to your skill level.",
      icon: Brain,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25"
    },
    {
      title: "Performance Reports",
      description: "Detailed feedback on your technical skills, communication, and confidence.",
      icon: TrendingUp,
      color: "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/25"
    },
    {
      title: "PDF Download",
      description: "Export full study guides, interview reports, and mock questions directly to PDFs.",
      icon: FileDown,
      color: "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-violet-500/25"
    },
    {
      title: "Skill Guides",
      description: "Learn more with AI-curated resources on specific technical topics.",
      icon: Cpu,
      color: "bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-rose-500/25"
    },
    {
      title: "Instant Feedback",
      description: "Get immediate tips and better ways to explain complex technical answers.",
      icon: Sparkles,
      color: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-orange-500/25"
    },
    {
      title: "Score Comparison",
      description: "See how you perform compared to industry standards and other students.",
      icon: Globe,
      color: "bg-gradient-to-br from-cyan-400 to-sky-600 text-white shadow-cyan-500/25"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <LandingNavbar />

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-grid">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-white shadow-sm text-primary text-xs font-bold uppercase tracking-widest mb-8">
              <Zap className="h-3 w-3 fill-primary" />
              Empowering Future Engineers
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 leading-[1.1] sm:leading-[0.95] bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500">
              Ace Your Next <br />
              <span className="text-primary italic">Technical</span> Interview.
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              The smartest way to prepare for technical interviews. 
              Practice with AI, get instant feedback, and land your dream job.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 flex items-center justify-center gap-3 group"
              >
                Get Started for Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto h-16 px-10 bg-white border border-slate-200 text-slate-800 shadow-sm rounded-2xl font-bold text-lg transition-all hover:bg-slate-50 flex items-center justify-center gap-3"
              >
                See How it Works
              </button>
            </div>
          </motion.div>
        </div>
      </section>



      {/* ── Features Grid ── */}
      <section id="features" className="py-24 relative border-t border-slate-200/60 bg-white/30 backdrop-blur-3xl">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Personalized Interview Prep.
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              We've simplified the entire interview preparation process—from learning basics to final practice sessions. 
              Practical tools for real-world results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[32px] border border-slate-200/60 bg-white shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all group"
              >
                <div className={`h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 lg:p-24 rounded-[40px] sm:rounded-[60px] bg-gradient-to-br from-indigo-500 to-cyan-500 relative overflow-hidden shadow-2xl shadow-indigo-500/30 text-center border border-indigo-400/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-7xl font-black text-white tracking-tighter mb-6 sm:mb-8 leading-tight">
                Ready to Boost Your <br className="hidden sm:block" />
                Interview Skills?
              </h2>
              <button 
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-12 bg-white text-indigo-600 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center mx-auto"
              >
                Start Practicing Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-slate-200/60 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg flex items-center justify-center">
               <img src={logo} alt="InterviewAI Logo" className="h-full w-full object-contain rounded-lg" />
             </div>
             <span className="font-bold tracking-tighter text-lg">AI-powered Interview Prep</span>
          </div>
          
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center md:text-left">
            © 2026 AiEvaluators Labs — All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
