import React from "react";
import { BookOpen, Code2, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

const typeConfig = {
  practice: { Icon: Code2,        bg: "bg-indigo-50", text: "text-indigo-700", label: "Practice" },
  study:    { Icon: BookOpen,     bg: "bg-amber-50",  text: "text-amber-700",  label: "Study"    },
  review:   { Icon: ClipboardList,bg: "bg-emerald-50",text: "text-emerald-700",label: "Review"   },
};

const priorityStyle = {
  high:   "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-slate-100 text-slate-500",
};

const RecommendationStep = ({ step, index }) => {
  const cfg = typeConfig[step.type] || typeConfig.study;
  const { Icon, bg, text } = cfg;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all"
    >
      <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.domain}</span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${priorityStyle[step.priority] || priorityStyle.low}`}>
            {step.priority} priority
          </span>
        </div>
        <p className="text-sm font-bold text-slate-800">{step.action}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">⏱ {step.estimatedTime}</p>
      </div>
    </motion.div>
  );
};

export default RecommendationStep;
