import React from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const ImprovementList = ({ improvements = [] }) => {
    if (!improvements || improvements.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber" />
                Growth Opportunities
            </h3>
            <div className="grid gap-3">
                {improvements.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 group hover:bg-amber-50 transition-colors"
                    >
                        <div className="mt-1 h-5 w-5 rounded-full bg-amber flex items-center justify-center shrink-0 shadow-sm shadow-amber-200">
                            <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-amber-900 leading-relaxed">
                            {item}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ImprovementList;
