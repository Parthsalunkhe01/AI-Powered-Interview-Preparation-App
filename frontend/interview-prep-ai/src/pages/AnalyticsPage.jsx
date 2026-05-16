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
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(API_PATHS.ANALYTICS.GET_STATS);
                if (res.data.success) setData(res.data.data);
            } catch {
                toast.error("Failed to load analytics.");
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Activity className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</p>
        </div>
    );

    if (!data || data.avgScore == null || data.totalInterviews === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
            <SaaSCard className="max-w-md p-12">
                <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-6" />
                <h2 className="text-2xl font-black mb-4">No Sessions Yet</h2>
                <Button variant="saas" onClick={() => window.location.href = "/dashboard"}>
                    Start First Interview
                </Button>
            </SaaSCard>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-20">

            {/* ── 1. Top Stats Row ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Sessions */}
                <SaaSCard className="p-8 relative">
                    <button className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                        <Zap className="h-4 w-4 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sessions</p>
                    <h2 className="text-5xl font-black text-slate-900">{totalSessions}</h2>
                </SaaSCard>

                {/* Mastery Level */}
                <SaaSCard className="p-8 relative">
                    <button className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
                        <Award className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mastery Level</p>
                    <h2 className="text-5xl font-black text-slate-900">{masteryLevel}</h2>
                </SaaSCard>

                {/* Prep Intensity */}
                <SaaSCard className="p-8 relative">
                    <button className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5">
                        <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prep Intensity</p>
                    <h2 className="text-5xl font-black text-slate-900">{prepIntensity}</h2>
                </SaaSCard>
            </div>

            {/* ── 2. Performance Velocity + AI Insight ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Performance Velocity Chart */}
                <SaaSCard className="lg:col-span-8 p-8">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Performance Velocity</h3>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">Trajectory across your session history</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Focus</span>
                    </div>
                    <div className="mt-6 h-[220px]">
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
                <SaaSCard className="lg:col-span-4 p-7 bg-indigo-50/60 border-indigo-100 flex flex-col gap-6">
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
                                const barWidth = Math.max(score, score > 0 ? 8 : 0); // min 8% if score > 0
                                const label    = score === 0 ? "No data" : `${score}%`;
                                const labelCls = score === 0
                                    ? "text-slate-400"
                                    : score < 30 ? "text-rose-500" : "text-indigo-600";
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
                                            className={`h-full rounded-full transition-all duration-700 ${score === 0 ? "bg-slate-300" : score < 30 ? "bg-rose-400" : "bg-indigo-500"}`}
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
                <SaaSCard className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                        <div>
                            <h4 className="text-base font-black text-slate-900">Important Concepts</h4>
                            <p className="text-xs text-slate-400 font-medium">High-impact growth areas</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
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
                <SaaSCard className="p-8">
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
