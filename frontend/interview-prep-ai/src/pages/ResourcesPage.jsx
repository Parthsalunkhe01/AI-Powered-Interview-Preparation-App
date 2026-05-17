import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import { useNavigate, useParams } from "react-router-dom";
import { generatePdfHtml } from "../utils/pdfTemplate";
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
  Library,
  Download,
  FileText
} from "lucide-react";
import SaaSCard from "../components/ui/SaaSCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function Resources() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [resources, setResources] = useState({ sections: [] });
  const [blueprint, setBlueprint] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);  // how many sections resolved
  const [totalCount, setTotalCount] = useState(0);    // how many sections are fetching
  const [resourceError, setResourceError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // If sessionId is provided in URL, always prioritize that specific session
        if (sessionId) {
          const res = await axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_ONE(sessionId));
          const session = res.data.session;
          if (session) {
            const bpRes = await axiosInstance.get(API_PATHS.BLUEPRINT.GET);
            const rawQs = session.question || [];
            const qTexts = rawQs
              .map(q => (q && typeof q === 'object' ? q.question : q))
              .filter(Boolean);
            const data = {
              blueprint: bpRes.data || { role: session.role, experience: session.experience },
              questions: qTexts
            };
            localStorage.setItem("interviewData", JSON.stringify(data));
            setQuestions(qTexts);
            if (data.blueprint) setBlueprint(data.blueprint);
          }
          return;
        }

        // 1. Check if user has a blueprint — if not, don't load anything (empty state)
        let bp = null;
        try {
          const bpRes = await axiosInstance.get(API_PATHS.BLUEPRINT.GET);
          if (bpRes.data?.targetRole) bp = bpRes.data;
        } catch { /* no blueprint */ }

        if (!bp) {
          // Fresh user with no blueprint — show the "Set Up Blueprint" empty state
          setLoading(false);
          return;
        }

        // 2. Check localStorage (already cleared on login, so this is always current user's data)
        const stored = localStorage.getItem("interviewData");
        let data = null;
        if (stored) {
          try { data = JSON.parse(stored); } catch { /* ignore corrupt data */ }
        }

        if (data?.questions?.length > 0) {
          setQuestions(data.questions);
          setBlueprint(data.blueprint || bp);
          return;
        }

        // 3. No cached data — try to load from the user's most recent session
        const [staticRes, simulationRes] = await Promise.all([
          axiosInstance.get(API_PATHS.SESSION.GET_ALL).catch(() => ({ data: [] })),
          axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_MY).catch(() => ({ data: [] }))
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
          const qTexts = questionsRaw
            .map(q => (q && typeof q === 'object' ? q.question : q))
            .filter(Boolean);
          data = { blueprint: bp, questions: qTexts };
          localStorage.setItem("interviewData", JSON.stringify(data));
          setQuestions(qTexts);
          setBlueprint(bp);
        } else {
          // Has blueprint but no sessions yet — show the "Start Interview" nudge
          setBlueprint(bp);
        }
      } catch (err) {
        console.error("Resources data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);


  const getResourcesFromAI = async (questionList) => {
    const qs = (questionList || questions);
    if (!qs || qs.length === 0) return;

    setResourceError(false);

    // No artificial cap — show resources for ALL questions in the session.
    // Supports 5 / 8 / 10 / 15 question sets chosen during interview setup.
    const qTexts = qs
      .map(q => q.question || q)
      .filter(Boolean);

    setTotalCount(qTexts.length);
    setLoadedCount(0);

    // Seed all sections immediately as skeletons so user sees layout right away
    setResources({
      sections: qTexts.map(topic => ({ topic, _loading: true, videos: [], resources: [] }))
    });

    // Fire one request per topic — update UI as each resolves (progressive rendering)
    const promises = qTexts.map(async (topic, idx) => {
      try {
        const response = await axiosInstance.post(
          API_PATHS.AI.GET_RESOURCES,
          { questions: [topic], blueprint },
          { timeout: 30000 } // 30s per topic — enough for live API + Groq filter
        );
        const sectionData = response.data?.data?.[0];
        setResources(prev => {
          const updated = [...prev.sections];
          updated[idx] = sectionData
            ? { ...sectionData, _loading: false }
            : { topic, _loading: false, videos: [], resources: [] };
          return { sections: updated };
        });
      } catch {
        setResources(prev => {
          const updated = [...prev.sections];
          updated[idx] = { topic, _loading: false, _error: true, videos: [], resources: [] };
          return { sections: updated };
        });
      } finally {
        setLoadedCount(prev => prev + 1);
      }
    });

    await Promise.allSettled(promises);
  };

  // Re-run only when questions list changes (blueprint is derived inside the same effect)
  useEffect(() => {
    if (questions.length > 0) {
      getResourcesFromAI(questions);
    }
  }, [questions]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportGuide = async () => {
    // Open the window BEFORE any await — must be inside synchronous click handler
    // to avoid popup blockers blocking window.open()
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site and try again.");
      return;
    }

    const loadingToast = toast.loading("Generating your guide… this takes ~30–60 seconds for coaching content.", { duration: 180000 });

    try {
      const simulationRes = await axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_MY);
      const latestSession = simulationRes.data?.[0];

      if (!latestSession) {
        printWindow.close();
        toast.dismiss(loadingToast);
        toast.error("No completed interview session found to export.");
        return;
      }

      const res = await axiosInstance.get(
        API_PATHS.INTERVIEW_SESSION.EXPORT_GUIDE(latestSession._id),
        { timeout: 180000 }   // 3-minute override — guide coaching takes time
      );

      toast.dismiss(loadingToast);

      if (res.data?.success && res.data?.data) {
        const htmlContent = generatePdfHtml(res.data.data);
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          toast.success("Guide ready! Use 'Save as PDF' in the print dialog.");
        };
        // Fallback: if onload already fired (cached resources), trigger print directly
        if (printWindow.document.readyState === 'complete') {
          printWindow.focus();
          printWindow.print();
          toast.success("Guide ready! Use 'Save as PDF' in the print dialog.");
        }
      } else {
        printWindow.close();
        toast.error("Guide data not available. Complete an interview session first.");
      }
    } catch (err) {
      console.error("Export Guide Error:", err);
      printWindow.close();
      toast.dismiss(loadingToast);

      const status = err?.response?.status;
      if (status === 404) {
        toast.error("Session not found. Please complete an interview session first.");
      } else if (status === 504 || err?.code === "ECONNABORTED") {
        toast.error("Guide generation timed out — your session is saved. Please try again.", { duration: 6000 });
      } else {
        toast.error("Failed to export guide. Please try again.");
      }
    }
  };

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


  // ── No Blueprint: fresh user who hasn't set up their profile yet ─────────
  if (!questions || questions.length === 0) {
    const hasBlueprint = !!blueprint;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 max-w-md"
          >
              <div className="h-20 w-20 rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
                  <Library className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="space-y-3">
                  {hasBlueprint ? (
                    <>
                      <h1 className="text-4xl font-bold tracking-tight">No Sessions Yet</h1>
                      <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                        Complete your first mock interview and your personalized study materials will appear here automatically.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-4xl font-bold tracking-tight">Set Up Your Profile First</h1>
                      <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                        Create your Career Blueprint to get interview questions and resources tailored to your target role and skills.
                      </p>
                    </>
                  )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {hasBlueprint ? (
                  <Button size="lg" variant="saas" onClick={() => navigate("/ai-interview/setup")}>
                    Start Your First Interview <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg" variant="saas" onClick={() => navigate("/blueprint")}>
                    Create My Blueprint <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
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
              <Button
                  variant="outline"
                  size="sm"
                  onClick={exportGuide}
                  disabled={loadedCount < totalCount || resourceError || resources.sections.length === 0}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                  <Download className="mr-2 h-4 w-4" />
                  {loadedCount < totalCount ? `Loading ${loadedCount}/${totalCount}…` : "Export PDF Guide"}
              </Button>
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
      {/* Progress indicator — shows while any section is still loading */}
      {totalCount > 0 && loadedCount < totalCount && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              animate={{ width: `${(loadedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums">
            {loadedCount}/{totalCount} topics loaded
          </span>
        </div>
      )}

      <div className="space-y-24">
        {resourceError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[340px] gap-6 text-center"
          >
            <div className="h-16 w-16 rounded-[22px] bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
              <RefreshCw className="h-7 w-7 text-red-400" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-slate-700">Resource fetch timed out</p>
              <p className="text-sm text-slate-400 max-w-xs">The server took too long to respond. Your resources may be generating for the first time — please retry.</p>
            </div>
            <Button
              variant="saas"
              size="sm"
              onClick={() => getResourcesFromAI(questions)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {resources.sections && resources.sections.map((section, idx) => {
              const hasResources = section.resources && section.resources.length > 0;
              const hasVideos = section.videos && section.videos.length > 0;

              return (
                <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0 }}  
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

                  {/* Per-section skeleton while this topic is loading */}
                  {section._loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
                      <div className="lg:col-span-7 grid grid-cols-2 gap-6">
                        <div className="h-48 rounded-[24px] bg-slate-100" />
                        <div className="h-48 rounded-[24px] bg-slate-100" />
                      </div>
                      <div className="lg:col-span-5 space-y-4">
                        <div className="h-20 rounded-[20px] bg-slate-100" />
                        <div className="h-20 rounded-[20px] bg-slate-100" />
                      </div>
                    </div>
                  ) : !hasResources && !hasVideos ? (
                    <SaaSCard className="p-8 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-5">
                      <p className="text-slate-500 font-medium text-sm">No cached resources yet for this question. Search directly:</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent((section.keywords || []).join(" ") + " interview explanation")}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
                        >
                          <Youtube className="h-4 w-4" /> Search YouTube
                        </a>
                        <a
                          href={`https://www.geeksforgeeks.org/?s=${encodeURIComponent((section.keywords || []).join(" "))}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" /> Search GeeksforGeeks
                        </a>
                      </div>
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
                            {section.videos?.slice(0, 2).map((vid, vidx) => {
                                // Use pre-built url from backend; fallback to videoId pattern
                                const videoUrl = vid.url || (vid.videoId ? `https://www.youtube.com/watch?v=${vid.videoId}` : null);
                                // Use injected thumbnail; fallback to YouTube pattern
                                const thumbSrc = vid.thumbnail || (vid.videoId ? `https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg` : null);
                                if (!videoUrl) return null;
                                return (
                                <a 
                                    key={vidx} 
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                >
                                    <SaaSCard className="!p-0 border border-slate-200 bg-white overflow-hidden ring-1 ring-transparent hover:ring-red-500/30 hover:shadow-md transition-all duration-500 h-full">
                                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                                            {thumbSrc ? (
                                                <img 
                                                    src={thumbSrc} 
                                                    alt={vid.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <PlayCircle className="h-10 w-10 text-slate-300" />
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
                                );
                            })}
                        </div>
                      </div>

                      {/* Reading Artifacts */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-2 px-1 mb-4">
                            <Globe className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Reading Materials</h3>
                        </div>
                        <div className="space-y-6">
                            {section.resources?.filter(res => res.url || res.link).slice(0, 3).map((res, ridx) => (
                                <a 
                                    key={ridx}
                                    href={res.url || res.link}
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