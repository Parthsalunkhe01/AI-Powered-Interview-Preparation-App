import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import { Zap } from "lucide-react";
import { toast } from "../../hooks/use-toast";
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
      if (blueprint) {
        await axiosInstance.put("/api/blueprint", data);
      } else {
        await axiosInstance.post("/api/blueprint", data);
      }
      setBlueprint(data);

      toast({
        title: "Blueprint saved! 🎯",
        description: "Your interview profile is ready. Personalized questions await.",
      });

      navigate("/dashboard");
    } catch {
      toast({
        title: "Failed to save",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
      setMode("empty");
      toast({
        title: "Blueprint deleted",
        description: "Your interview blueprint has been removed.",
      });
    } catch {
      toast({
        title: "Failed to delete",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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

    if (mode === "create" || mode === "edit") {
      return (
        <BlueprintForm
          initialValues={mode === "edit" && blueprint ? blueprint : undefined}
          isEditing={mode === "edit"}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={blueprint ? () => setMode("view") : undefined}
        />
      );
    }

    if (mode === "view" && blueprint) {
      return (
        <>
          <BlueprintSummaryCard
            blueprint={blueprint}
            onEdit={() => setMode("edit")}
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
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/5 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            Intelligence Blueprint
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Surgical Interview Roadmap
          </h1>



          <p className="text-md text-muted-foreground/80 max-w-sm mx-auto leading-relaxed font-medium italic">
            "One Directive. Infinite Personalized Mastery."
          </p>
        </div>

        {/* Dynamic content area */}
        <div className="relative">{renderContent()}</div>
      </main>
    </div>
  );
};

export default InterviewBlueprintPage;
