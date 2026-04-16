import React, { useState, useEffect, useRef, useContext } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  Code,
  Sparkles,
  Info,
  RefreshCw,
  Terminal,
  Zap,
  Cpu,
  Target,
  BarChart3,
  ChevronRight,
  Library,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import SaaSCard from "../components/ui/SaaSCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/button";
import { UserContext } from "../context/userContext";


export default function ResourcesQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [data, setData] = useState({
    blueprint: null,
    questions: []
  });
  const [expandedId, setExpandedId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
        setData({ blueprint: null, questions: [] });
        hasFetched.current = false;
        return;
    }

    if (hasFetched.current) return;

    const storedData = localStorage.getItem("interviewData");
    if (!storedData) return;

    let currentData;
    try {
      currentData = JSON.parse(storedData);
    } catch (e) {
      console.error("Failed to parse interviewData from localStorage", e);
      return;
    }

    if (!currentData || !currentData.questions || currentData.questions.length === 0) return;

    setData(currentData);

    const firstQ = currentData.questions[0];
    const needsGeneration = !firstQ?.detailedAnswer || typeof firstQ?.detailedAnswer === 'string';

    if (needsGeneration) {
      hasFetched.current = true;
      generateAllAnswers(currentData);
    } else {
      hasFetched.current = true;
    }
  }, [user?.id]);

  const generateAllAnswers = async (targetData) => {
    try {
      setGenerating(true);
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_ANSWERS, {
        questions: targetData.questions,
        role: targetData.blueprint?.targetRole || targetData.blueprint?.role || "Software Engineer",
        topics: targetData.blueprint?.skills?.join(", ") || targetData.blueprint?.topicsToFocus || "General Concepts"
      });

      if (response.data && response.data.answers) {
        const updatedData = {
          ...targetData,
          questions: response.data.answers
        };
        setData(updatedData);
        localStorage.setItem("interviewData", JSON.stringify(updatedData));
      }
    } catch (err) {
      console.error("Error generating detailed answers:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSingleRetry = async (unresolvedQuestions) => {
    try {
      setGenerating(true);
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_ANSWERS, {
        questions: unresolvedQuestions,
        role: blueprint?.targetRole || blueprint?.role || "Software Engineer",
        topics: blueprint?.skills?.join(", ") || blueprint?.topicsToFocus || "General Concepts"
      });

      if (response.data && response.data.answers) {
        // Merge the new successful answers back into the main data
        const newAnswersMap = {};
        response.data.answers.forEach(a => {
            newAnswersMap[a.question.toLowerCase()] = a.detailedAnswer;
        });

        const updatedQuestions = questions.map(q => {
            const qText = q.question || q;
            const match = newAnswersMap[qText.toLowerCase()];
            if (match && !match.explanation.includes("could not be generated")) {
                return {
                    ...q,
                    detailedAnswer: match
                };
            }
            return q;
        });

        const updatedData = {
          ...data,
          questions: updatedQuestions
        };
        setData(updatedData);
        localStorage.setItem("interviewData", JSON.stringify(updatedData));
        toast.success("Intelligence recovered!");
      }
    } catch (err) {
      console.error("Single retry failed:", err);
      toast.error("Recovery failed. System is still experiencing turbulence.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!data.questions || data.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8">
          <div className="h-20 w-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-2xl">
              <Library className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter">Roadmap Unavailable</h1>
              <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                  No operational data detected. Complete a simulation session to generate your personalized technical deep-dives.
              </p>
          </div>
          <Button size="lg" variant="saas" onClick={() => navigate("/dashboard")}>
              Return to Command <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    );
  }

  const { blueprint, questions } = data;

  return (
    <div className="space-y-12 pb-24">
      {/* Loading Overlay */}
      <AnimatePresence>
        {generating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl space-y-8"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Cpu className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-full shadow-2xl">
                <RefreshCw className="h-5 w-5 text-white animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase tracking-[0.2em]">Synthesizing Intelligence</h2>
              <p className="text-muted-foreground font-medium italic">Architecting master-level technical deep-dives for {questions.length} domains...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-1 space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
          <div className="space-y-6">
            <button
              onClick={() => navigate("/resources")}
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-[10px] uppercase tracking-[0.3em]"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Library
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="purple">Advanced Intelligence</Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                {blueprint?.targetRole || blueprint?.role || "Software Engineer"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Badge variant="outline" className="px-4 py-1.5 bg-white/5">Exp: {blueprint?.experienceLevel || blueprint?.experience || "Any"}</Badge>
                <Badge variant="info" className="px-4 py-1.5">{questions.length} Strategic Domains</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-6">
          {questions.map((item, idx) => {
            const isExpanded = expandedId === idx;
            const qText = item.question || item;
            const detailed = item.detailedAnswer;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SaaSCard className={`overflow-hidden transition-all duration-500 !p-0 ${
                  isExpanded ? 'ring-2 ring-primary/20 shadow-2xl shadow-primary/5' : 'hover:border-primary/20'
                }`}>
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left px-8 py-8 flex items-center justify-between gap-6 group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                        isExpanded ? 'bg-primary border-primary text-white rotate-12 scale-110 shadow-xl shadow-primary/30' : 'bg-white/5 border-white/5 text-muted-foreground group-hover:text-primary group-hover:border-primary/20'
                      }`}>
                        <span className="text-base font-black italic">Q{idx + 1}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                            item.difficulty === 'hard' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            item.difficulty === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {item.difficulty || "medium"}
                          </span>
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                            • {item.type || "logic node"}
                          </span>
                        </div>
                        <h3 className={`text-xl font-black tracking-tight leading-snug transition-colors duration-500 ${
                          isExpanded ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'
                        }`}>
                          {qText}
                        </h3>
                      </div>
                    </div>
                    <div className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 transition-all duration-500 ${isExpanded ? 'rotate-180 border-primary/20 bg-primary/10' : ''}`}>
                      <ChevronDown className={`h-5 w-5 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && detailed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-10 pb-10 pt-2 space-y-10 animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full" />
                          
                          <div className="space-y-12">
                            {/* Master Explanation */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-3 px-1">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Master Perspective</span>
                              </div>
                              <div className="text-foreground/80 leading-relaxed text-lg font-medium space-y-5 italic border-l-2 border-primary/20 pl-8">
                                {detailed.explanation.includes("could not be generated") ? (
                                  <div className="space-y-6 pt-2 not-italic">
                                    <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-4">
                                        <AlertCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <p className="text-rose-200 font-bold">Signal Interference Detected</p>
                                            <p className="text-sm text-rose-200/60 leading-relaxed">
                                                Our AI nodes failed to architect a deep-dive for this specific domain. This usually happens during high network volatility.
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSingleRetry([questions[idx]]);
                                        }}
                                        className="w-full bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 text-rose-400 font-black uppercase tracking-widest"
                                    >
                                        <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                                        Regenerate Intelligence
                                    </Button>
                                  </div>
                                ) : (
                                  detailed.explanation.split('\n').map((paragraph, pIdx) => (
                                    <p key={pIdx}>{paragraph}</p>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Practical Insights Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 space-y-5 hover:bg-emerald-500/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Key Insights</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {detailed.keyInsights?.map((insight, kit) => (
                                          <li key={kit} className="flex items-start gap-3 group/li">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40 mt-2 group-hover/li:bg-emerald-400 transition-colors" />
                                            <span className="text-sm text-foreground/70 font-medium leading-relaxed">{insight}</span>
                                          </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-8 rounded-[32px] bg-amber-500/5 border border-amber-500/10 space-y-5 hover:bg-amber-500/10 transition-colors">
                                    <div className="flex items-center gap-3 text-amber-400">
                                        <Lightbulb className="h-5 w-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Tactical Edge</span>
                                    </div>
                                    <p className="text-lg text-amber-100/80 font-bold italic leading-relaxed">
                                        "{detailed.interviewerTip || "Focus on the strategic trade-offs of this approach."}"
                                    </p>
                                </div>
                            </div>

                            {/* Code Implementation */}
                            {detailed.codeExample && (
                              <div className="space-y-6">
                                  <div className="flex items-center gap-3 px-1">
                                      <Terminal className="h-5 w-5 text-primary" />
                                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Implementation Syntax</span>
                                  </div>
                                  <div className="relative group/code">
                                    <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/30 to-blue-400/30 rounded-[32px] blur-sm opacity-0 group-hover/code:opacity-100 transition duration-700" />
                                    <div className="relative bg-black/40 border border-white/5 rounded-[32px] p-8 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner ring-1 ring-white/5">
                                        <code className="text-primary/90">{detailed.codeExample}</code>
                                        <div className="absolute top-4 right-6 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500/40" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500/40" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                                        </div>
                                    </div>
                                  </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SaaSCard>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

