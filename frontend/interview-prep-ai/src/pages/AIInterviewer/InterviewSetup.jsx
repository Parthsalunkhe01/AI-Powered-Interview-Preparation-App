import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Zap, AlertCircle, ChevronRight, ArrowRight, 
    GraduationCap, Briefcase, Target, Clock, Shield,
    BookOpen, MessageSquare, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import { Button } from "../../components/ui/Button";
import { BlueprintSummary } from "../../components/ui/BlueprintSummary";
import { SessionSettings } from "../../components/ui/SessionSettings";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

// ── Interview Modes Config ─────────────────────────────────────────────────
const INTERVIEW_MODES = [
    {
        id: "beginner",
        label: "Beginner",
        icon: GraduationCap,
        color: "emerald",
        borderColor: "border-emerald-200",
        activeBg: "bg-emerald-50",
        activeText: "text-emerald-700",
        activeBorder: "border-emerald-400",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        tagBg: "bg-emerald-100",
        tagColor: "text-emerald-700",
        description: "Supportive & guided",
        details: "Starts with easy warmup questions, builds confidence gradually.",
        perks: ["Easy questions first", "Guided follow-ups", "No pressure"],
    },
    {
        id: "standard",
        label: "Standard",
        icon: Briefcase,
        color: "indigo",
        borderColor: "border-indigo-200",
        activeBg: "bg-indigo-50",
        activeText: "text-indigo-700",
        activeBorder: "border-indigo-400",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        tagBg: "bg-indigo-100",
        tagColor: "text-indigo-700",
        description: "Adaptive & realistic",
        details: "Difficulty adapts to your performance. Feels like a real campus interview.",
        perks: ["Adaptive difficulty", "Contextual follow-ups", "Balanced challenge"],
    },
    {
        id: "real",
        label: "Real Interview",
        icon: Target,
        color: "rose",
        borderColor: "border-rose-200",
        activeBg: "bg-rose-50",
        activeText: "text-rose-700",
        activeBorder: "border-rose-400",
        iconBg: "bg-rose-100",
        iconColor: "text-rose-600",
        tagBg: "bg-rose-100",
        tagColor: "text-rose-700",
        description: "Strict & challenging",
        details: "Industry-level difficulty, strict questioning. For confident candidates.",
        perks: ["Higher difficulty", "Strict questioning", "Top-level preparation"],
    },
];

const ModeCard = ({ mode, selected, onSelect }) => {
    const Icon = mode.icon;
    const isActive = selected === mode.id;

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(mode.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                isActive
                    ? `${mode.activeBorder} ${mode.activeBg}`
                    : `border-slate-200 bg-white hover:border-slate-300`
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl ${mode.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`h-4.5 w-4.5 ${mode.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-bold ${isActive ? mode.activeText : "text-slate-800"}`}>
                            {mode.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${mode.tagBg} ${mode.tagColor}`}>
                            {mode.description}
                        </span>
                        {isActive && (
                            <CheckCircle2 className={`h-3.5 w-3.5 ml-auto ${mode.activeText}`} />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{mode.details}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {mode.perks.map((perk, i) => (
                            <span
                                key={i}
                                className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
                            >
                                {perk}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

const InterviewSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [blueprint, setBlueprint] = useState(null);
    const [selectedMode, setSelectedMode] = useState("standard");
    const [settings, setSettings] = useState({
        focus: "mixed",
        questionLimit: 5,
    });

    useEffect(() => {
        const fetchBlueprint = async () => {
            try {
                const response = await axiosInstance.get("/api/blueprint");
                if (response.data && response.data.targetRole) {
                    setBlueprint(response.data);
                }
            } catch (error) {
                console.error("No blueprint found", error);
            } finally {
                setFetching(false);
            }
        };
        fetchBlueprint();
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleStartInterview = async () => {
        if (!blueprint) {
            toast.error("Please create an Interview Blueprint first.");
            navigate("/blueprint");
            return;
        }

        setLoading(true);
        try {
            // 1. Create session with mode and focus
            const sessionRes = await axiosInstance.post(API_PATHS.INTERVIEW_SESSION.CREATE, {
                focus: settings.focus,
                mode: selectedMode,
                questionLimit: settings.questionLimit,
            });

            const session = sessionRes.data.session;

            // 2. Get first question
            const questionRes = await axiosInstance.post(
                API_PATHS.INTERVIEW_SESSION.SUBMIT_ANSWER(session._id),
                { answer: "" }
            );

            toast.success("Interview started! Good luck.");

            navigate(`/ai-interview/session/${session._id}`, {
                state: {
                    firstQuestion: questionRes.data.nextQuestion,
                    firstQuestionId: questionRes.data.questionId,
                    firstCategory: questionRes.data.category,
                    firstTags: questionRes.data.tags,
                    firstType: questionRes.data.type,
                    company: session.company,
                    focus: settings.focus,
                    mode: selectedMode,
                    totalQuestions: settings.questionLimit,
                },
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to start interview. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pt-2 pb-12 px-2">
            {/* ── Header ── */}
            <div className="mb-7">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600 mb-3">
                    <Zap className="h-3 w-3 fill-indigo-500" />
                    Interview Simulator
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    Configure Your Interview Session
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    Choose a mode and settings, then begin your AI-powered mock interview.
                </p>
            </div>

            {!blueprint ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center space-y-4"
                >
                    <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-amber-200">
                        <AlertCircle className="h-7 w-7 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Profile Required</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                            Set up your interview profile first so the AI knows your role, skills, and target companies.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/blueprint")} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 px-6 font-bold text-sm">
                        Create Profile <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </motion.div>
            ) : (
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* ── Left: Profile + Mode ── */}
                    <div className="lg:col-span-3 space-y-5">
                        {/* Blueprint summary */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Your Profile</p>
                            <BlueprintSummary blueprint={blueprint} />
                        </div>

                        {/* Mode selection */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Interview Mode</p>
                            <div className="space-y-2">
                                {INTERVIEW_MODES.map(mode => (
                                    <ModeCard
                                        key={mode.id}
                                        mode={mode}
                                        selected={selectedMode}
                                        onSelect={setSelectedMode}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Settings + Launch ── */}
                    <div className="lg:col-span-2 space-y-5">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Session Settings</p>
                            <SessionSettings settings={settings} onChange={handleSettingChange} blueprint={blueprint} />
                        </div>

                        {/* Mode summary chip */}
                        <AnimatePresence mode="wait">
                            {(() => {
                                const mCfg = INTERVIEW_MODES.find(m => m.id === selectedMode);
                                const ModeIcon = mCfg.icon;
                                return (
                                    <motion.div
                                        key={selectedMode}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 ${mCfg.activeBorder} ${mCfg.activeBg}`}
                                    >
                                        <div className={`h-8 w-8 rounded-xl ${mCfg.iconBg} flex items-center justify-center shrink-0`}>
                                            <ModeIcon className={`h-4 w-4 ${mCfg.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold ${mCfg.activeText}`}>{mCfg.label} Mode Active</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{mCfg.details}</p>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>

                        {/* Start button */}
                        <div>
                            <Button
                                onClick={handleStartInterview}
                                disabled={loading}
                                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        Start Mock Interview
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-[10px] text-muted-foreground mt-2">
                                {settings.questionLimit} adaptive questions · difficulty adjusts automatically
                            </p>
                        </div>

                        {/* Info tags */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { icon: Shield, label: "Secure Session" },
                                { icon: BookOpen, label: "AI Powered" },
                                { icon: MessageSquare, label: "Smart Follow-ups" },
                            ].map(({ icon: Icon, label }, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <Icon className="h-3.5 w-3.5 text-indigo-500" />
                                    <span className="text-[9px] font-bold text-slate-500 text-center">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewSetup;
