import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Bot, Sparkles, MessageSquare, Info,
    ChevronRight, Loader2, CheckCircle2, TrendingUp,
    Award, Zap, Timer, AlertCircle, Cpu, ClipboardCheck,
    Target, BarChart3, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import SaaSCard from "../../components/ui/SaaSCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/Skeleton";

const READINESS = {
    "Ready": {
        gradient: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/30",
        color: "text-emerald-400",
        icon: Award,
        label: "Operational Readiness",
        desc: "Elite performance identified. The candidate exhibits high-level technical maturity and alignment with senior expectations.",
    },
    "Improving": {
        gradient: "from-primary/20 to-blue-400/20",
        border: "border-primary/30",
        color: "text-primary",
        icon: Zap,
        label: "Strategic Development",
        desc: "Foundational mastery confirmed. Performance trajectory is positive with specific areas identified for surgical refinement.",
    },
    "Needs Practice": {
        gradient: "from-rose-500/20 to-pink-500/20",
        border: "border-rose-500/30",
        color: "text-rose-400",
        icon: Timer,
        label: "Foundational Focus",
        desc: "Core concepts established. Immediate focus required on deep-technical reasoning to bridge current performance gaps.",
    },
};

const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [status, setStatus] = useState("Improving");

    useEffect(() => {
        const fetchFeedbackAndPersist = async () => {
            try {
                const feedbackRes = await axiosInstance.post(API_PATHS.INTERVIEW_SESSION.GENERATE_FEEDBACK(sessionId));
                setFeedback(feedbackRes.data.feedback);
                
                const s = feedbackRes.data.feedback.strengths?.length || 0;
                const i = feedbackRes.data.feedback.improvementAreas?.length || 0;
                if (s > i + 2) setStatus("Ready");
                else if (i > s) setStatus("Needs Practice");
                else setStatus("Improving");

                // Persist for Resources hub
                try {
                   const sessionRes = await axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_ONE(sessionId));
                   if (sessionRes.data?.session) {
                       const session = sessionRes.data.session;
                       const qTexts = session.question.map(q => q.question || q);
                       localStorage.setItem("interviewData", JSON.stringify({
                           blueprint: { targetRole: session.role, experience: session.experience, topicsToFocus: session.type },
                           questions: qTexts
                       }));
                   }
                } catch (e) {
                   console.log("Persistence sync skipped");
                }
            } catch (error) {
                console.error("Feedback error:", error);
                toast.error("Feedback generation failed.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbackAndPersist();
    }, [sessionId, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Cpu className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black tracking-tighter uppercase tracking-[0.2em]">Analyzing Signal</h2>
                    <p className="text-muted-foreground font-medium animate-pulse">Synthesizing technical performance and communication metrics...</p>
                </div>
            </div>
        );
    }

    const readinessCfg = READINESS[status] || READINESS["Improving"];
    const ReadinessIcon = readinessCfg.icon;

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* ── Page Title ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <Badge variant="info">Intelligence Report</Badge>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Performance Analysis</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Exit Report
                    </Button>
                    <Button variant="saas" size="sm" onClick={() => navigate("/resources")}>
                        Improve Skills <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ── Readiness Hero ── */}
            <SaaSCard className={`p-10 md:p-14 border-none bg-gradient-to-br ${readinessCfg.gradient} relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ReadinessIcon className="h-40 w-40" />
                </div>
                <div className="relative flex flex-col md:flex-row items-center gap-10">
                    <div className={`h-28 w-28 rounded-[36px] bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl ${readinessCfg.color}`}>
                        <ReadinessIcon className="h-14 w-14" />
                    </div>
                    <div className="text-center md:text-left space-y-4 flex-1">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <Badge variant="outline" className="bg-black/20 border-white/10">Signal Confidence: 98%</Badge>
                            <Badge variant="purple" className="bg-black/20 border-white/10">AI Performance Grade</Badge>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{readinessCfg.label}</h2>
                        <p className="text-foreground/90 text-lg font-medium max-w-3xl leading-relaxed italic">
                            "{readinessCfg.desc}"
                        </p>
                    </div>
                </div>
            </SaaSCard>

            {/* ── Qualitative Analysis ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <SaaSCard className="p-8 space-y-6 hover:translate-y-[-4px] transition-transform duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                            <MessageSquare className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Communication Flow</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium text-lg">
                        {feedback?.qualitativeAnalysis?.communication}
                    </p>
                </SaaSCard>

                <SaaSCard className="p-8 space-y-6 hover:translate-y-[-4px] transition-transform duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Technical Reasoning</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium text-lg">
                        {feedback?.qualitativeAnalysis?.technicalReasoning}
                    </p>
                </SaaSCard>
            </div>

            {/* ── Strengths & Targets ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-1">
                        <Target className="h-6 w-6 text-emerald-400" />
                        <h3 className="text-base font-black uppercase tracking-[0.2em] text-muted-foreground">High-Value Strengths</h3>
                    </div>
                    <div className="space-y-4">
                        {feedback?.strengths?.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (i * 0.1) }}
                                className="flex items-start gap-5 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 group hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-sm"
                            >
                                <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                </div>
                                <span className="text-base font-bold text-foreground/90 leading-snug">{s}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-1">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h3 className="text-base font-black uppercase tracking-[0.2em] text-muted-foreground">Growth Trajectories</h3>
                    </div>
                    <div className="space-y-4">
                        {feedback?.improvementAreas?.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (i * 0.1) }}
                                className="flex items-start gap-5 p-6 rounded-3xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm"
                            >
                                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Zap className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-base font-bold text-foreground/90 leading-snug">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Strategic Alignment ── */}
            {feedback?.companyExpectations?.length > 0 && (
                <SaaSCard className="p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                        <BarChart3 className="h-64 w-64" />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-16 relative">
                        <div className="lg:max-w-xs space-y-5">
                            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-xl shadow-purple-500/10">
                                <BarChart3 className="h-7 w-7 text-purple-400" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight leading-tight">Strategic Alignment</h3>
                            <p className="text-muted-foreground font-medium text-lg leading-relaxed italic">
                                Domain-specific benchmarks identified based on elite organizational standards.
                            </p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {feedback.companyExpectations.map((exp, idx) => (
                                <div key={idx} className="p-6 rounded-2xl bg-white/3 border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.8)] shrink-0" />
                                    <span className="text-base font-black tracking-tight opacity-90">{exp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SaaSCard>
            )}

            {/* ── Conclusion CTA ── */}
            <div className="flex flex-col items-center pt-8 text-center space-y-10">
                <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">Mission Complete</p>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter">Ready for the next operational phase?</h3>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">Your performance data is now synced. Utilize the mastery materials to bridge identified gaps before your next simulation.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Button variant="saas" size="lg" onClick={() => navigate("/dashboard")} className="px-12 h-16 rounded-2xl shadow-2xl shadow-primary/30 text-lg">
                        Return to Command <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => navigate("/resources")} className="px-12 h-16 rounded-2xl text-lg hover:bg-white/5">
                        Access Learning Vault <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewFeedback;
