import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

import CareerTargetBanner from "../../components/CareerTargetBanner";
import TodaysMissionCard from "../../components/TodaysMissionCard";
import InterviewPath from "../../components/InterviewPath";
import SkillSignals from "../../components/SkillSignals";
import BlueprintForm from "../../components/ui/BlueprintForm";
import EmptyState from "../../components/ui/EmptyState";
import SkeletonCard from "../../components/ui/SkeletonCard";

const Dashboard2 = () => {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchBlueprint = async () => {
    try {
      const res = await axiosInstance.get("/api/blueprint");
      if (res.data && res.data.targetRole) {
        setBlueprint(res.data);
      } else {
        setBlueprint(null);
      }
    } catch (err) {
      console.log(err);
      setBlueprint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprint();
  }, []);

  const handleUpdate = async (data) => {
    try {
      const res = await axiosInstance.put("/api/blueprint", data);
      setBlueprint(res.data);
      setIsEditing(false);
      toast({
        title: "Blueprint updated! ✨",
        description: "Your dashboard has been refreshed with your new profile.",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Could not save your changes. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete("/api/blueprint");
      setBlueprint(null);
      toast({
        title: "Blueprint deleted",
        description: "You can create a new profile anytime to start over.",
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Something went wrong while removing your profile.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-10"><SkeletonCard /></div>;

  if (!blueprint) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <EmptyState onCreate={() => navigate("/blueprint")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-500">

        {isEditing ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold px-1">Update Your Profile</h2>
            <BlueprintForm
              initialValues={blueprint}
              isEditing={true}
              onSave={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <CareerTargetBanner
            blueprint={blueprint}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}

        {!isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TodaysMissionCard />
              <InterviewPath />
            </div>
            <SkillSignals blueprint={blueprint} />
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard2;