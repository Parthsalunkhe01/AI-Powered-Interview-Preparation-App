import { Briefcase, Clock, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

const CareerTargetBanner = ({ blueprint, onEdit, onDelete, isDeleting }) => {

  const role = blueprint?.targetRole || "Role";
  const experience = blueprint?.experienceLevel || "Entry";
  const companies = blueprint?.companies || [];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber/10 rounded-xl">
              <Briefcase size={22} className="text-amber" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                {role}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock size={15} />
                  {experience} Level
                </p>
                <div className="h-1 w-1 rounded-full bg-border" />
                <p className="text-xs text-muted-foreground italic">
                  Personalized interview profile active
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center md:justify-end">
          <div className="flex flex-wrap gap-2 mr-4 border-r border-border pr-6">
            {companies.map((company) => (
              <span
                key={company}
                className="px-3 py-1 rounded-lg bg-secondary text-[11px] font-bold uppercase tracking-wider text-secondary-foreground border border-border flex items-center gap-1.5"
              >
                <Building2 size={11} />
                {company}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 gap-2 rounded-xl text-xs font-semibold border-amber/20 hover:bg-amber/5 hover:text-amber transition-all"
            >
              <Edit2 size={14} />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-9 gap-2 rounded-xl text-xs font-semibold border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CareerTargetBanner;