import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, Target, BatteryLow, Zap, Shuffle } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle2,
  "target": Target,
  "battery-low": BatteryLow,
  "zap": Zap,
  "shuffle": Shuffle,
};

const severityStyles = {
  positive: { border: "border-emerald-100", bg: "bg-emerald-50", icon: "text-emerald-600", iconBg: "bg-emerald-100", text: "text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
  warning:  { border: "border-amber-100",   bg: "bg-amber-50",   icon: "text-amber-600",   iconBg: "bg-amber-100",   text: "text-amber-800",   badge: "bg-amber-100 text-amber-700"   },
  critical: { border: "border-rose-100",    bg: "bg-rose-50",    icon: "text-rose-600",    iconBg: "bg-rose-100",    text: "text-rose-800",    badge: "bg-rose-100 text-rose-700"     },
  info:     { border: "border-indigo-100",  bg: "bg-indigo-50",  icon: "text-indigo-600",  iconBg: "bg-indigo-100",  text: "text-indigo-800",  badge: "bg-indigo-100 text-indigo-700" },
};

const AIInsightCard = ({ icon, title, description, severity = "info", index = 0 }) => {
  const styles = severityStyles[severity] || severityStyles.info;
  const Icon = iconMap[icon] || Target;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`flex gap-4 p-4 rounded-2xl border ${styles.border} ${styles.bg}`}
    >
      <div className={`h-9 w-9 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${styles.icon}`} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}>{severity}</span>
        </div>
        <p className={`text-xs font-medium leading-relaxed ${styles.text}`}>{description}</p>
      </div>
    </motion.div>
  );
};

export default AIInsightCard;
