import { Briefcase, Clock, Building2, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";

const CareerTargetBanner = ({ blueprint, onDelete, isDeleting }) => {

  const role = blueprint?.targetRole || "Role";
  const experience = blueprint?.experienceLevel || "Entry";
  const companies = blueprint?.companies || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-amber-50 rounded-xl border border-amber-100 shrink-0">
              <Briefcase size={18} className="text-amber-600 sm:hidden" />
              <Briefcase size={22} className="text-amber-600 hidden sm:block" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground leading-tight truncate">
                {role}
              </h2>
              <div className="flex items-center gap-2 sm:gap-4 mt-0.5 flex-wrap">
                <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Clock size={13} />
                  {experience} Level
                </p>
                <div className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                <p className="text-xs text-slate-500 italic hidden sm:block">
                  Personalized interview profile active
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
            {companies.map((company) => (
              <span
                key={company}
                className="px-2 py-1 sm:px-3 rounded-lg bg-slate-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200 flex items-center gap-1"
              >
                <Building2 size={10} />
                {company}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-8 gap-1.5 rounded-xl text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all bg-white"
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CareerTargetBanner;