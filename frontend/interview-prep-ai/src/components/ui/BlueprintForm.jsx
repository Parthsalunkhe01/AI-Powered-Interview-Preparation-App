import { useRef, useEffect, useState } from "react";
import { Loader2, Save, X, Sparkles, AlertTriangle, PlusCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
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
import { toast } from "react-hot-toast";

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

        toast.error("Please check the highlighted fields.");
      } else {
        toast.error("Failed to save blueprint. Please try again.");
      }
    }
  };

  return (

    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl mx-auto drop-shadow-xl shadow-slate-200/50">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl sm:rounded-[28px] border border-slate-200 bg-white shadow-xl overflow-visible backdrop-blur-3xl"
      >
        <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 rounded-t-2xl sm:rounded-t-[28px]" />
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 pb-6 sm:pb-10">
          {/* Target Role with Autocomplete */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 tracking-tight">
              Target Role <span className="text-rose-500">*</span>
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
            <Label className="text-sm font-bold text-slate-700 tracking-tight">
              Years of Experience
            </Label>
            <Select
              value={yearsOfExperience}
              onValueChange={setYearsOfExperience}
              disabled={isSaving}
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500/50">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-white border-slate-200 shadow-xl">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="rounded-xl text-slate-700 focus:bg-slate-50 focus:text-slate-900"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills with Smart Recommendations */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 tracking-tight">
              Skills <span className="text-rose-500">*</span>
            </Label>

            {/* Recommended Skills Area */}
            {analysis.recommendedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-5 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 w-full mb-1.5">
                  <Sparkles size={14} className="text-blue-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/70">
                    Suggested Skills
                  </span>
                </div>
                {analysis.recommendedSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSkills(prev => Array.from(new Set([...prev, skill])))}
                    className="px-4 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/40 hover:scale-[1.03] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    <PlusCircle size={12} className="opacity-60" /> {skill}
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Press <kbd className="rounded bg-muted px-1 py-0.5 text-xs text-foreground uppercase font-bold">Enter</kbd> to add</span>
              {isAnalyzing && <span className="flex items-center gap-1.5 animate-pulse text-primary font-medium italic"><Loader2 size={12} className="animate-spin" /> Checking skills...</span>}
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
              variant="premium"
              error={errors.skills}
            />

            {/* Compatibility Warnings */}
            {analysis.warnings.length > 0 && (
              <div className="mt-3 p-4 bg-red-950/30 border border-red-900/40 rounded-2xl flex gap-3.5 animate-in zoom-in-95 duration-400">
                <div className="p-2 bg-red-900/40 rounded-lg shrink-0 h-fit">
                  <AlertTriangle className="text-red-600" size={18} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Heads Up!</h4>
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
            <Label className="text-sm font-bold text-slate-700 tracking-tight">
              Target Companies <span className="text-rose-500">*</span>
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

        {/* Footer (Dark Accent) */}
        <div className="border-t border-slate-200/60 bg-slate-50 px-4 sm:px-8 py-4 sm:py-7 flex items-center justify-between flex-wrap gap-3 sm:gap-4 rounded-b-2xl sm:rounded-b-[28px]">
          <p className="text-xs font-medium text-slate-500 italic tracking-wide">
            {isEditing ? "Updating your profile..." : "Creating your interview profile"}
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
              className="h-11 gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 text-white font-bold uppercase tracking-tight text-xs px-8 shadow-[0_8px_30px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:grayscale"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
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