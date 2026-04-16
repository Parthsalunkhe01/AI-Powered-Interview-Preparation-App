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
import { Button } from "../../components/ui/button";
import { UserContext } from "../../context/userContext";


const Dashboard = () => {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

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

  const handleUpdate = async (data) => {
    try {
      const res = await axiosInstance.put("/api/blueprint", data);
      setBlueprint(res.data);
      setIsEditing(false);
      toast.success("Blueprint updated! ✨");
    } catch {
      toast.error("Update failed. Please check your inputs.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete("/api/blueprint");
      setBlueprint(null);
      toast.success("Blueprint deleted.");
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-grid">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
                <Target className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Your AI Journey Starts Here</h1>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
                Create your career blueprint to unlock personalized interview paths, analytics, and expert resources.
            </p>
            <Button size="lg" variant="saas" onClick={() => navigate("/blueprint")} className="mt-4">
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
        {isEditing ? (
          <SaaSCard className="border-primary/20">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Modify Your Trajectory</h2>
            <BlueprintForm
              initialValues={blueprint}
              isEditing={true}
              onSave={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </SaaSCard>
        ) : (
          <CareerTargetBanner
            blueprint={blueprint}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </section>

      {!isEditing && (
        <>
          {/* ── Stats & Activity Row (Responsive Grid) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SaaSCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <Badge variant="success" className="text-[9px]">Live</Badge>
                </div>
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1.5">Avg. Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.avgScore || 0}%</h3>
                    <span className="text-[11px] text-emerald-400 font-black">+2.4%</span>
                </div>
            </SaaSCard>

            <SaaSCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                        <Zap className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-1.5">Global Rank</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-4xl font-black text-white tracking-tighter">Top 12%</h3>
                </div>
            </SaaSCard>

            <SaaSCard className="p-6 col-span-1 sm:col-span-2 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary underline underline-offset-4 decoration-primary/30">AI Strategic Insight</h4>
                </div>
                <p className="text-base font-bold leading-relaxed text-zinc-100 italic">
                  "{stats?.insight || `Great start, ${blueprint.targetRole || 'Engineer'}! Complete more interviews to get personalized AI insights.`}"
                </p>
                <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto text-primary font-bold hover:bg-transparent" onClick={() => navigate("/analytics")}>
                   View Detailed Breakdown <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
            </SaaSCard>
          </div>

          {/* ── Main Work Area ── */}
          {/* ── Main Work Area (Symmetrical 2-Column Grid) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <TodaysMissionCard sessionLabel={`Session ${stats?.totalInterviews + 1 || 1}`} />
            <SkillSignals blueprint={blueprint} />
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Dashboard;