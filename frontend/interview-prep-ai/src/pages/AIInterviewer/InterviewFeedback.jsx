import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Bot, ChevronRight, Loader2, CheckCircle2, TrendingUp,
    Award, Zap, Timer, Cpu, ClipboardCheck, Target, BarChart3,
    ArrowRight, MessageSquare, Sparkles, Brain, BookOpen,
    ThumbsUp, AlertCircle, User, Lightbulb, Shield, Focus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

// ── Hiring Readiness Config ─────────────────────────────────────────────────
const READINESS_CFG = {
    NotReady: {
        label: "Keep Practicing",
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-300",
        barColor: "bg-slate-400",
        icon: Timer,
        pct: 20,
    },
    Progressing: {
        label: "Good Progress",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-300",
        barColor: "bg-indigo-500",
        icon: Zap,
        pct: 55,
    },
    Ready: {
        label: "Interview Ready",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        barColor: "bg-emerald-500",
        icon: Award,
        pct: 80,
    },
    Excellent: {
        label: "Excellent Performance",
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-300",
        barColor: "bg-violet-500",
        icon: Sparkles,
        pct: 100,
    },
};

const CONFIDENCE_CFG = {
    Low: { label: "Low Confidence", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", pct: 30, barColor: "bg-rose-400" },
    Moderate: { label: "Moderate Confidence", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", pct: 60, barColor: "bg-amber-400" },
    High: { label: "High Confidence", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", pct: 90, barColor: "bg-emerald-500" },
};

// ── Animated Score Ring ─────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 88, stroke = 7 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(Math.max(score, 0), 100);
    const offset = circ - (pct / 100) * circ;

    const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#6366f1" : pct >= 30 ? "#f59e0b" : "#f43f5e";

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color} strokeWidth={stroke} fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl font-black text-slate-800"
                >
                    {score}
                </motion.span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">/ 100</span>
            </div>
        </div>
    );
};

// ── Score Bar ───────────────────────────────────────────────────────────────
const ScoreBar = ({ label, score, icon: Icon, color = "bg-indigo-500", delay = 0 }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">{label}</span>
            </div>
            <span className="text-xs font-black text-slate-800">{score}<span className="font-normal text-slate-400">/100</span></span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                className={`h-full ${color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay }}
            />
        </div>
    </div>
);

// ── Question Feedback Row ───────────────────────────────────────────────────
const QuestionFeedbackRow = ({ item, index }) => {
    const status = item.status || "Analyzed";
    const statusColors = {
        "Excellent": "bg-violet-100 text-violet-700 border-violet-200",
        "Good": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "Average": "bg-amber-100 text-amber-700 border-amber-200",
        "Weak": "bg-orange-100 text-orange-700 border-orange-200",
        "Incorrect": "bg-rose-100 text-rose-700 border-rose-200",
        "Skipped": "bg-slate-100 text-slate-700 border-slate-200"
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors group"
        >
            <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${statusColors[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {status}
                </div>
                {item.questionScore !== undefined && (
                    <span className="text-[8px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                        {item.questionScore}/100
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium flex-1">{item.note || "Analysis complete"}</p>
        </motion.div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const feedbackRes = await axiosInstance.post(
                    API_PATHS.INTERVIEW_SESSION.GENERATE_FEEDBACK(sessionId)
                );
                setFeedback(feedbackRes.data.feedback);

                // Persist for Resources hub
                try {
                    const sessionRes = await axiosInstance.get(
                        API_PATHS.INTERVIEW_SESSION.GET_ONE(sessionId)
                    );
                    if (sessionRes.data?.session) {
                        const session = sessionRes.data.session;
                        const qTexts = session.question.map(q => q.question || q);
                        localStorage.setItem("interviewData", JSON.stringify({
                            blueprint: { targetRole: session.role, experience: session.experience, topicsToFocus: session.type },
                            questions: qTexts,
                        }));
                    }
                } catch {}
            } catch (error) {
                toast.error("Failed to generate feedback.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [sessionId, navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5">
                <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Cpu className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Loader2 className="h-2.5 w-2.5 text-white animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-1.5">
                    <h2 className="text-base font-bold tracking-tight text-slate-800">Analyzing your interview...</h2>
                    <p className="text-sm text-slate-500 animate-pulse">This may take a few seconds</p>
                </div>
                <div className="w-56 space-y-2 mt-2">
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
            </div>
        );
    }

    if (!feedback) return null;

    const readinessCfg = READINESS_CFG[feedback.hiringReadiness] || READINESS_CFG["Progressing"];
    const confidenceCfg = CONFIDENCE_CFG[feedback.confidence] || CONFIDENCE_CFG["Moderate"];
    const ReadinessIcon = readinessCfg.icon;
    const overallScore = feedback.overallScore || feedback.score || 0;
    const techScore = feedback.technicalScore || overallScore;
    const commScore = feedback.communicationScore || Math.max(0, overallScore - 10);
    const psScore = feedback.problemSolvingScore || overallScore;
    const ccScore = feedback.conceptCoverageScore || overallScore;
    const perfCategory = feedback.performanceCategory || (overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 45 ? "Average" : overallScore >= 20 ? "Weak" : "Garbage");
    const perfColors = { Garbage:"bg-red-100 text-red-700", Weak:"bg-orange-100 text-orange-700", Average:"bg-amber-100 text-amber-700", Good:"bg-emerald-100 text-emerald-700", Excellent:"bg-violet-100 text-violet-700" };

    return (
        <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in duration-500">

            {/* ── Page Title ── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Performance Report</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">Interview Feedback</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="h-8 text-xs">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Dashboard
                    </Button>
                    <Button variant="saas" size="sm" onClick={() => navigate("/resources")} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                        Improve <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* ── Hero: Score + Readiness ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Score */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Score</p>
                    <ScoreRing score={overallScore} />
                    <div className="text-center space-y-1">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${perfColors[perfCategory] || "bg-slate-100 text-slate-600"}`}>{perfCategory}</span>
                        <p className="text-xs font-semibold text-slate-500">{feedback.oneLiner || "Interview assessed"}</p>
                    </div>
                </div>

                {/* Hiring Readiness */}
                <div className={`border-2 ${readinessCfg.border} ${readinessCfg.bg} rounded-2xl p-5 flex flex-col justify-center gap-3`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiring Readiness</p>
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center`}>
                            <ReadinessIcon className={`h-5 w-5 ${readinessCfg.color}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-black ${readinessCfg.color}`}>{readinessCfg.label}</p>
                            <div className="h-1.5 w-24 bg-white/50 rounded-full mt-1.5 overflow-hidden">
                                <motion.div
                                    className={`h-full ${readinessCfg.barColor} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${readinessCfg.pct}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confidence */}
                <div className={`border-2 ${confidenceCfg.border} ${confidenceCfg.bg} rounded-2xl p-5 flex flex-col justify-center gap-3`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence Level</p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center">
                            <Shield className={`h-5 w-5 ${confidenceCfg.color}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-black ${confidenceCfg.color}`}>{feedback.confidence}</p>
                            <div className="h-1.5 w-24 bg-white/50 rounded-full mt-1.5 overflow-hidden">
                                <motion.div
                                    className={`h-full ${confidenceCfg.barColor} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidenceCfg.pct}%` }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Skill Breakdown ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800">Skill Breakdown</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ScoreBar label="Technical Knowledge" score={techScore} icon={Brain} color="bg-indigo-500" delay={0.1} />
                    <ScoreBar label="Communication" score={commScore} icon={MessageSquare} color="bg-sky-500" delay={0.2} />
                    <ScoreBar label="Problem Solving" score={psScore} icon={Sparkles} color="bg-violet-500" delay={0.3} />
                    <ScoreBar label="Concept Coverage" score={ccScore} icon={BookOpen} color="bg-amber-500" delay={0.4} />
                </div>
            </div>

            {/* ── Strengths & Weak Areas ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-slate-800">Strengths</h3>
                    </div>
                    {(feedback.strengths || []).length > 0 ? (
                        <div className="space-y-2">
                            {(feedback.strengths || []).map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-xs font-semibold text-slate-700 leading-relaxed">{s}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-xs font-medium text-slate-500">No major strengths identified yet — keep practicing and demonstrate deeper concept understanding.</span>
                        </div>
                    )}
                </div>

                {/* Weak Areas */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-800">Areas to Improve</h3>
                    </div>
                    {(feedback.weakAreas || feedback.improvementAreas || []).length > 0 ? (
                        <div className="space-y-2">
                            {(feedback.weakAreas || feedback.improvementAreas || []).map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50 border border-indigo-100"
                                >
                                    <Zap className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                    <span className="text-xs font-semibold text-slate-700 leading-relaxed">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Great work — no major weak areas identified.</p>
                    )}
                </div>
            </div>

            {/* ── Per-Question Feedback ── */}
            {feedback.questionFeedback && feedback.questionFeedback.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-slate-500" />
                        <h3 className="text-sm font-bold text-slate-800">Per-Question Breakdown</h3>
                    </div>
                    <div className="space-y-2">
                        {feedback.questionFeedback.map((item, i) => (
                            <QuestionFeedbackRow key={i} item={item} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Suggested Topics ── */}
            {(feedback.suggestedTopics || []).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-800">Recommended Study Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(feedback.suggestedTopics || []).map((topic, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200"
                            >
                                {topic}
                            </motion.span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── CTA ── */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-indigo-800">Ready to improve your score?</p>
                    <p className="text-xs text-indigo-600/80 mt-0.5">Practice more sessions or explore learning resources for the topics above.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/ai-interview/setup")}
                        className="h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    >
                        New Session
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate("/resources")}
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        View Resources <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewFeedback;
