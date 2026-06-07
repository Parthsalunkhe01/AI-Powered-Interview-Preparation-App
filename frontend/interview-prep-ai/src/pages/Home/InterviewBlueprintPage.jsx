import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import BlueprintSummaryCard from "../../components/ui/BlueprintSummaryCard";
import BlueprintForm from "../../components/ui/BlueprintForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";



const InterviewBlueprintPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("loading");
  const [blueprint, setBlueprint] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ─── Fetch blueprint on mount ─────────────────────────────────────────────
  const fetchBlueprint = useCallback(async () => {
    setMode("loading");
    try {
      const res = await axiosInstance.get("/api/blueprint");
      if (res.data && res.data.targetRole) {
        setBlueprint(res.data);
        setMode("view");
      } else {
        setMode("empty");
      }
    } catch (err) {
      // Gracefully fall to empty state when no backend is connected
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setMode("empty");
      } else {
        // No backend — demo/preview mode
        setMode("empty");
      }
    }
  }, []);

  useEffect(() => {
    fetchBlueprint();
  }, [fetchBlueprint]);

  // ─── Save (create or update) ──────────────────────────────────────────────
  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      let res;
      if (blueprint) {
        res = await axiosInstance.put("/api/blueprint", data);
      } else {
        try {
          res = await axiosInstance.post("/api/blueprint", data);
        } catch (postErr) {
          // Blueprint already exists — fall back to PUT
          if (postErr.response?.status === 400) {
            res = await axiosInstance.put("/api/blueprint", data);
          } else {
            throw postErr;
          }
        }
      }
      // Use server response so _id and timestamps are correct
      setBlueprint(res.data);
      toast.success("Blueprint saved! 🎯");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteDialogOpen(false);
    try {
      await axiosInstance.delete("/api/blueprint");
      setBlueprint(null);
      localStorage.removeItem("interviewData"); // Hard reset
      setMode("empty");
      toast.success("Blueprint and profile data purged successfully.");
    } catch {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (mode === "loading") {
      return <SkeletonCard />;
    }

    if (mode === "empty") {
      return <EmptyState onCreate={() => setMode("create")} />;
    }

    if (mode === "create") {
      return (
        <BlueprintForm
          isSaving={isSaving}
          onSave={handleSave}
        />
      );
    }

    if (mode === "view" && blueprint) {
      return (
        <>
          <BlueprintSummaryCard
            blueprint={blueprint}
            onDelete={() => setDeleteDialogOpen(true)}
            isDeleting={isDeleting}
          />
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger className="hidden" />
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Blueprint?</AlertDialogTitle>
                <AlertDialogDescription>

                  This will permanently remove your interview blueprint. Your personalized
                  questions will no longer be tailored to your profile. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Delete It
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }

    return <div className="text-center text-red-500">Invalid mode: {mode}</div>;;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Page content */}
      <main className="mx-auto max-w-3xl px-4 pt-8 pb-20">
        {/* Page header */}
        <div className="mb-6 sm:mb-8 text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-2">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-600" />
            Interview Profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Personalized Interview Plan
          </h1>

          <p className="text-sm text-slate-500 max-w-xs sm:max-w-sm mx-auto leading-relaxed font-medium italic">
            "Your journey to success starts with a clear plan."
          </p>
        </div>

        {/* Dynamic content area */}
        <div className="relative">{renderContent()}</div>
      </main>
    </div>
  );
};

export default InterviewBlueprintPage;
