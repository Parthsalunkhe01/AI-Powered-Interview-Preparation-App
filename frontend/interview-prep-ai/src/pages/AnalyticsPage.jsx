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
import { Button } from "../components/ui/button";
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
                setData(null); // Reset before fetch
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
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">Synchronizing performance data...</p>
            </div>
        );
    }

    if (!data || data.totalInterviews === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
                <SaaSCard className="max-w-md p-12" hover={false}>
                    <div className="h-20 w-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 mx-auto shadow-2xl">
                        <BarChart2 className="h-10 w-10 text-primary/40" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-4">No Performance History</h2>
                    <p className="text-muted-foreground mb-8 text-lg font-medium leading-relaxed">
                        Data is the fuel for improvement. Start your first AI-powered interview session to unlock surgical insights into your performance.
                    </p>
                    <Button 
                        variant="saas"
                        size="lg"
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full"
                    >
                        Initialize Mastery Session
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </SaaSCard>
            </div>
        );
    }

    const stats = [
        { label: "Total Sessions", value: data.totalInterviews, icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Mastery Level", value: `${data.avgScore}%`, icon: Award, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Prep Intensity", value: `${Math.floor(data.totalTime / 60)}m`, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
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
                            <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
                    </SaaSCard>
                ))}
            </div>

            {/* ── Analytics Engine ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Velocity */}
                <SaaSCard className="lg:col-span-8 p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight">Performance Velocity</h3>
                            <p className="text-sm text-zinc-300 font-bold italic">Trajectory across your session history</p>
                        </div>
                        <div className="flex gap-2">
                           <Badge variant="outline">Score Focus</Badge>
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="index" 
                                    stroke="rgba(255,255,255,0.2)" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{fill: 'rgba(255,255,255,0.4)', fontWeight: 700}}
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.2)" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{fill: 'rgba(255,255,255,0.4)', fontWeight: 700}}
                                    domain={[0, 100]}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#0d0d0f', 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}
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
                </SaaSCard>

                {/* Radar: Topic Mastery */}
                <div className="lg:col-span-4 space-y-8">
                    <SaaSCard className="h-full p-8 flex flex-col items-center justify-center text-center">
                        <div className="p-4 rounded-[24px] bg-primary/15 border border-primary/20 mb-6 shadow-2xl shadow-primary/10">
            
                            <h2 className="text-xl font-black mb-1">AI Contextual Insight</h2>
                        </div>
                        
                        <p className="text-sm font-bold text-zinc-300 leading-relaxed italic">
                            "{data.insight}"
                        </p>
                        <div className="mt-8 pt-8 border-t border-white/5 w-full">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">Top Signal Areas</p>
                            <div className="space-y-4 text-left">
                                {data.topicPerformance.slice(0, 3).map((tp, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[11px] font-bold">
                                            <span>{tp.topic}</span>
                                            <span className="text-primary">{tp.avgScore}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${tp.avgScore}%` }}
                                                className="h-full bg-primary rounded-full transition-all duration-1000" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SaaSCard>
                </div>
            </div>

            {/* ── Strategy Board ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SaaSCard className="p-10 border-rose-500/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-rose-400" />
                        </div>
                        <div>
                             <h3 className="text-lg font-black leading-none">Practice Prioritization</h3>
                             <p className="text-xs text-muted-foreground mt-1 font-medium italic">High-impact growth areas</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {data.weakTopics && data.weakTopics.length > 0 ? (
                            data.weakTopics.map((topic, i) => (
                                <Badge key={i} variant="destructive" className="px-4 py-1.5 rounded-xl normal-case font-bold">{topic}</Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Elite performance across all sectors.</p>
                        )}
                    </div>
                </SaaSCard>

                <SaaSCard className="p-10 border-emerald-500/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                             <h3 className="text-lg font-black leading-none">Core Dominance</h3>
                             <p className="text-xs text-muted-foreground mt-1 font-medium italic">Verified mastery zones</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {data.strongTopics && data.strongTopics.length > 0 ? (
                            data.strongTopics.map((topic, i) => (
                                <Badge key={i} variant="success" className="px-4 py-1.5 rounded-xl normal-case font-bold">{topic}</Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Establishing mastery profile...</p>
                        )}
                    </div>
                </SaaSCard>
            </div>
        </motion.div>
    );
};

export default AnalyticsPage;

