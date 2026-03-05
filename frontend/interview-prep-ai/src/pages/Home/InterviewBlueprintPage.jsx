import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
      const res = await axios.get("/api/blueprint");
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
        await axios.put("http://localhost:8000/api/blueprint",
        data,
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      } else {
        await axios.post(
  "http://localhost:8000/api/blueprint",
  data,
  {
    headers:{
      Authorization:`Bearer ${localStorage.getItem("token")}`
    }
  }
);
      }
      setBlueprint(data);
      setMode("view");
      
      
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
      await axios.delete("/api/blueprint");
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
      {/* Top nav bar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber to-amber-light shadow-sm">
              <Zap className="h-4 w-4 text-amber-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Interview Prep AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Dashboard</span>
            <span className="hidden sm:inline">/</span>
            <span className="font-medium text-foreground">Blueprint</span>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber-muted px-4 py-1.5 text-xs font-semibold text-amber-foreground mb-2">
            <Zap className="h-3.5 w-3.5" />
            Personalized Interview Engine
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your Interview Blueprint
          </h1>
        


          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Define your goal once.{" "}
            <span className="text-foreground font-medium">Get personalized questions forever.</span>
          </p>
        </div>

        {/* Dynamic content area */}
        <div className="relative">{renderContent()}</div>
      </main>
    </div>
  );
};

export default InterviewBlueprintPage;
