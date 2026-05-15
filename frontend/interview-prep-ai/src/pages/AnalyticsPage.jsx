import React, { useState, useEffect, useContext } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, Activity, Target, Zap, AlertTriangle, Star, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import { toast } from "react-hot-toast";
import SaaSCard from "../components/ui/SaaSCard";
import { Button } from "../components/ui/Button";
import { UserContext } from "../context/userContext";

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
                toast.error("Failed to load command center.");
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

    if (!data || !data.avgScore) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
            <SaaSCard className="max-w-md p-12">
                <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-6" />
                <h2 className="text-2xl font-black mb-4">No Sessions Yet</h2>
                <Button variant="saas" onClick={() => window.location.href = "/dashboard"}>Start First Interview</Button>
            </SaaSCard>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-20">
            
            {/* ── 1. Top Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SaaSCard className="p-8 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Performance</p>
                        <h2 className={`text-5xl font-black ${data.status.color === 'rose' ? 'text-rose-600' : 'text-indigo-600'}`}>
                            {data.avgScore}%
                        </h2>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl bg-${data.status.color}-50 border border-${data.status.color}-100`}>
                        <p className={`text-xs font-black text-${data.status.color}-600 tracking-wider`}>{data.status.label}</p>
                    </div>
                </SaaSCard>

                <SaaSCard className="p-8">
                    <div className="flex justify-between items-end">
                        <div className="flex-1 h-[60px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.history}>
                                    <Area type="monotone" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ml-6 text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocity</p>
                             <div className="flex items-center justify-end gap-1 text-emerald-600 font-black">
                                 <TrendingUp className="h-4 w-4" /> Improving
                             </div>
                        </div>
                    </div>
                </SaaSCard>
            </div>

            {/* ── 2. MAIN FOCUS CARD (Decision Driver) ── */}
            {data.mainFocus && (
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <SaaSCard className="p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Target className="h-40 w-40" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Priority #1 Recommendation</p>
                                    <h3 className="text-2xl font-black">Master {data.mainFocus.domain}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                        {data.mainFocus.impact} You are currently <span className="text-white font-bold">{data.mainFocus.gap}% below</span> industry benchmark.
                                    </p>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Expected Outcome</p>
                                        <p className="text-sm font-bold">{data.mainFocus.expectedImprovement}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exact Actions to Fix</p>
                                    {data.mainFocus.actions.map((action, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group cursor-default">
                                            <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SaaSCard>
                </motion.div>
            )}

            {/* ── 3. Secondary Performance Matrix ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SaaSCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Secondary Gaps</h4>
                    </div>
                    <div className="space-y-3">
                        {data.weaknesses.map((w, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-sm font-bold text-slate-800">{w.topic}</p>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${w.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {w.avgScore}%
                                </span>
                            </div>
                        ))}
                    </div>
                </SaaSCard>

                <SaaSCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Star className="h-4 w-4 text-emerald-500" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Key Strengths</h4>
                    </div>
                    <div className="space-y-3">
                        {data.strengths.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                                <p className="text-sm font-bold text-emerald-900">{s.topic}</p>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-xs font-medium text-slate-500 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                        "{data.recruiterSummary}"
                    </p>
                </SaaSCard>
            </div>

            {/* ── 4. ACTION PLAN ── */}
            <div className="pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-xl font-black">Your Daily Action Plan</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {data.actionPlan.map((step, i) => (
                        <motion.div key={i} whileHover={{ y: -5 }} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{step.time}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{step.task}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="h-1 w-1 rounded-full bg-slate-300" /> {step.topic}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyticsPage;
