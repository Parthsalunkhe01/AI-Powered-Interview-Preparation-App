import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    Bot, CheckCircle2, ChevronRight, Send, Activity,
    MessageSquare, Tag, Layers, AlertTriangle, Clock,
    GraduationCap, Briefcase, Target as TargetIcon, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import InterviewTimer from "../../components/InterviewTimer";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";

// ── Mode config ─────────────────────────────────────────────────────────────
const MODE_CFG = {
    beginner: { label: "Beginner", icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    standard: { label: "Standard", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
    real: { label: "Real Interview", icon: TargetIcon, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

// ── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressStrip = ({ current, total }) => (
    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((current / (total || 5)) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        />
    </div>
);

// ── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Bot className="h-3 w-3 text-indigo-600" />
        </div>
        <div className="flex gap-1">
            {[0, 0.18, 0.36].map((d, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                    className="h-1.5 w-1.5 rounded-full bg-indigo-400 block"
                />
            ))}
        </div>
        <span className="text-[11px] font-semibold text-slate-400">AI is thinking...</span>
    </div>
);

// ── Category Tag ────────────────────────────────────────────────────────────
const CategoryTag = ({ category, isFollowUp }) => (
    <div className="flex items-center gap-1.5">
        {isFollowUp && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                Follow-up
            </span>
        )}
        {category && !isFollowUp && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" />
                {category}
            </span>
        )}
    </div>
);

// ── Conversation Bubble (history) ────────────────────────────────────────────
const ConversationBubble = ({ item, index }) => (
    <div className="space-y-1.5">
        {/* Question */}
        <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-2.5 w-2.5 text-indigo-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                <p className="text-xs font-medium text-slate-700 leading-relaxed">{item.question}</p>
            </div>
        </div>
        {/* Answer */}
        {item.answer && (
            <div className="flex items-start gap-2 justify-end">
                <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                    <p className="text-xs text-white/90 leading-relaxed">{item.answer}</p>
                </div>
                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-2.5 w-2.5 text-indigo-600" />
                </div>
            </div>
        )}
    </div>
);

// ── Answer Input ─────────────────────────────────────────────────────────────
const AnswerBox = ({ onSubmit, loading, placeholder, mode }) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!loading && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [loading]);

    const handleSubmit = () => {
        if (!value.trim()) {
            toast.error("Please type an answer before submitting.");
            return;
        }
        onSubmit(value.trim());
        setValue("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    const charCount = value.length;
    const charColor = charCount < 40 ? "text-amber-500" : charCount > 200 ? "text-emerald-600" : "text-slate-400";

    return (
        <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-indigo-400 transition-colors duration-200">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={4}
                placeholder={placeholder}
                className="w-full px-4 pt-3 pb-2 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent resize-none outline-none font-medium leading-relaxed"
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold ${charColor}`}>{charCount} chars</span>
                    {charCount < 40 && charCount > 0 && (
                        <span className="text-[10px] text-amber-500 font-medium">Add more detail for a better score</span>
                    )}
                    {charCount > 200 && (
                        <span className="text-[10px] text-emerald-600 font-medium">Detailed answer ✓</span>
                    )}
                    <span className="text-[10px] text-slate-400 hidden sm:block">Ctrl+Enter to submit</span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !value.trim()}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors"
                >
                    <Send className="h-3 w-3" />
                    Submit
                </button>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const InterviewSession = () => {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const {
        firstQuestion, firstQuestionId, company, type, mode: initialMode,
        firstCategory, firstTags, totalQuestions: initTotal
    } = location.state || {};

    const [currentQuestion, setCurrentQuestion] = useState(firstQuestion || "");
    const [currentCategory, setCurrentCategory] = useState(firstCategory || "General");
    const [currentTags, setCurrentTags] = useState(firstTags || []);
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [activeQuestionId, setActiveQuestionId] = useState(firstQuestionId || null);
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        company: company || "Target",
        type: type || "technical",
        mode: initialMode || "standard",
    });
    const [questionCount, setQuestionCount] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(initTotal || 5);
    const [isComplete, setIsComplete] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const historyEndRef = useRef(null);

    const modeCfg = MODE_CFG[sessionInfo.mode] || MODE_CFG.standard;
    const ModeIcon = modeCfg.icon;

    useEffect(() => {
        if (!firstQuestion) {
            const fetchSession = async () => {
                setLoading(true);
                try {
                    const res = await axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_ONE(sessionId));
                    const session = res.data.session;
                    setSessionInfo({
                        company: session.company,
                        type: session.type,
                        mode: session.mode || "standard",
                    });
                    setTotalQuestions(session.questionLimit || 5);
                    if (session.question?.length > 0) {
                        const lastQ = session.question[session.question.length - 1];
                        setCurrentQuestion(lastQ.question);
                        setActiveQuestionId(lastQ._id);
                        setQuestionCount(session.question.length);
                        if (session.feedback) setIsComplete(true);
                    }
                } catch {
                    toast.error("Could not load session");
                    navigate("/dashboard");
                } finally {
                    setLoading(false);
                }
            };
            fetchSession();
        }
    }, [sessionId, firstQuestion, navigate]);

    // Scroll conversation to bottom
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationHistory]);

    const handleSubmitAnswer = useCallback(async (answerText) => {
        if (loading || isComplete) return;

        // Add current Q+A to history
        const currentEntry = {
            question: currentQuestion,
            answer: answerText,
            category: currentCategory,
        };
        setConversationHistory(prev => [...prev, currentEntry]);

        setLoading(true);
        try {
            const response = await axiosInstance.post(
                API_PATHS.INTERVIEW_SESSION.SUBMIT_ANSWER(sessionId),
                { questionId: activeQuestionId, answer: answerText }
            );

            const { nextQuestion, questionId, isComplete: complete, category, tags, isFollowUp: followUp } = response.data;

            if (complete) {
                setIsComplete(true);
                toast.success("Interview complete! Preparing your feedback.");
            } else {
                setCurrentQuestion(nextQuestion);
                setActiveQuestionId(questionId);
                setCurrentCategory(category || "General");
                setCurrentTags(tags || []);
                setIsFollowUp(followUp || false);
                setQuestionCount(prev => prev + 1);
            }
        } catch (err) {
            toast.error("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [sessionId, activeQuestionId, loading, isComplete, currentQuestion, currentCategory]);

    const handleEndInterview = useCallback(() => {
        navigate(`/ai-interview/feedback/${sessionId}`);
    }, [navigate, sessionId]);

    const modeLabel = modeCfg.label;

    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">

            {/* ── Loading State ── */}
            {loading && !currentQuestion ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-1 w-full rounded-full" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            ) : (
                <>
                    {/* ── Compact Header ── */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-8 w-8 rounded-xl ${modeCfg.bg} ${modeCfg.border} border flex items-center justify-center shrink-0`}>
                                <ModeIcon className={`h-4 w-4 ${modeCfg.color}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-800 truncate">{sessionInfo.company}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide hidden sm:block">{sessionInfo.type}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${modeCfg.color}`}>{modeLabel} Mode</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* History toggle */}
                            <button
                                onClick={() => setShowHistory(s => !s)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors"
                            >
                                <MessageSquare className="h-3 w-3" />
                                History ({conversationHistory.length})
                            </button>
                            {/* Timer + progress */}
                            <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-xl">
                                <Activity className="h-3 w-3 text-indigo-500" />
                                <InterviewTimer />
                                <div className="w-px h-4 bg-slate-200" />
                                <span className="text-[11px] font-black text-slate-700">{questionCount}<span className="text-slate-400 font-normal">/{totalQuestions}</span></span>
                            </div>
                        </div>
                    </div>

                    <ProgressStrip current={questionCount} total={totalQuestions} />

                    {/* ── Conversation History Panel ── */}
                    <AnimatePresence>
                        {showHistory && conversationHistory.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 max-h-60 overflow-y-auto">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversation History</p>
                                    {conversationHistory.map((item, i) => (
                                        <ConversationBubble key={i} item={item} index={i} />
                                    ))}
                                    <div ref={historyEndRef} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Main Area ── */}
                    <AnimatePresence mode="wait">
                        {!isComplete ? (
                            <motion.div
                                key={activeQuestionId || "q"}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="space-y-3"
                            >
                                {/* ── Question Card ── */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                                    {/* AI Label Row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                                <Bot className="h-3.5 w-3.5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">AI Interviewer</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CategoryTag category={currentCategory} isFollowUp={isFollowUp} />
                                            <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 py-0">
                                                Q{questionCount}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                key="typing"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <TypingIndicator />
                                            </motion.div>
                                        ) : (
                                            <motion.p
                                                key={currentQuestion}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-base font-semibold text-slate-800 leading-relaxed"
                                            >
                                                {currentQuestion}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    {/* Tags */}
                                    {currentTags.length > 0 && !loading && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {currentTags.map((tag, i) => (
                                                <span key={i} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ── Answer Input ── */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 px-1">
                                        <MessageSquare className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Answer</span>
                                    </div>
                                    <AnswerBox
                                        onSubmit={handleSubmitAnswer}
                                        loading={loading}
                                        placeholder={`Answer here — be specific and explain your reasoning...`}
                                        mode={sessionInfo.mode}
                                    />
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="h-3 w-3 text-slate-400" />
                                            <span className="text-[10px] font-semibold text-slate-400">Answers are auto-saved and analyzed</span>
                                        </div>
                                        <button
                                            onClick={handleEndInterview}
                                            className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                                        >
                                            <AlertTriangle className="h-2.5 w-2.5" />
                                            End Early
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            /* ── Completion State ── */
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm"
                            >
                                <div className="relative mx-auto w-16 h-16 mb-5">
                                    <div className="absolute inset-0 rounded-2xl bg-indigo-100 animate-ping opacity-40" />
                                    <div className="relative h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center z-10">
                                        <CheckCircle2 className="h-8 w-8 text-indigo-500" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-2">Interview Complete!</h3>
                                <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                                    {conversationHistory.length + 1} questions answered. Your AI feedback is being prepared.
                                </p>
                                <button
                                    onClick={handleEndInterview}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md shadow-indigo-200 transition-colors"
                                >
                                    View My Feedback
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default InterviewSession;
