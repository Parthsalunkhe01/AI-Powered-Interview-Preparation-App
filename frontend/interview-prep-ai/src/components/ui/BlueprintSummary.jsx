import React from "react";
import { Briefcase, Building2, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const BlueprintSummary = ({ blueprint, className }) => {
    if (!blueprint) return null;

    return (
        <div className={cn("bg-card rounded-3xl border border-border p-8 shadow-sm space-y-6", className)}>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">Interview Blueprint</h3>
                    <p className="text-sm text-muted-foreground">Source of Truth for this session</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted border border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target Role</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{blueprint.targetRole}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted border border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{blueprint.experienceLevel}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 text-accent" />
                    Targeted Skills ({blueprint.skills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                    {blueprint.skills.map((skill, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 text-xs font-medium bg-muted border border-border text-foreground rounded-full"
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
