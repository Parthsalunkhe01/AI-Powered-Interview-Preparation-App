import React from "react";
import { Award, Zap, Timer } from "lucide-react";

const ReadinessStatus = ({ status = "Improving" }) => {
    const configs = {
        "Ready": {
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            icon: Award,
            label: "Ready for Interview",
            desc: "Outstanding performance! You're prepared for the actual rounds."
        },
        "Improving": {
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            icon: Zap,
            label: "Showing Progress",
            desc: "Good grasp of concepts. Focus on the identified growth areas."
        },
        "Needs Practice": {
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-100",
            icon: Timer,
            label: "Needs Refinement",
            desc: "Keep practicing. Consistency in technical depth will help."
        }
    };

    const config = configs[status] || configs["Improving"];
    const Icon = config.icon;

    return (
        <div className={`p-6 rounded-[2rem] border ${config.border} ${config.bg} flex items-center gap-6`}>
            <div className={`h-16 w-16 rounded-[1.25rem] bg-white flex items-center justify-center shadow-lg ${config.color}`}>
                <Icon className="h-8 w-8" />
            </div>
            <div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color} mb-1 block`}>
                    Performance Status
                </span>
                <h4 className="text-xl font-bold text-gray-900">{config.label}</h4>
                <p className="text-sm text-gray-600 font-medium mt-1">{config.desc}</p>
            </div>
        </div>
    );
};

export default ReadinessStatus;
