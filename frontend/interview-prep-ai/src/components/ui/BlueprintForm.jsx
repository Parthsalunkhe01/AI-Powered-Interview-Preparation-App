import { useRef, useEffect, useState } from "react";
import { Loader2, Save, X, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import TagInput from "../../components/ui/TagInput";
import { AutocompleteInput } from "../../components/ui/AutocompleteInput";
import { cn } from "../../lib/utils";
import axiosInstance from "../../utils/axiosInstance";

const EXPERIENCE_OPTIONS = [
  { value: "Entry", label: "Entry Level" },
  { value: "Mid-Level", label: "Mid-Level" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead / Architect" },
];

const BlueprintForm = ({
  initialValues,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [targetRole, setTargetRole] = useState(initialValues?.targetRole ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    initialValues?.experienceLevel ?? "Entry"
  );
  const [skills, setSkills] = useState(initialValues?.skills ?? []);
  const [targetCompanies, setTargetCompanies] = useState(
    initialValues?.companies ?? []
  );
  const [errors, setErrors] = useState({});
  const [analysis, setAnalysis] = useState({ score: 1.0, warnings: [], recommendedSkills: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Intelligent Compatibility Check
  useEffect(() => {
    const checkCompatibility = async () => {
      if (!targetRole || targetRole.length < 3) return;
      setIsAnalyzing(true);
      try {
        const compRes = await axiosInstance.post("/api/suggestions/analyze", {
          role: targetRole,
          skills: skills
        });
        setAnalysis(compRes.data);
      } catch (err) {
        console.error("Compatibility check failed", err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timeoutId = setTimeout(checkCompatibility, 500);
    return () => clearTimeout(timeoutId);
  }, [targetRole, skills]);

  const roleRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => roleRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const newErrors = {};
    const garbageRegex = /^[a-zA-Z0-9\s.\-&/]+$/;

    if (!targetRole.trim()) {
      newErrors.targetRole = "Target role is required.";
    } else if (targetRole.trim().length < 2) {
      newErrors.targetRole = "Role must be at least 2 characters.";
    } else if (!garbageRegex.test(targetRole)) {
      newErrors.targetRole = "Special characters not allowed in role.";
    }

    if (skills.length === 0) {
      newErrors.skills = "Add at least one technical skill.";
    }

    if (targetCompanies.length === 0) {
      newErrors.companies = "Add at least one target company.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSave({
        targetRole: targetRole.trim(),
        experienceLevel: yearsOfExperience,
        skills,
        companies: targetCompanies,
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);

        toast({
          title: "Validation Error",
          description: "Please check the highlighted fields.",
          variant: "destructive",
        });
      }
    }
  };

  return (

    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-card shadow-sm overflow-visible"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-amber to-amber-light" />
        <div className="p-8 space-y-6">
          {/* Target Role with Autocomplete */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Target Role <span className="text-destructive">*</span>
            </Label>
            <AutocompleteInput
              suggestionType="roles"
              value={targetRole}
              onChange={(val) => {
                setTargetRole(val);
                if (errors.targetRole)
                  setErrors((prev) => ({ ...prev, targetRole: undefined }));
              }}
              placeholder="e.g. Android Developer"
              className={cn(
                errors.targetRole && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.targetRole && (
              <p className="text-xs text-destructive">{errors.targetRole}</p>
            )}
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Years of Experience
            </Label>
            <Select
              value={yearsOfExperience}
              onValueChange={setYearsOfExperience}
              disabled={isSaving}
            >
              <SelectTrigger className="h-11 rounded-xl border-input bg-background text-sm">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills with Smart Recommendations */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Skills <span className="text-destructive">*</span>
            </Label>

            {/* Recommended Skills Area */}
            {analysis.recommendedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3.5 bg-primary/5 rounded-2xl border border-primary/10 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-1.5 w-full mb-1">
                  <Sparkles size={14} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    Recommended for {targetRole || "this role"}
                  </span>
                </div>
                {analysis.recommendedSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSkills(prev => Array.from(new Set([...prev, skill])))}
                    className="px-3 py-1.5 rounded-xl bg-card border border-accent/20 text-[11px] font-semibold text-accent hover:bg-accent hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Press <kbd className="rounded bg-muted px-1 py-0.5 text-xs text-foreground uppercase font-bold">Enter</kbd> to add</span>
              {isAnalyzing && <span className="flex items-center gap-1.5 animate-pulse text-primary font-medium italic"><Loader2 size={12} className="animate-spin" /> Analyzing compatibility...</span>}
            </p>

            <TagInput
              tags={skills}
              onChange={(tags) => {
                setSkills(tags);
                if (errors.skills && tags.length > 0)
                  setErrors((prev) => ({ ...prev, skills: undefined }));
              }}
              placeholder="React, TypeScript, Node.js…"
              disabled={isSaving}
              variant="amber"
              error={errors.skills}
            />

            {/* Compatibility Warnings */}
            {analysis.warnings.length > 0 && (
              <div className="mt-3 p-4 bg-red-950/30 border border-red-900/40 rounded-2xl flex gap-3.5 animate-in zoom-in-95 duration-400">
                <div className="p-2 bg-red-900/40 rounded-lg shrink-0 h-fit">
                  <AlertTriangle className="text-red-600" size={18} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Intelligence Warning</h4>
                  {analysis.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-red-300 leading-relaxed font-medium">
                      {w}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Companies with Autocomplete */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Target Companies <span className="text-destructive">*</span>
            </Label>
            <AutocompleteInput
              suggestionType="companies"
              value={targetCompanies[0] || ""}
              onChange={(val) => {
                setTargetCompanies(val ? [val] : []);
                if (errors.companies && val)
                  setErrors((prev) => ({ ...prev, companies: undefined }));
              }}
              placeholder="e.g. Google, Stripe, Notion…"
              className={cn(
                errors.companies && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.companies && (
              <p className="text-xs text-destructive">{errors.companies}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-8 py-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">
            {isEditing ? "Editing your blueprint" : "Creating a new blueprint"}
          </p>

          <div className="flex items-center gap-3">
            {isEditing && onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSaving}
                className="h-10 gap-1.5 rounded-xl text-sm"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 gap-2 rounded-xl bg-gradient-to-r from-amber to-amber-light px-6 font-semibold shadow-sm hover:opacity-90 hover:shadow-md transition-all duration-200 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Blueprint
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlueprintForm;