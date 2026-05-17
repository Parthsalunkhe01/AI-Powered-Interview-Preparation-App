import { useEffect, useState, useContext } from "react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Brain,
  Sparkles,
  ArrowRight
} from "lucide-react";

import CareerTargetBanner from "../../components/CareerTargetBanner";
import TodaysMissionCard from "../../components/TodaysMissionCard";
import InterviewPath from "../../components/InterviewPath";
import SkillSignals from "../../components/SkillSignals";
import BlueprintForm from "../../components/ui/BlueprintForm";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import SaaSCard from "../../components/ui/SaaSCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { UserContext } from "../../context/userContext";


const Dashboard = () => {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // ── Computed Metrics ──────────────────────────────────────────────────
  // Converts avgScore into a percentile rank.
  // Formula: higher score = better rank (lower percentile number = top X%).
  // Based on a simulated normal distribution centered at 52 (typical interview avg).
  function computeGlobalRank(avgScore) {
    if (!avgScore) return null;
    // Map score to top-N% using an inverse bell curve approximation
    // score 90+ → top 5%, score 75 → top 15%, score 60 → top 35%, score ≤40 → top 60%+
    if (avgScore >= 90) return "Top 5%";
    if (avgScore >= 80) return "Top 10%";
    if (avgScore >= 70) return "Top 20%";
    if (avgScore >= 60) return "Top 35%";
    if (avgScore >= 50) return "Top 50%";
    if (avgScore >= 40) return "Top 65%";
    return "Top 80%";
  }

  // Computes score trend between last two sessions.
  function computeScoreTrend(history) {
    if (!history || history.length < 2) return null;
    const last  = history[history.length - 1]?.score ?? 0;
    const prev  = history[history.length - 2]?.score ?? 0;
    const delta = last - prev;
    if (delta === 0) return null;
    return { value: Math.abs(delta).toFixed(1), direction: delta > 0 ? "+" : "-" };
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      setBlueprint(null); // Reset state before fetching
      setStats(null);      // Reset state before fetching
      
      const [blueprintRes, analyticsRes] = await Promise.all([
        axiosInstance.get("/api/blueprint"),
        axiosInstance.get(API_PATHS.ANALYTICS.GET_STATS).catch(() => ({ data: { data: null } }))
      ]);

      if (blueprintRes.data && blueprintRes.data.targetRole) {
        setBlueprint(blueprintRes.data);
      }
      
      if (analyticsRes.data && analyticsRes.data.success) {
        setStats(analyticsRes.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        console.log("🚀 [DEBUG] DeepSpace Dashboard Mounting...");
        fetchData();
    }
  }, [user?.id]);



  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete("/api/blueprint");
      setBlueprint(null);
      localStorage.removeItem("interviewData");
      toast.success("Blueprint and data purged successfully.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
      return (
          <div className="space-y-8">
              <Skeleton className="h-48 w-full rounded-[32px]" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Skeleton className="h-32 rounded-[24px]" />
                  <Skeleton className="h-32 rounded-[24px]" />
                  <Skeleton className="h-32 rounded-[24px]" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Skeleton className="h-64 rounded-[32px]" />
                  <Skeleton className="h-64 rounded-[32px]" />
              </div>
          </div>
      );
  }

  if (!blueprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 transition-all duration-500">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="h-20 w-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Target className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Your AI Journey Starts Here</h1>
            <p className="text-slate-500 max-w-md mx-auto text-lg">
                Create your career blueprint to unlock personalized interview paths, analytics, and expert resources.
            </p>
            <Button size="lg" variant="default" onClick={() => navigate("/blueprint")} className="mt-4 bg-primary text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
                Initialize Blueprint <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 overflow-x-hidden">
      <div className="space-y-10">
      {/* ── Top Hero Section ── */}
      <section className="relative">
          <CareerTargetBanner
            blueprint={blueprint}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
      </section>

      <>
          {/* ── Stats & Activity Row (Responsive Grid) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SaaSCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <Badge variant="success" className="text-[9px]">Live</Badge>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Avg. Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.avgScore ?? 0}%</h3>
                    {(() => {
                      const trend = computeScoreTrend(stats?.history);
                      if (!trend) return null;
                      return (
                        <span className={`text-[11px] font-black ${trend.direction === '+' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {trend.direction}{trend.value}%
                        </span>
                      );
                    })()}
                </div>
            </SaaSCard>

            <SaaSCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shadow-sm border border-purple-100">
                        <Zap className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Global Rank</p>
                <div className="flex items-baseline gap-2 mt-1">
                    {stats?.avgScore !== undefined && stats?.avgScore !== null ? (
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                            {computeGlobalRank(stats.avgScore)}
                        </h3>
                    ) : (
                        <span className="text-sm font-bold text-slate-400 italic">Complete a session</span>
                    )}
                </div>
            </SaaSCard>

            <SaaSCard className="p-6 col-span-1 sm:col-span-2 bg-gradient-to-br from-indigo-50 to-white hover:from-white hover:to-indigo-50 border border-indigo-100/50">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 underline underline-offset-4 decoration-indigo-200">AI Strategic Insight</h4>
                </div>
                <p className="text-base font-bold leading-relaxed text-slate-700 italic">
                  {stats?.insight ? `"${stats.insight}"` : `Great start, ${blueprint.targetRole || 'Engineer'}! Complete more interviews to get personalized AI insights.`}
                </p>
                <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto text-indigo-600 font-bold hover:bg-transparent hover:text-indigo-800" onClick={() => navigate("/analytics")}>
                   View Detailed Breakdown <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
            </SaaSCard>
          </div>

          {/* ── Main Work Area ── */}
          {/* ── Main Work Area (Symmetrical 2-Column Grid) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <TodaysMissionCard sessionLabel={`Next: Session ${(stats?.totalInterviews ?? 0) + 1}`} />
            <SkillSignals blueprint={blueprint} />
          </div>
        </>
      </div>
    </div>
  );
};

export default Dashboard;