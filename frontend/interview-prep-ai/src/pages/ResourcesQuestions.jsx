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
import { Button } from "../components/ui/Button";
import { UserContext } from "../context/userContext";


import Mermaid from "../components/ui/Mermaid";
import { 
  History, 
  Map, 
  AlertTriangle, 
  Clock, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Layers,
  Repeat
} from "lucide-react";

export default function ResourcesQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [data, setData] = useState({
    blueprint: null,
    questions: [],
    performanceLevel: "average"
  });
  const [expandedId, setExpandedId] = useState(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
        setData({ blueprint: null, questions: [], performanceLevel: "average" });
        hasFetched.current = false;
        return;
    }

    if (hasFetched.current) return;

    // Prefer data passed via React Router navigation state (from ResourcesPage)
    let currentData = null;
    if (location.state?.questions && location.state.questions.length > 0) {
      const rawQs = location.state.questions;
      const qTexts = rawQs
        .map(q => (q && typeof q === 'object' ? q.question : q))
        .filter(Boolean);
      currentData = {
        blueprint: location.state.blueprint || null,
        questions: qTexts,
      };
    } else {
      // Only read localStorage if user has navigated here organically
      // (localStorage is cleared on login so this data always belongs to current user)
      const storedData = localStorage.getItem("interviewData");
      if (!storedData) {
        // No data at all — mark as fetched so we show the empty state
        hasFetched.current = true;
        return;
      }
      try {
        currentData = JSON.parse(storedData);
      } catch (e) {
        console.error("Failed to parse interviewData from localStorage", e);
        hasFetched.current = true;
        return;
      }
    }

    if (!currentData || !currentData.questions || currentData.questions.length === 0) {
      hasFetched.current = true;
      return;
    }

    // Detect performance level from assessment if available
    const avgScore = currentData.assessment?.overallScore || 50;
    const performanceLevel = avgScore < 45 ? "weak" : avgScore > 80 ? "strong" : "average";
    
    setData({ ...currentData, performanceLevel });

    const firstQ = currentData.questions[0];
    const needsGeneration = !firstQ?.detailedAnswer || !firstQ?.detailedAnswer.idealInterviewAnswer;

    if (needsGeneration) {
      hasFetched.current = true;
      generateAllAnswers({ ...currentData, performanceLevel });
    } else {
      hasFetched.current = true;
    }
  }, [user?.id]);

  const generateAllAnswers = async (targetData) => {
    const questions = targetData.questions || [];
    if (!questions.length) return;

    const role = targetData.blueprint?.targetRole || targetData.blueprint?.role || "Software Engineer";
    const topics = targetData.blueprint?.skills?.join(", ") || targetData.blueprint?.topicsToFocus || "General Concepts";
    const performanceLevel = targetData.performanceLevel || "average";

    // Normalize: q can be a plain string OR an object {question, difficulty, ...}
    // Spreading a string gives {0:'c',1:'h',...} which crashes React — always use object form
    const toQObj = (q) => typeof q === "string" ? { question: q } : (q && typeof q === "object" ? q : { question: String(q) });

    setTotalCount(questions.length);
    setLoadedCount(0);
    setData(prev => ({
      ...prev,
      questions: questions.map(q => ({ ...toQObj(q), _loading: true }))
    }));

    const promises = questions.map(async (q, idx) => {
      const qObj = toQObj(q);
      const qText = qObj.question || "";

      try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_ANSWERS, {
          questions: [qText],   // always send plain text string to backend
          role,
          topics,
          performanceLevel
        });
        const answer = response.data?.answers?.[0];
        setData(prev => {
          const updated = [...prev.questions];
          updated[idx] = answer
            ? { ...answer, _loading: false }
            : { ...qObj, _loading: false };
          return { ...prev, questions: updated };
        });
      } catch {
        setData(prev => {
          const updated = [...prev.questions];
          updated[idx] = { ...qObj, _loading: false };
          return { ...prev, questions: updated };
        });
      } finally {
        setLoadedCount(prev => prev + 1);
      }
    });

    await Promise.allSettled(promises);

    setData(prev => {
      localStorage.setItem("interviewData", JSON.stringify({ ...targetData, questions: prev.questions }));
      return prev;
    });
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!data.questions || data.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[22px] sm:rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
              <Library className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
          </div>
          <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Study Plan Unavailable</h1>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-sm mx-auto leading-relaxed">
                  No interview data found. Complete a mock interview first to see your personalized study guide.
              </p>
          </div>
          <Button size="lg" variant="saas" onClick={() => navigate("/dashboard")}>
              Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    );
  }

  const { blueprint, questions, performanceLevel } = data;

  return (
    <div className="space-y-6 sm:space-y-12 pb-12 sm:pb-24">
      {/* Progress bar — visible while any question is still loading */}
      <AnimatePresence>
        {totalCount > 0 && loadedCount < totalCount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-50 px-3 sm:px-4"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-2xl px-3 sm:px-4 py-2 shadow-sm">
                <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    animate={{ width: `${(loadedCount / totalCount) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0">
                  {loadedCount}/{totalCount} answers ready
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-0 sm:px-1 space-y-6 sm:space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-8">
          <div className="space-y-3 sm:space-y-6">
            <button
              onClick={() => navigate("/resources")}
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-[10px] uppercase tracking-[0.3em]"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Library
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="purple">Personalized Path</Badge>
                <Badge variant="outline" className="capitalize text-[10px] font-black">{performanceLevel} Performance detected</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight sm:leading-none">
                {blueprint?.targetRole || blueprint?.role || "Software Engineer"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-3">
                <Badge variant="info" className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs">{questions.length} Concepts</Badge>
                <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/5 text-[10px] sm:text-xs">Level: {blueprint?.experienceLevel || "Professional"}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-8">
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
                  isExpanded ? 'ring-2 ring-indigo-200 shadow-2xl border-transparent' : 'hover:border-slate-300'
                }`}>
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left px-4 py-5 sm:px-8 sm:py-7 flex items-center justify-between gap-3 sm:gap-6 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                      <div className={`shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                        isExpanded ? 'bg-indigo-600 border-indigo-600 text-white rotate-12 scale-110 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200'
                      }`}>
                        <span className="text-sm font-bold italic">{idx + 1}</span>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border ${
                            item.difficulty === 'hard' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                            item.difficulty === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                            'bg-emerald-50 border-emerald-200 text-emerald-600'
                          }`}>
                            {item.difficulty || "medium"}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {item.duration || "4 mins"}
                          </span>
                          {item.importance === "High" && (
                            <Badge variant="destructive" className="text-[8px] h-4 sm:h-5">High Importance</Badge>
                          )}
                        </div>
                        <h3 className={`text-base sm:text-lg font-bold tracking-tight leading-snug transition-colors duration-500 ${
                          isExpanded ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {qText}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-transform duration-500 text-slate-300 ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Skeleton while this question's answer is loading */}
                        {item._loading ? (
                          <div className="px-4 sm:px-10 pb-8 sm:pb-12 pt-2 space-y-4 sm:space-y-6 animate-pulse">
                            <div className="h-px bg-slate-100" />
                            <div className="h-24 sm:h-28 rounded-2xl sm:rounded-[28px] bg-slate-100" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                              <div className="space-y-3">
                                <div className="h-4 w-1/3 rounded bg-slate-100" />
                                <div className="h-20 rounded-2xl bg-slate-100" />
                              </div>
                              <div className="h-32 rounded-2xl sm:rounded-[28px] bg-slate-100" />
                            </div>
                          </div>
                        ) : detailed ? (
                        <div className="px-4 sm:px-10 pb-8 sm:pb-12 pt-2 space-y-6 sm:space-y-12">
                          <div className="h-px bg-slate-100 w-full" />
                          
                          {/* Ideal Answer Section */}
                          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[32px] bg-indigo-50 border border-indigo-100 space-y-3 sm:space-y-4 relative overflow-hidden group/ideal">
                             <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover/ideal:opacity-20 transition-opacity">
                                <Sparkles className="h-16 w-16 sm:h-24 sm:w-24 text-indigo-600" />
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ideal Interview Answer</span>
                             </div>
                             <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed italic">
                                {`"${detailed.idealInterviewAnswer}"`}
                             </p>
                             <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
                                {item.companyTags?.map(tag => (
                                  <span key={tag} className="text-[9px] font-bold text-indigo-500 bg-white border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> {tag}
                                  </span>
                                ))}
                             </div>
                          </div>

                          {/* Architecture Section — only render if diagram is valid Mermaid syntax */}
                          {detailed.architectureDiagram &&
                           typeof detailed.architectureDiagram === 'string' &&
                           detailed.architectureDiagram.trim().length > 10 &&
                           /^(graph |flowchart |sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap)/i.test(detailed.architectureDiagram.trim()) && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                   <Layers className="h-5 w-5 text-indigo-600" />
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Visual Architecture</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                   <div className="lg:col-span-2">
                                      <Mermaid chart={detailed.architectureDiagram} />
                                   </div>
                                   <div className="space-y-6">
                                      <div className="flex items-center gap-2">
                                         <Map className="h-4 w-4 text-emerald-600" />
                                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">How to Draw This</span>
                                      </div>
                                      <div className="space-y-4">
                                         {detailed.howToDrawStepByStep?.map((step, si) => (
                                            <div key={si} className="flex gap-4 group/step">
                                               <span className="text-xs font-black text-slate-300 group-hover/step:text-emerald-500 transition-colors">{si+1}</span>
                                               <p className="text-sm text-slate-600 font-medium leading-relaxed">{step}</p>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                            </div>
                          )}

                          {/* Explanation Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                             <div className="space-y-5 sm:space-y-8">
                                <div className="space-y-3 sm:space-y-4">
                                   <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-indigo-600" />
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Breakdown</span>
                                   </div>
                                   <div className="prose prose-slate max-w-none">
                                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                                         {detailed.explanation}
                                      </p>
                                   </div>
                                </div>

                                {detailed.detailedSections?.map((section, si) => (
                                   <div key={si} className="space-y-2 sm:space-y-3">
                                      <h4 className="text-sm font-black text-slate-900 border-l-2 border-indigo-500 pl-3 sm:pl-4">{section.title}</h4>
                                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3 sm:pl-4">{section.content}</p>
                                   </div>
                                ))}
                             </div>

                             <div className="space-y-5 sm:space-y-8">
                                {/* Insights Panel */}
                                <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[40px] bg-slate-50 border border-slate-100 space-y-5 sm:space-y-8">
                                   <div className="space-y-3 sm:space-y-4">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key Insights</span>
                                      <div className="space-y-4 sm:space-y-6">
                                         <div>
                                            <p className="text-[10px] font-bold text-indigo-600 mb-2">Scalability</p>
                                            <div className="flex flex-wrap gap-2">
                                               {detailed.keyInsights?.scalabilityConcepts?.map(c => <Badge key={c} variant="outline" className="bg-white">{c}</Badge>)}
                                            </div>
                                         </div>
                                         <div>
                                            <p className="text-[10px] font-bold text-emerald-600 mb-2">Production Concerns</p>
                                            <div className="flex flex-wrap gap-2">
                                               {detailed.productionConcerns?.map(c => <Badge key={c} variant="saas" className="h-6">{c}</Badge>)}
                                            </div>
                                         </div>
                                      </div>
                                   </div>

                                   <div className="pt-6 border-t border-slate-200">
                                      <div className="flex items-center gap-2 mb-4">
                                         <AlertTriangle className="h-4 w-4 text-rose-500" />
                                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Mistakes to Avoid</span>
                                      </div>
                                      <ul className="space-y-3">
                                         {detailed.commonMistakes?.map((m, mi) => (
                                            <li key={mi} className="text-xs text-slate-500 font-medium flex items-start gap-2">
                                               <span className="h-1 w-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                               {m}
                                            </li>
                                         ))}
                                      </ul>
                                   </div>
                                </div>

                                {/* Tech Stack */}
                                <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100/50 flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                         <Zap className="h-5 w-5 text-amber-600" />
                                      </div>
                                      <div>
                                         <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Suggested Stack</p>
                                         <p className="text-sm font-bold text-slate-700">{detailed.suggestedTechStack}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Bottom Interaction Area */}
                          <div className="flex flex-col md:flex-row gap-4 sm:gap-8 pt-4 sm:pt-6">
                             <div className="flex-1 p-4 sm:p-8 rounded-2xl sm:rounded-[32px] bg-slate-900 text-white space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <Repeat className="h-4 w-4 text-indigo-400" />
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follow-Up Questions</span>
                                   </div>
                                   <Badge variant="purple" className="h-5">Deep Dive</Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                   {detailed.possibleFollowUps?.map((f, fi) => (
                                      <div key={fi} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group/fu cursor-pointer">
                                         <p className="text-xs sm:text-sm font-medium text-slate-200">{f}</p>
                                         <ArrowRight className="h-4 w-4 text-indigo-400 opacity-0 group-hover/fu:opacity-100 transition-opacity shrink-0 ml-2" />
                                      </div>
                                   ))}
                                </div>
                             </div>

                             <div className="w-full md:w-72 lg:w-80 p-4 sm:p-8 rounded-2xl sm:rounded-[32px] bg-emerald-50 border border-emerald-100 flex flex-col justify-between gap-4">
                                <div className="space-y-3 sm:space-y-4">
                                   <div className="flex items-center gap-2">
                                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Production Ready</span>
                                   </div>
                                   <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                                      Real-world: {detailed.realWorldExample}
                                   </p>
                                </div>
                                <div className="pt-4 sm:pt-8 flex items-center gap-3">
                                   <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-[10px] sm:text-xs shrink-0">
                                      TIP
                                   </div>
                                   <p className="text-[11px] font-bold text-emerald-700 italic leading-snug">
                                      {detailed.interviewerTip}
                                   </p>
                                </div>
                             </div>
                          </div>

                          {/* Code Example */}
                          {detailed.codeExample && (
                             <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                                <div className="flex items-center gap-3">
                                   <Code className="h-5 w-5 text-indigo-600" />
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Implementation Code</span>
                                </div>
                                <div className="bg-slate-900 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 overflow-hidden shadow-2xl relative">
                                   <div className="absolute top-0 right-0 p-3 sm:p-6 flex gap-2">
                                      <div className="h-2 w-2 rounded-full bg-rose-500/30" />
                                      <div className="h-2 w-2 rounded-full bg-amber-500/30" />
                                      <div className="h-2 w-2 rounded-full bg-emerald-500/30" />
                                   </div>
                                   <pre className="text-indigo-300/90 font-mono text-xs sm:text-sm leading-relaxed scrollbar-hide overflow-x-auto">
                                      <code>{detailed.codeExample}</code>
                                   </pre>
                                </div>
                             </div>
                          )}
                        </div>
                        ) : null}
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

