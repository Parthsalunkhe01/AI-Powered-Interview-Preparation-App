import React from "react";
import { Briefcase, Building2, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const BlueprintSummary = ({ blueprint, className }) => {
    if (!blueprint) return null;

    return (
        <div className={cn("bg-white rounded-[32px] border border-slate-200 ring-1 ring-slate-100 p-8 shadow-xl space-y-8", className)}>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Interview Blueprint</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Protocol Source of Truth</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Target Role</p>
                    <p className="text-sm font-black text-slate-900 capitalize">{blueprint.targetRole}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Experience</p>
                    <p className="text-sm font-black text-slate-900 capitalize">{blueprint.experienceLevel}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                    Targeted Technical Signals ({blueprint.skills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                    {blueprint.skills.map((skill, index) => (
                        <span
                            key={index}
                            className="px-4 py-1.5 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-full shadow-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {blueprint.targetCompanies && blueprint.targetCompanies.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <Building2 className="h-3 w-3" />
                        Optimized For
                    </div>
                    <p className="text-xs text-slate-600 italic">
                        {blueprint.targetCompanies.join(", ")}
                    </p>
                </div>
            )}
        </div>
    );
};

export { BlueprintSummary };
