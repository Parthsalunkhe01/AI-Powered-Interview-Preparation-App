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
import { Button } from "../components/ui/Button";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
          >
              <div className="h-20 w-20 rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
                  <Library className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight">Your Resource Library is Empty</h1>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                      Complete a mock interview first to see personalized study materials tailored to your performance.
                  </p>
              </div>
              <Button size="lg" variant="saas" onClick={() => navigate("/dashboard")}>
                  Start Your First Session <ChevronRight className="ml-2 h-4 w-4" />
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
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                      <Sparkles className="h-4 w-4" />
                  </div>
                  <Badge variant="purple">Personalized</Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Learning Center</h1>
              <p className="text-muted-foreground font-medium text-lg italic">Resources selected based on your recent interview performance.</p>
          </div>
          <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/resources/questions", { state: { blueprint, questions } })}>
                  View Study Plan <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
            description="Your Current Study Plan"
            lastUpdated={blueprint?.updatedAt ? moment(blueprint.updatedAt).format("Do MMM YYYY") : moment().format("Do MMM YYYY")}
            onSelect={() => navigate("/resources/questions", { state: { blueprint, questions } })} 
            onDelete={null}
          />
      </section>

      {/* ── Resource Library ── */}
      <div className="space-y-24">
        {aiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SaaSCard className="h-[400px] flex flex-col items-center justify-center bg-transparent border-slate-200 border-dashed hover:bg-slate-50 transition-colors">
                  <RefreshCw className="h-10 w-10 animate-spin text-indigo-600 mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Checking performance...</p>
              </SaaSCard>
              <SaaSCard className="h-[400px] flex flex-col items-center justify-center bg-transparent border-slate-200 border-dashed hover:bg-slate-50 transition-colors">
                  <RefreshCw className="h-10 w-10 animate-spin text-indigo-600 mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Finding resources...</p>
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
                      <div className="flex items-center justify-center h-14 w-14 rounded-[22px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xl shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                             <Badge variant="info">Topic Insight</Badge>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">• Recommended</span>
                         </div>
                         <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{section.topic}</h2>
                      </div>
                  </div>

                  {!hasResources && !hasVideos ? (
                    <SaaSCard className="p-10 border-dashed border-slate-200 bg-transparent text-center">
                       <p className="text-slate-500 italic font-medium">No resources found for this specific topic. Try updating your interview profile for better results.</p>
                    </SaaSCard>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      
                      {/* Video Artifacts */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 px-1 mb-4">
                            <Youtube className="h-4 w-4 text-red-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Video Tutorials</h3>
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
                                    <SaaSCard className="!p-0 border border-slate-200 bg-white overflow-hidden ring-1 ring-transparent hover:ring-red-500/30 hover:shadow-md transition-all duration-500 h-full">
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
                                            <h4 className="font-bold text-sm leading-tight text-slate-800 group-hover:text-red-500 transition-colors line-clamp-2">{vid.title}</h4>
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
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Reading Materials</h3>
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
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reference</span>
                                                </div>
                                                <h4 className="text-lg font-bold tracking-tight text-slate-800 group-hover:text-primary transition-colors leading-snug">{res.title}</h4>
                                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{res.snippet}</p>
                                            </div>
                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-indigo-50 border group-hover:border-indigo-100 transition-all">
                                                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
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