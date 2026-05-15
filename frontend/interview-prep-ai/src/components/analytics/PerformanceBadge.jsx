import React from "react";
import { Trophy, Shield, TrendingUp, Award, Target, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const badgeConfig = {
  trophy:       { Icon: Trophy,      colors: "bg-amber-50  border-amber-200  text-amber-700"  },
  shield:       { Icon: Shield,      colors: "bg-blue-50   border-blue-200   text-blue-700"   },
  "trending-up":{ Icon: TrendingUp,  colors: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  award:        { Icon: Award,       colors: "bg-violet-50 border-violet-200 text-violet-700" },
  target:       { Icon: Target,      colors: "bg-orange-50 border-orange-200 text-orange-700" },
  "alert-circle":{ Icon: AlertCircle, colors: "bg-rose-50   border-rose-200   text-rose-700"  },
};

const PerformanceBadge = ({ label, icon, index = 0 }) => {
  const cfg = badgeConfig[icon] || badgeConfig.award;
  const { Icon, colors } = cfg;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black ${colors}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.div>
  );
};

export default PerformanceBadge;
