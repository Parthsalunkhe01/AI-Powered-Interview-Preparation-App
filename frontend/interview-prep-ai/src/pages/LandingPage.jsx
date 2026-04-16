import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
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
      title: "AI Simulations",
      description: "Real-time, role-aware interview simulations that adapt to your experience level.",
      icon: Brain,
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      title: "Intelligence Reports",
      description: "Deep analytics on your technical signals, communication, and confidence.",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400"
    },
    {
      title: "Career Blueprints",
      description: "Custom-tailored roadmaps designed specifically for your target roles.",
      icon: Target,
      color: "bg-purple-500/10 text-purple-400"
    },
    {
      title: "Technical Deep-Dives",
      description: "Expand your knowledge with AI-curated resources on specific engineering concepts.",
      icon: Cpu,
      color: "bg-rose-500/10 text-rose-400"
    },
    {
      title: "Real-Time Feedback",
      description: "Get instant corrections and improved ways to articulate complex technical answers.",
      icon: Sparkles,
      color: "bg-amber-500/10 text-amber-400"
    },
    {
      title: "Global Benchmarks",
      description: "Compare your performance against anonymized data from the industry's best.",
      icon: Globe,
      color: "bg-cyan-500/10 text-cyan-400"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground font-sans selection:bg-primary/30">
      <LandingNavbar />

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-grid">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-8 animate-pulse">
              <Zap className="h-3 w-3 fill-primary" />
              Engineered for Excellence
            </div>
            
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.95] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Ace Your Next <br />
              <span className="text-primary italic">Intelligence</span> Interview.
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              The world's most advanced AI-powered platform for technical interview mastery. 
              Built for high-performing engineers who don't settle for average.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 flex items-center justify-center gap-3 group"
              >
                Initialize Beta Access <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto h-16 px-10 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-lg transition-all hover:bg-white/10 flex items-center justify-center gap-3"
              >
                Explore Modules
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="pb-32 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative rounded-[40px] border border-white/10 p-2 bg-[#121216] shadow-2xl overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src={HERO_IMG} 
              alt="Platform Interface" 
              className="w-full rounded-[30px] border border-white/5"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Protocol Driven Preparation.
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              We've automated the entire interview lifecycle—from foundational mapping to final evaluation. 
              No generic theory. Just tactical mission parameters.
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
                className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/20 transition-all group"
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="p-12 lg:p-24 rounded-[60px] bg-gradient-to-br from-primary to-blue-500 relative overflow-hidden shadow-2xl shadow-primary/30 text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
                Ready to Upgrade Your <br />
                Professional Protocol?
              </h2>
              <button 
                onClick={() => navigate("/signup")}
                className="h-16 px-12 bg-white text-primary rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                Launch Intelligence Suite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-white/5 bg-[#09090b]/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
               <Zap className="h-4 w-4 text-primary fill-primary" />
             </div>
             <span className="font-black tracking-tighter text-lg">AI-powered Interview Prep</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-bold text-muted-foreground">
             <a href="#" className="hover:text-primary transition-colors">Twitter</a>
             <a href="#" className="hover:text-primary transition-colors">GitHub</a>
             <a href="#" className="hover:text-primary transition-colors">Discord</a>
          </div>
          
          <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
            © 2026 DCODEX Labs — All Protocols Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
