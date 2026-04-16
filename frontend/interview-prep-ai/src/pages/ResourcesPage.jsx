import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../components/Cards/SummaryCard";
import { CARD_BG } from "../utils/data";
import moment from "moment";
import { 
  PlayCircle, 
  BookOpen, 
  Search, 
  RefreshCw, 
  Sparkles, 
  PlusCircle, 
  ArrowRight,
  Youtube,
  Globe,
  ExternalLink,
  ChevronRight,
  Library
} from "lucide-react";
import SaaSCard from "../components/ui/SaaSCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function Resources() {
  const navigate = useNavigate();
  
  const [resources, setResources] = useState({
    sections: []
  });
  const [blueprint, setBlueprint] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("interviewData");
        let data = stored ? JSON.parse(stored) : null;
        
        if (!data || !data.questions || data.questions.length === 0) {
          const blueprintRes = await axiosInstance.get(API_PATHS.BLUEPRINT.GET);
          const bp = blueprintRes.data;

          const [staticRes, simulationRes] = await Promise.all([
            axiosInstance.get(API_PATHS.SESSION.GET_ALL),
            axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_MY)
          ]);

          const latestStatic = staticRes.data?.[0];
          const latestSimulation = simulationRes.data?.[0];

          let bestSession = null;
          if (latestStatic && latestSimulation) {
            bestSession = new Date(latestStatic.createdAt) > new Date(latestSimulation.createdAt) 
              ? latestStatic : latestSimulation;
          } else {
            bestSession = latestStatic || latestSimulation;
          }

          if (bestSession) {
            const questionsRaw = bestSession.question || bestSession.questions || [];
            data = {
              blueprint: bp || { 
                role: bestSession.role || "Software Engineer", 
                experience: bestSession.experience || "Entry" 
              },
              questions: questionsRaw
            };
            localStorage.setItem("interviewData", JSON.stringify(data));
          }
        }

        if (data && data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          if (data.blueprint) {
            setBlueprint(data.blueprint);
          }
        }
      } catch (err) {
        console.error("Resources data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const getResourcesFromAI = async () => {
      if (!questions || questions.length === 0) return;

      try {
        setAiLoading(true);
        const qTexts = questions.map(q => q.question || q);
        const response = await axiosInstance.post(API_PATHS.AI.GET_RESOURCES, {
          questions: qTexts,
          blueprint: blueprint
        });

        if (response.data && response.data.data) {
          setResources({ sections: response.data.data });
        }
      } catch (err) {
        console.error("Error fetching AI resources:", err);
      } finally {
        setAiLoading(false);
      }
    };

    if (questions.length > 0) {
      getResourcesFromAI();
    }
  }, [questions, blueprint]);

  if (loading) {
    return (
      <div className="space-y-10">
          <Skeleton className="h-40 w-full rounded-[32px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-64 rounded-[32px]" />
              <Skeleton className="h-64 rounded-[32px]" />
          </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-grid">
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
          >
              <div className="h-20 w-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-2xl">
                  <Library className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                  <h1 className="text-4xl font-black tracking-tighter">Your Intelligence Hub is Empty</h1>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                      Complete an interview session first to unlock surgical learning materials tailored to your performance.
                  </p>
              </div>
              <Button size="lg" variant="saas" onClick={() => navigate("/dashboard")}>
                  Initialize First Session <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
          <div className="space-y-2">
              <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                  </div>
                  <Badge variant="purple">AI Synergy</Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tighter">Mastery Library</h1>
              <p className="text-muted-foreground font-medium text-lg italic">Contextual artifacts generated from your latest performance data.</p>
          </div>
          <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/resources/questions", { state: { blueprint, questions } })}>
                  View Roadmap Breakdown <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
          </div>
      </div>

      {/* ── Active Blueprint Card ── */}
      <section className="relative">
          <SummaryCard
            colors={CARD_BG[0]}
            role={blueprint?.targetRole || blueprint?.role || "Global Profile"}
            topicsToFocus={blueprint?.skills?.join(", ") || blueprint?.topicsToFocus || "General Topics"}
            experience={blueprint?.experienceLevel || blueprint?.experience || "Any"}
            questions={questions.length}
            description="Operational Learning Directive (Active)"
            lastUpdated={blueprint?.updatedAt ? moment(blueprint.updatedAt).format("Do MMM YYYY") : moment().format("Do MMM YYYY")}
            onSelect={() => navigate("/resources/questions", { state: { blueprint, questions } })} 
            onDelete={null}
          />
      </section>

      {/* ── Intelligence Feed ── */}
      <div className="space-y-24">
        {aiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <SaaSCard className="h-[400px] flex flex-col items-center justify-center bg-transparent border-white/5 border-dashed">
                 <RefreshCw className="h-10 w-10 animate-spin text-primary mb-6" />
                 <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Scanning context...</p>
             </SaaSCard>
             <SaaSCard className="h-[400px] flex flex-col items-center justify-center bg-transparent border-white/5 border-dashed">
                 <RefreshCw className="h-10 w-10 animate-spin text-primary mb-6" />
                 <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Generating artifacts...</p>
             </SaaSCard>
          </div>
        ) : (
          <AnimatePresence>
            {resources.sections && resources.sections.map((section, idx) => {
              const hasResources = section.resources && section.resources.length > 0;
              const hasVideos = section.videos && section.videos.length > 0;

              return (
                <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className="space-y-10"
                >
                  {/* Section Title Group */}
                  <div className="flex items-center gap-6 px-1">
                      <div className="flex items-center justify-center h-14 w-14 rounded-[22px] bg-white/5 border border-white/10 text-primary font-black text-xl shadow-xl">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                             <Badge variant="info">Topic Intelligence</Badge>
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">• Verified Insight</span>
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{section.topic}</h2>
                      </div>
                  </div>

                  {!hasResources && !hasVideos ? (
                    <SaaSCard className="p-10 border-dashed border-white/5 bg-transparent text-center">
                       <p className="text-muted-foreground italic font-medium">Standard resource mapping failed for this unique query. Refine blueprint for better results.</p>
                    </SaaSCard>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      
                      {/* Video Artifacts */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 px-1 mb-4">
                            <Youtube className="h-4 w-4 text-red-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Visual Mastery</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {section.videos?.slice(0, 4).map((vid, vidx) => (
                                <a 
                                    key={vidx} 
                                    href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                >
                                    <SaaSCard className="!p-0 border-none bg-white/2 overflow-hidden ring-1 ring-white/5 hover:ring-red-500/30 transition-all duration-500 h-full">
                                        <div className="relative aspect-video overflow-hidden">
                                            {vid.thumbnail ? (
                                                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <PlayCircle className="h-8 w-8 text-muted-foreground/40" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500">
                                                <div className="bg-red-600 p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                    <PlayCircle className="h-6 w-6 text-white" fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-bold text-sm leading-tight text-foreground/90 group-hover:text-red-400 transition-colors line-clamp-2">{vid.title}</h4>
                                        </div>
                                    </SaaSCard>
                                </a>
                            ))}
                        </div>
                      </div>

                      {/* Reading Artifacts */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-2 px-1 mb-4">
                            <Globe className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Technical Documentation</h3>
                        </div>
                        <div className="space-y-6">
                            {section.resources?.slice(0, 3).map((res, ridx) => (
                                <a 
                                    key={ridx}
                                    href={res.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                >
                                    <SaaSCard className="p-6 border-primary/5 hover:border-primary/20 transition-all duration-500">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase">Verified Publication</span>
                                                </div>
                                                <h4 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors leading-snug">{res.title}</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{res.snippet}</p>
                                            </div>
                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </SaaSCard>
                                </a>
                            ))}
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}