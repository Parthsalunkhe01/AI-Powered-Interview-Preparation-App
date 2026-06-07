import React, { useState, useEffect, useContext } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
    Zap, Award, Clock, Activity, Target, CheckCircle2, AlertCircle, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import { toast } from "react-hot-toast";
import SaaSCard from "../components/ui/SaaSCard";
import { Button } from "../components/ui/Button";
import { UserContext } from "../context/userContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMasteryLevel(score) {
    if (score == null) return "0%";
    return `${Math.min(100, Math.round(score))}%`;
}

function getPrepIntensity(history) {
    if (!history || history.length === 0) return "0m";

    // Sum actual timeTaken (stored in seconds from InterviewResult)
    const totalSeconds = history.reduce((sum, h) => sum + (h.timeTaken || 0), 0);

    if (totalSeconds === 0) return "<1m"; // No time data yet

    if (totalSeconds < 60) return `${totalSeconds}s`;

    const totalMins = Math.round(totalSeconds / 60);
    if (totalMins >= 60) {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${totalMins}m`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [hasBlueprint, setHasBlueprint] = useState(true);
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user) return;
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                
                // 1. Check Blueprint first
                const bpRes = await axiosInstance.get(API_PATHS.BLUEPRINT.GET);
                if (!bpRes.data || !bpRes.data.targetRole) {
                    setHasBlueprint(false);
                    setLoading(false);
                    return;
                }
                setHasBlueprint(true);

                // 2. Load Stats
                const res = await axiosInstance.get(API_PATHS.ANALYTICS.GET_STATS);
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error("Analytics load error:", err);
                // If blueprint 404, treat as no blueprint
                if (err.response?.status === 404) setHasBlueprint(false);
                else toast.error("Failed to load analytics.");
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, [user?.id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Activity className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</p>
        </div>
    );

    if (!hasBlueprint) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 max-w-md"
                >
                    <div className="h-20 w-20 rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
                        <Activity className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Set Up Your Profile First</h1>
                        <p className="text-muted-foreground text-sm sm:text-lg max-w-sm mx-auto leading-relaxed">
                            Create your Career Blueprint to track your performance and get personalized interview analytics.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button size="lg" variant="saas" onClick={() => window.location.href = "/blueprint"}>
                            Create My Blueprint <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => window.location.href = "/dashboard"}>
                            Go to Dashboard
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!data || data.avgScore == null || data.totalInterviews === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 max-w-md"
            >
                <div className="h-20 w-20 rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
                    <Zap className="h-10 w-10 text-indigo-600" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">No Sessions Yet</h2>
                    <p className="text-muted-foreground text-sm sm:text-lg max-w-sm mx-auto leading-relaxed">
                        Complete your first mock interview to see your performance velocity and AI-driven insights.
                    </p>
                </div>
                <Button size="lg" variant="saas" onClick={() => window.location.href = "/ai-interview/setup"}>
                    Start First Interview <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>
        </div>
    );

    const totalSessions = data.history?.length ?? 0;
    const masteryLevel  = getMasteryLevel(data.avgScore);
    const prepIntensity = getPrepIntensity(data.history);

    // AI Contextual Insight text
    const weakTopics = (data.weaknesses || []).map(w => w.topic).slice(0, 5);
    const insightText = weakTopics.length > 0
        ? `"You are currently struggling in ${weakTopics.join(", ")}. Dedicate some time entirely to foundational concepts here."`
        : `"Your performance is on track. Focus on consistency and attempt harder problems to reach the next tier."`;

    // Top signal areas = weaknesses with scores
    const topSignals = (data.weaknesses || []).slice(0, 3);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-12 sm:pb-20">

            {/* ── 1. Top Stats Row ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Total Sessions */}
                <SaaSCard className="p-3 sm:p-5 lg:p-8 relative">
                    <button className="absolute top-3 right-3 sm:top-5 sm:right-5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    </button>
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-2 sm:mb-5">
                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Total Sessions</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 leading-none">{totalSessions}</h2>
                </SaaSCard>

                {/* Mastery Level */}
                <SaaSCard className="p-3 sm:p-5 lg:p-8 relative">
                    <button className="absolute top-3 right-3 sm:top-5 sm:right-5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    </button>
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2 sm:mb-5">
                        <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Mastery Level</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 leading-none">{masteryLevel}</h2>
                </SaaSCard>

                {/* Prep Intensity */}
                <SaaSCard className="col-span-2 md:col-span-1 p-3 sm:p-5 lg:p-8 relative">
                    <button className="absolute top-3 right-3 sm:top-5 sm:right-5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                    </button>
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-2 sm:mb-5">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Prep Intensity</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 leading-none">{prepIntensity}</h2>
                </SaaSCard>
            </div>

            {/* ── 2. Performance Velocity + AI Insight ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Performance Velocity Chart */}
                <SaaSCard className="lg:col-span-8 p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start sm:items-center justify-between mb-1 gap-2">
                        <div>
                            <h3 className="text-base sm:text-xl font-black text-slate-900">Performance Velocity</h3>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Trajectory across your session history</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Score Focus</span>
                    </div>
                    <div className="mt-4 sm:mt-6 h-[160px] sm:h-[200px] lg:h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.history} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="index"
                                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700 }}
                                    labelFormatter={(v) => `Session ${v}`}
                                    formatter={(v) => [`${v}%`, "Score"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.12}
                                    strokeWidth={2.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </SaaSCard>

                {/* AI Contextual Insight */}
                <SaaSCard className="lg:col-span-4 p-4 sm:p-6 lg:p-7 bg-indigo-50/60 border-indigo-100 flex flex-col gap-4 sm:gap-6">
                    <h4 className="text-sm font-black text-indigo-700 text-center uppercase tracking-widest">
                        AI Contextual Insight
                    </h4>

                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic text-center">
                        {insightText}
                    </p>

                    {topSignals.length > 0 && (
                        <div className="space-y-3 mt-auto">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] text-center">
                                Top Signal Areas
                            </p>
                            {topSignals.map((s, i) => {
                                const score    = s.avgScore ?? 0;
                                // Even at 0%, show a tiny sliver (4%) so the bar doesn't look "missing"
                                const barWidth = Math.max(score, 4); 
                                const label    = `${score}%`;
                                const labelCls = score < 35 ? "text-rose-500" : "text-indigo-600";
                                return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-slate-700 leading-snug truncate max-w-[75%]">
                                            {s.topic}
                                        </span>
                                        <span className={`text-xs font-black shrink-0 ml-2 ${labelCls}`}>
                                            {label}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${score < 35 ? "bg-rose-400" : "bg-indigo-500"}`}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </SaaSCard>
            </div>

            {/* ── 3. Practice Prioritization + Core Dominance ────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Practice Prioritization */}
                <SaaSCard className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-slate-900">Important Concepts</h4>
                            <p className="text-xs text-slate-400 font-medium">High-impact growth areas</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                        {(data.weaknesses || []).length > 0 ? (
                            (data.weaknesses || []).map((w, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold"
                                >
                                    {w.topic}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic">No critical areas identified. Keep it up!</p>
                        )}
                    </div>
                </SaaSCard>

                {/* Core Dominance */}
                <SaaSCard className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                            <h4 className="text-base font-black text-slate-900">Core Dominance</h4>
                            <p className="text-xs text-slate-400 font-medium">Verified mastery zones</p>
                        </div>
                    </div>
                    <div className="mt-5 space-y-3">
                        {(data.strengths || []).length > 0 ? (
                            (data.strengths || []).map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                    <p className="text-sm font-semibold text-emerald-900">{s.topic}</p>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic">Establishing mastery profile...</p>
                        )}
                    </div>
                </SaaSCard>
            </div>

        </motion.div>
    );
};

export default AnalyticsPage;
