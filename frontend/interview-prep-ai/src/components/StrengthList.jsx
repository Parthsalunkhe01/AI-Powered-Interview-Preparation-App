import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const StrengthList = ({ strengths = [] }) => {
    if (!strengths || strengths.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Key Strengths
            </h3>
            <div className="grid gap-3">
                {strengths.map((strength, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 group hover:bg-emerald-50 transition-colors"
                    >
                        <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-900 leading-relaxed">
                            {strength}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StrengthList;
