import { Briefcase, Clock, Code2, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";

const BlueprintSummaryCard = ({
  blueprint,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Main Card */}
      <div className="rounded-[32px] border border-white/10 bg-neutral-950/80 shadow-2xl overflow-hidden backdrop-blur-3xl">
        
        {/* Accent Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 shadow-lg" />

        <div className="p-10 space-y-10 relative">
          {/* Decorative Back-glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Role + Experience Header */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <Briefcase className="h-3.5 w-3.5 text-blue-400" />
              Active Objective
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-black tracking-tighter text-white leading-none">
                {blueprint.targetRole}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  <Clock className="h-3 w-3" />
                  {blueprint.experienceLevel === "Entry"
                    ? "ENTRY LEVEL"
                    : `${blueprint.experienceLevel.toUpperCase()} EXPERIENCE`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                   {blueprint.questions?.length || 0} Artifacts Linked
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-zinc-800/50 via-white/5 to-transparent w-full" />

          {/* Expertise Mapping */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              Intelligence Domains
            </div>
            <div className="flex flex-wrap gap-2.5">
              {blueprint.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl bg-white/5 border border-white/10 px-4 py-1.5 text-[11px] font-bold text-zinc-200 tracking-tight shadow-inner"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Target Entities */}
          {blueprint.companies?.length > 0 && (
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
                Target Organizations
              </div>
              <div className="flex flex-wrap gap-2.5">
                {blueprint.companies.map((company) => (
                  <span
                    key={company}
                    className="rounded-full bg-purple-500/5 border border-purple-500/20 px-4 py-1 text-[11px] font-bold text-purple-300 tracking-tight"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/5 bg-neutral-900/40 px-10 py-6 flex items-center justify-between flex-wrap gap-4 rounded-b-[32px]">
          <p className="text-[10px] font-bold text-zinc-500/60 uppercase tracking-[0.2em] italic">
            Objective Active · Strategy Decentralized
          </p>

          <div className="flex items-center gap-4">
            <Button
              onClick={onDelete}
              disabled={isDeleting}
              variant="ghost"
              size="sm"
              className="h-10 px-6 gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
            >
              {isDeleting ? (
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Retire Blueprint
            </Button>

            <Button
              onClick={onEdit}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600 text-white font-black uppercase tracking-tighter text-xs shadow-[0_8px_30px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Modify Objective
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintSummaryCard;