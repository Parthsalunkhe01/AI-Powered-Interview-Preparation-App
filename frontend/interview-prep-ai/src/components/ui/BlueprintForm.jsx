import { useRef, useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import TagInput from "../../components/ui/TagInput";
import { cn } from "../../lib/utils";


const EXPERIENCE_OPTIONS = [
  { value: "0", label: "Entry Level (0 years)" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
  { value: "5", label: "5 years" },
  { value: "6–7", label: "6–7 years" },
  { value: "8–10", label: "8–10 years" },
  { value: "11–15", label: "11–15 years" },
  { value: "15+", label: "15+ years" },
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
    initialValues?.experienceLevel  ?? "0"
  );
  const [skills, setSkills] = useState(initialValues?.skills ?? []);
  const [targetCompanies, setTargetCompanies] = useState(
    initialValues?.companies ?? []
  );
  const [errors, setErrors] = useState({});

  const roleRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => roleRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!targetRole.trim()) {
      newErrors.targetRole = "Target role is required.";
    }
    if (skills.length === 0) {
      newErrors.skills = "Add at least one skill.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      targetRole: targetRole.trim(),
      experienceLevel: yearsOfExperience,
      skills,
      companies: targetCompanies,
    });
  };

  return (
    
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white bg-card shadow-sm overflow-visible"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-amber to-amber-light" />
        <div className="p-8 space-y-6">
          {/* Target Role */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Target Role <span className="text-destructive">*</span>
            </Label>
            <Input
              ref={roleRef}
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                if (errors.targetRole)
                  setErrors((prev) => ({ ...prev, targetRole: undefined }));
              }}
              placeholder="e.g. Senior Software Engineer"
              disabled={isSaving}
              className={cn(
                "h-11 rounded-xl border-input bg-background text-sm transition-all",
                errors.targetRole &&
                  "border-destructive focus-visible:ring-destructive"
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

          {/* Skills */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Skills <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Enter</kbd>{" "}
              or <kbd className="rounded bg-muted px-1 py-0.5 text-xs">,</kbd>{" "}
              to add a skill
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
          </div>

          {/* Companies */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Target Companies{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Enter</kbd>{" "}
              to add a company
            </p>
            <TagInput
              tags={targetCompanies}
              onChange={setTargetCompanies}
              placeholder="Google, Stripe, Notion…"
              disabled={isSaving}
              variant="outline"
            />
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