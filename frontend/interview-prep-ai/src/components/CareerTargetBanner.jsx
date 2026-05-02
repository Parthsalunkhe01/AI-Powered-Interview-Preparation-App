import { Briefcase, Clock, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";

const CareerTargetBanner = ({ blueprint, onEdit, onDelete, isDeleting }) => {

  const role = blueprint?.targetRole || "Role";
  const experience = blueprint?.experienceLevel || "Entry";
  const companies = blueprint?.companies || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
              <Briefcase size={22} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                {role}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                  <Clock size={15} />
                  {experience} Level
                </p>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <p className="text-xs text-slate-500 italic">
                  Personalized interview profile active
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center md:justify-end">
          <div className="flex flex-wrap gap-2.5">
            {companies.map((company) => (
              <span
                key={company}
                className="px-3 py-1 rounded-lg bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200 flex items-center gap-1.5"
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
              className="h-9 gap-2 rounded-xl text-xs font-semibold border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-all bg-white"
            >
              <Edit2 size={14} />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-9 gap-2 rounded-xl text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all bg-white"
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