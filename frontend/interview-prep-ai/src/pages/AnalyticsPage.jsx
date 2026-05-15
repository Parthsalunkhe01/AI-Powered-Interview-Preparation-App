import React, { useState, useEffect, useContext } from "react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from "recharts";
import {
    TrendingUp, Award, Clock, BarChart2, AlertCircle,
    CheckCircle2, Brain, Sparkles, ChevronRight, LayoutDashboard,
    Activity, Target, Zap, ArrowUpRight, MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import { toast } from "react-hot-toast";
import SaaSCard from "../components/ui/SaaSCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { UserContext } from "../context/userContext";


const AnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await axiosInstance.get(API_PATHS.ANALYTICS.GET_STATS);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
                toast.error("Failed to load performance analytics.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-spin">
                    <Activity className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs animate-pulse">Loading intelligence...</p>
            </div>
        );
    }

    if (!data || data.totalInterviews === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
                <SaaSCard className="max-w-md p-12" hover={false}>
                    <div className="h-20 w-20 rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8 mx-auto shadow-sm">
                        <BarChart2 className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-4">No Data Yet</h2>
                    <p className="text-muted-foreground mb-8 text-lg font-medium leading-relaxed">
                        Start your first AI mock interview to see how you perform and get personalized tips for improvement.
                    </p>
                    <Button 
                        variant="saas"
                        size="lg"
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full"
                    >
                        Start Your First Interview
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </SaaSCard>
            </div>
        );
    }

    const stats = [
        { label: "Total Sessions", value: data.totalInterviews, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Average Score", value: `${data.avgScore}%`, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Practice Time", value: `${Math.floor(data.totalTime / 60)}m`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 pb-12"
        >
            {/* ── Metric Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <SaaSCard key={i} className="p-7">
                        <div className="flex items-center justify-between mb-5">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tight text-slate-900">{stat.value}</h3>
                    </SaaSCard>
                ))}
            </div>

            {/* ── Analytics Engine ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Score Velocity */}
                <SaaSCard className="lg:col-span-8 p-10 self-start">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Score Progress</h3>
                            <p className="text-sm text-slate-500 font-medium italic">How your scores have changed over time</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest</p>
                                <p className="text-sm font-black text-emerald-600">{data.highestScore}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lowest</p>
                                <p className="text-sm font-black text-rose-500">{data.lowestScore}%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.history.map((h, i) => ({ ...h, index: i + 1 }))}>
                                <defs>
                                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="index" 
                                    stroke="#cbd5e1" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{fill: '#64748b', fontWeight: 700}}
                                />
                                <YAxis 
                                    stroke="#cbd5e1" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{fill: '#64748b', fontWeight: 700}}
                                    domain={[0, 100]}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '16px', 
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                    }}
                                    itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 800 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#velocityGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Domain Performance Row */}
                    <div className="mt-10 pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <LayoutDashboard className="h-4 w-4 text-slate-400" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Domain Performance</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {data.domainPerformance?.length > 0 ? (
                                data.domainPerformance.slice(0, 4).map((dp, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">{dp.domain}</span>
                                            <span className="text-primary">{dp.score}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${dp.score}%` }}
                                                className="h-full bg-primary rounded-full transition-all duration-1000" 
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">No domain data yet.</p>
                            )}
                        </div>
                    </div>
                </SaaSCard>

                {/* Sidebar: Performance Summary */}
                <div className="lg:col-span-4 space-y-8 self-start">
                    <SaaSCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Brain className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-900">Performance Summary</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Strong Areas</p>
                                <ul className="space-y-2">
                                    {data.summary?.strong?.map((s, i) => (
                                        <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Needs Improvement</p>
                                <ul className="space-y-2">
                                    {data.summary?.weak?.map((w, i) => (
                                        <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                                            <div className="h-1 w-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Next Recommendation</p>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                                    {data.summary?.recommendation}
                                </p>
                            </div>
                        </div>
                    </SaaSCard>

                    <SaaSCard className="p-8">
                         <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recruiter Insight</h3>
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                            "{data.insight}"
                        </p>
                    </SaaSCard>
                </div>
            </div>

            {/* ── Strategy Board ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <SaaSCard className="p-10 border-rose-100 self-start">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                             <h3 className="text-lg font-bold leading-none text-slate-900">Areas to Improve</h3>
                             <p className="text-xs text-muted-foreground mt-1 font-medium italic">High-impact growth areas</p>
                        </div>
                    </div>
                    <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {Object.keys(data.groupedWeaknesses || {}).length > 0 ? (
                            Object.entries(data.groupedWeaknesses).map(([domain, topics], i) => (
                                <div key={i} className="space-y-3">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{domain}</h4>
                                    <ul className="space-y-2">
                                        {topics.map((t, idx) => (
                                            <li key={idx} className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-rose-500" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Great performance across all areas.</p>
                        )}
                    </div>
                </SaaSCard>

                <SaaSCard className="p-10 border-emerald-100 self-start">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                             <h3 className="text-lg font-bold leading-none text-slate-900">Your Strengths</h3>
                             <p className="text-xs text-muted-foreground mt-1 font-medium italic">Topics you have mastered</p>
                        </div>
                    </div>
                    <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {Object.keys(data.groupedStrengths || {}).length > 0 ? (
                            Object.entries(data.groupedStrengths).map(([domain, topics], i) => (
                                <div key={i} className="space-y-3">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{domain}</h4>
                                    <ul className="space-y-2">
                                        {topics.map((t, idx) => (
                                            <li key={idx} className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Start interviews to see your strengths.</p>
                        )}
                    </div>
                </SaaSCard>
            </div>
        </motion.div>
    );
};

export default AnalyticsPage;

