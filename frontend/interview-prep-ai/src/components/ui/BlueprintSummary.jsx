import React from "react";
import { Briefcase, Building2, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const BlueprintSummary = ({ blueprint, className }) => {
    if (!blueprint) return null;

    return (
    <div className={cn("bg-white rounded-2xl sm:rounded-[28px] border border-slate-200 ring-1 ring-slate-100 p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6", className)}>
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div>
                <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">Interview Profile</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Personalized Profile</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Target Role</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 capitalize">{blueprint.targetRole}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Experience</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 capitalize">{blueprint.experienceLevel}</p>
            </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                Technical Skills ({blueprint.skills.length})
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {blueprint.skills.map((skill, index) => (
                    <span
                        key={index}
                        className="px-2.5 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-full shadow-sm"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </div>

        {blueprint.targetCompanies && blueprint.targetCompanies.length > 0 && (
            <div className="pt-3 sm:pt-4 border-t border-slate-200">
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
