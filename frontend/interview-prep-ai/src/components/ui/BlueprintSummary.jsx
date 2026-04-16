import React from "react";
import { Briefcase, Building2, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const BlueprintSummary = ({ blueprint, className }) => {
    if (!blueprint) return null;

    return (
        <div className={cn("!bg-[#0B1220] rounded-[32px] border border-white/5 ring-1 ring-white/5 p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] space-y-8", className)}>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Interview Blueprint</h3>
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Protocol Source of Truth</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.08] border border-white/5">
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-2">Target Role</p>
                    <p className="text-sm font-black text-white capitalize">{blueprint.targetRole}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.08] border border-white/5">
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-2">Experience</p>
                    <p className="text-sm font-black text-white capitalize">{blueprint.experienceLevel}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    Targeted Technical Signals ({blueprint.skills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                    {blueprint.skills.map((skill, index) => (
                        <span
                            key={index}
                            className="px-4 py-1.5 text-xs font-black bg-white/10 border border-white/10 text-white rounded-full shadow-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {blueprint.targetCompanies && blueprint.targetCompanies.length > 0 && (
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        <Building2 className="h-3 w-3" />
                        Optimized For
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                        {blueprint.targetCompanies.join(", ")}
                    </p>
                </div>
            )}
        </div>
    );
};

export { BlueprintSummary };
