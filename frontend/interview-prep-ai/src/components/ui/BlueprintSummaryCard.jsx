import { Briefcase, Clock, Code2, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";

const BlueprintSummaryCard = ({
  blueprint,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl mx-auto drop-shadow-xl shadow-slate-200/50">
      {/* Main Card */}
      <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl overflow-hidden backdrop-blur-3xl">
        
        {/* Accent Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 shadow-lg" />

        <div className="p-10 space-y-10 relative">
          {/* Decorative Back-glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Role + Experience Header */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              <Briefcase className="h-3.5 w-3.5 text-blue-500" />
              Selected Role
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {blueprint.targetRole}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  <Clock className="h-3 w-3" />
                  {blueprint.experienceLevel === "Entry"
                    ? "ENTRY LEVEL"
                    : `${blueprint.experienceLevel.toUpperCase()} EXPERIENCE`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                   {blueprint.questions?.length || 0} Questions Found
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent w-full" />

          {/* Expertise Mapping */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              <Code2 className="h-3.5 w-3.5 text-indigo-500" />
              Technical Skills
            </div>
            <div className="flex flex-wrap gap-2.5">
              {blueprint.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-[11px] font-bold text-indigo-700 tracking-tight shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Target Entities */}
          {blueprint.companies?.length > 0 && (
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                <Building2 className="h-3.5 w-3.5 text-purple-500" />
                Target Companies
              </div>
              <div className="flex flex-wrap gap-2.5">
                {blueprint.companies.map((company) => (
                  <span
                    key={company}
                    className="rounded-full bg-purple-50 border border-purple-200 px-4 py-1 text-[11px] font-bold text-purple-700 tracking-tight"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200/60 bg-slate-50 px-10 py-6 flex items-center justify-between flex-wrap gap-4 rounded-b-[32px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">
            Profile Ready · Ready to Practice
          </p>

          <div className="flex items-center gap-4">
            <Button
              onClick={onDelete}
              disabled={isDeleting}
              variant="outline"
              size="sm"
              className="h-10 px-6 gap-2 text-[11px] font-bold uppercase tracking-widest bg-white border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
            >
              {isDeleting ? (
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete Profile
            </Button>

            <Button
              onClick={onEdit}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 text-white font-bold uppercase tracking-tight text-xs shadow-[0_8px_30px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintSummaryCard;