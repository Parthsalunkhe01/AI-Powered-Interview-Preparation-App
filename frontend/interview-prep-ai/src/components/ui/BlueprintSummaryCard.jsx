import { Briefcase, Clock, Code2, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";

const BlueprintSummaryCard = ({
  blueprint,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl mx-auto">
      {/* Main Card */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        
        {/* Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber to-amber-light" />

        <div className="p-8 space-y-7">

          {/* Role + Experience */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              Target Role
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {blueprint.targetRole}
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                <Clock className="h-3 w-3" />
                {blueprint.experienceLevel === "0"
                  ? "Entry Level"
                  : `${blueprint.experienceLevel} yrs exp`}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Skills */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Code2 className="h-3.5 w-3.5" />
              Skills
            </div>

            <div className="flex flex-wrap gap-2">
              {blueprint.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-lg bg-amber px-3 py-1 text-xs font-semibold text-amber-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Companies */}
          {blueprint.companies?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Target Companies
              </div>

              <div className="flex flex-wrap gap-2">
                {blueprint.companies.map((company) => (
                  <span
                    key={company}
                    className="inline-flex items-center rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">
            Your blueprint is active · Questions personalized to your profile
          </p>

          <div className="flex items-center gap-2">
            
            <Button
              onClick={onDelete}
              disabled={isDeleting}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg text-xs"
            >
              {isDeleting ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </Button>

            <Button
              onClick={onEdit}
              size="sm"
              className="gap-1.5 rounded-lg bg-gradient-to-r from-amber to-amber-light px-4 text-amber-foreground text-xs font-semibold hover:opacity-90 transition-all"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Blueprint
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintSummaryCard;