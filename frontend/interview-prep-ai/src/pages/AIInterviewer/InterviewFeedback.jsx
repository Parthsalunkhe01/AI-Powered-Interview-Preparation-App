import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Bot, Sparkles, MessageSquare, Info,
    ChevronRight, Loader2, CheckCircle2, TrendingUp,
    Award, Zap, Timer, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

/* ────────────────────────────────────────────────
   Inline sub-components (no extra file changes)
──────────────────────────────────────────────── */

const READINESS = {
    "Ready": {
        gradient: "from-emerald-500 to-teal-500",
        glow: "rgba(16,185,129,0.25)",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        icon: Award,
        label: "Interview Ready",
        desc: "Outstanding performance — you're prepared for real interview rounds.",
    },
    "Improving": {
        gradient: "from-[#4A7CF7] to-[#818CF8]",
        glow: "rgba(74,124,247,0.25)",
        badge: "bg-[#4A7CF7]/10 border-[#4A7CF7]/20 text-[#818CF8]",
        icon: Zap,
        label: "Showing Progress",
        desc: "Good grasp of concepts — focus on the identified growth areas below.",
    },
    "Needs Practice": {
        gradient: "from-rose-500 to-pink-500",
        glow: "rgba(244,63,94,0.25)",
        badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",
        icon: Timer,
        label: "Keep Practicing",
        desc: "Consistency in technical depth will build your confidence quickly.",
    },
};

const ReadinessBanner = ({ status = "Improving" }) => {
    const cfg = READINESS[status] || READINESS["Improving"];
    const Icon = cfg.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-6 border border-[#252f42] bg-[#141c2e]"
            style={{ boxShadow: `0 0 60px ${cfg.glow}` }}
        >
            {/* glow blob */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30"
                style={{ background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)` }} />
            <div className="relative flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${cfg.gradient} shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                </div>
                <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-1 ${cfg.badge}`}>
                        Performance Status
                    </span>
                    <h2 className="text-xl font-black text-[#e6eaf2]">{cfg.label}</h2>
                    <p className="text-sm text-[#7a8faa] mt-0.5 max-w-lg">{cfg.desc}</p>
                </div>
            </div>
        </motion.div>
    );
};

const AnalysisCard = ({ icon: Icon, iconColor, iconBg, title, content, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="p-6 rounded-2xl border border-[#252f42] bg-[#141c2e] space-y-4 hover:border-[#4A7CF7]/30 transition-colors"
    >
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-[#e6eaf2]">{title}</h3>
        <p className="text-sm text-[#7a8faa] leading-relaxed">{content}</p>
    </motion.div>
);

const StrengthItem = ({ text, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        className="flex items-start gap-3 p-4 rounded-xl border border-emerald-900/30 bg-emerald-900/10 hover:bg-emerald-900/20 transition-colors group"
    >
        <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
        </div>
        <p className="text-sm text-[#b4e4d4] font-medium leading-relaxed">{text}</p>
    </motion.div>
);

const ImprovementItem = ({ text, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        className="flex items-start gap-3 p-4 rounded-xl border border-[#4A7CF7]/20 bg-[#4A7CF7]/5 hover:bg-[#4A7CF7]/10 transition-colors"
    >
        <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-[#4A7CF7] flex items-center justify-center">
            <TrendingUp className="h-3 w-3 text-white" />
        </div>
        <p className="text-sm text-[#a8c4ff] font-medium leading-relaxed">{text}</p>
    </motion.div>
);

/* ────────────────────────────────────────────────
   Main Feedback Page
──────────────────────────────────────────────── */
const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [status, setStatus] = useState("Improving");

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await axiosInstance.post(API_PATHS.INTERVIEW_SESSION.GENERATE_FEEDBACK(sessionId));
                setFeedback(res.data.feedback);
                const s = res.data.feedback.strengths?.length || 0;
                const i = res.data.feedback.improvementAreas?.length || 0;
                if (s > i + 2) setStatus("Ready");
                else if (i > s) setStatus("Needs Practice");
                else setStatus("Improving");
            } catch {
                toast.error("Could not generate feedback. Please try again.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [sessionId, navigate]);

    /* Loading state */
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6 bg-[#0f1623]">
                <div className="relative">
                    <div className="h-20 w-20 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(74,124,247,0.1)", border: "1px solid rgba(74,124,247,0.2)" }}>
                        <Bot className="h-9 w-9 text-[#4A7CF7]" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#4A7CF7,#818CF8)" }}>
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-black text-[#e6eaf2] uppercase tracking-widest">
                        Generating AI Feedback
                    </h2>
                    <p className="text-sm text-[#7a8faa] mt-2 max-w-xs">
                        Analyzing your technical reasoning and communication style…
                    </p>
                </div>
                <div className="flex gap-2">
                    {[0, 0.2, 0.4].map((d, i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#4A7CF7] animate-bounce"
                            style={{ animationDelay: `${d}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1623] pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-20 px-6 py-4 border-b border-[#1d2535] bg-[#0f1623]/90 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/interview-prep/${sessionId}`)}
                        className="h-9 w-9 rounded-xl flex items-center justify-center border border-[#252f42] hover:bg-[#1d2535] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-[#7a8faa]" />
                    </button>
                    <div className="h-8 w-px bg-[#1d2535]" />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#818CF8]" />
                            <span className="text-[10px] font-black text-[#818CF8] uppercase tracking-[0.2em]">
                                AI Performance Review
                            </span>
                        </div>
                        <h1 className="text-base font-bold text-[#e6eaf2] leading-tight">Interview Feedback</h1>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg,#4A7CF7,#818CF8)" }}
                >
                    Dashboard
                    <ChevronRight className="h-4 w-4" />
                </button>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">

                {/* Readiness Banner */}
                <ReadinessBanner status={status} />

                {/* Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AnalysisCard
                        icon={MessageSquare}
                        iconBg="bg-[#4A7CF7]/10"
                        iconColor="text-[#4A7CF7]"
                        title="Communication Analysis"
                        content={feedback?.qualitativeAnalysis?.communication}
                        delay={0.1}
                    />
                    <AnalysisCard
                        icon={Sparkles}
                        iconBg="bg-[#818CF8]/10"
                        iconColor="text-[#818CF8]"
                        title="Technical Reasoning"
                        content={feedback?.qualitativeAnalysis?.technicalReasoning}
                        delay={0.2}
                    />
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Strengths */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <h3 className="text-xs font-black text-[#7a8faa] uppercase tracking-widest">Key Strengths</h3>
                        </div>
                        {(feedback?.strengths || []).map((s, i) => (
                            <StrengthItem key={i} text={s} index={i} />
                        ))}
                    </div>

                    {/* Growth Areas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-[#818CF8]" />
                            <h3 className="text-xs font-black text-[#7a8faa] uppercase tracking-widest">Growth Opportunities</h3>
                        </div>
                        {(feedback?.improvementAreas || []).map((item, i) => (
                            <ImprovementItem key={i} text={item} index={i} />
                        ))}
                    </div>
                </div>

                {/* Company Expectations */}
                {feedback?.companyExpectations?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative overflow-hidden rounded-2xl border border-[#252f42] bg-[#141c2e] p-8"
                    >
                        {/* Glow */}
                        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
                            style={{ background: "radial-gradient(circle,rgba(74,124,247,0.5),transparent 70%)" }} />

                        <div className="relative flex flex-col md:flex-row gap-8">
                            <div className="md:w-[280px] shrink-0">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: "rgba(74,124,247,0.12)", border: "1px solid rgba(74,124,247,0.2)" }}>
                                    <Info className="h-5 w-5 text-[#4A7CF7]" />
                                </div>
                                <h3 className="text-lg font-black text-[#e6eaf2]">Company Expectations</h3>
                                <p className="text-sm text-[#7a8faa] mt-2 leading-relaxed">
                                    Based on your target role, our AI identified typical standards at these organizations.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 content-start">
                                {feedback.companyExpectations.map((exp, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-[#a8c4ff] hover:text-white transition-colors"
                                        style={{
                                            background: "rgba(74,124,247,0.08)",
                                            border: "1px solid rgba(74,124,247,0.15)"
                                        }}
                                    >
                                        {exp}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Bottom CTA */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                        style={{
                            background: "linear-gradient(135deg,#4A7CF7,#818CF8)",
                            boxShadow: "0 8px 32px rgba(74,124,247,0.3)"
                        }}
                    >
                        Return to Dashboard
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default InterviewFeedback;
