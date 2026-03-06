import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

/**
 * InterviewTimer Component
 * Displays elapsed time in MM:SS format since the interview started.
 */
const InterviewTimer = ({ className = "" }) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 shadow-sm ${className}`}>
            <Clock className="h-3.5 w-3.5 text-amber animate-pulse" />
            <span className="text-xs font-mono font-bold text-gray-700">
                {formatTime(seconds)}
            </span>
        </div>
    );
};

export default InterviewTimer;
