import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    Bot, ArrowLeft, CheckCircle2, Zap, ChevronRight, Send, Mic, MicOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import InterviewTimer from "../../components/InterviewTimer";
import AnswerInput from "../../components/AnswerInput";

/* ── thin progress bar at top ────── */
const ProgressBar = ({ current, total }) => (
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1d2535]">
        <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#4A7CF7,#818CF8)" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((current / (total || 5)) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        />
    </div>
);

const InterviewSession = () => {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { firstQuestion, firstQuestionId, company, type } = location.state || {};

    const [currentQuestion, setCurrentQuestion] = useState(firstQuestion || "");
    const [activeQuestionId, setActiveQuestionId] = useState(firstQuestionId || null);
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({ company: company || "Target", type: type || "technical" });
    const [questionCount, setQuestionCount] = useState(1);
    const [totalQuestions] = useState(5);
    const [history, setHistory] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!firstQuestion) {
            const fetchSession = async () => {
                setLoading(true);
                try {
                    const res = await axiosInstance.get(API_PATHS.INTERVIEW_SESSION.GET_ONE(sessionId));
                    const session = res.data.session;
                    setSessionInfo({ company: session.company, type: session.type });
                    if (session.question?.length > 0) {
                        const lastQ = session.question[session.question.length - 1];
                        setCurrentQuestion(lastQ.question);
                        setActiveQuestionId(lastQ._id);
                        setQuestionCount(session.question.length);
                        setHistory(session.question.slice(0, -1));
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

    const handleSubmitAnswer = async (answerText) => {
        if (!answerText.trim() || loading || isComplete) return;
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                API_PATHS.INTERVIEW_SESSION.SUBMIT_ANSWER(sessionId),
                { questionId: activeQuestionId, answer: answerText }
            );
            const { nextQuestion, questionId, isComplete: complete } = response.data;
            if (complete) {
                setIsComplete(true);
                toast.success("Interview complete! Analysis ready.");
            } else {
                setCurrentQuestion(nextQuestion);
                setActiveQuestionId(questionId);
                setQuestionCount((prev) => prev + 1);
                setHistory((prev) => [...prev, { _id: activeQuestionId, question: currentQuestion, answer: answerText }]);
                toast.success("Answer submitted!");
            }
        } catch {
            toast.error("Failed to fetch next question. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEndInterview = () => {
        toast.success("Navigating to feedback analysis...");
        navigate(`/ai-interview/feedback/${sessionId}`);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0f1623] relative overflow-hidden">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(74,124,247,0.06) 0%, transparent 70%)" }} />
            </div>

            {/* Progress bar */}
            <ProgressBar current={questionCount} total={totalQuestions} />

            {/* ── Header ── */}
            <header className="relative px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#1d2535]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)}
                        className="h-9 w-9 rounded-xl flex items-center justify-center border border-[#252f42] hover:bg-[#1d2535] transition-colors">
                        <ArrowLeft className="h-4 w-4 text-[#7a8faa]" />
                    </button>
                    <div className="h-8 w-px bg-[#1d2535]" />
                    <div>
                        <p className="text-[10px] font-bold text-[#4A7CF7] uppercase tracking-[0.18em]">
                            {sessionInfo.type} Interview
                        </p>
                        <h1 className="text-sm font-bold text-[#e6eaf2] leading-tight">
                            {sessionInfo.company}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Q counter pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d2535] border border-[#252f42]">
                        <span className="text-[10px] font-bold text-[#7a8faa] uppercase tracking-widest">Q</span>
                        <span className="text-sm font-black text-[#e6eaf2]">{questionCount}</span>
                        <span className="text-[10px] text-[#7a8faa]">/ {totalQuestions}</span>
                    </div>
                    {/* Timer */}
                    <InterviewTimer />
                    {/* Finish button */}
                    <button
                        onClick={handleEndInterview}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg,#4A7CF7,#818CF8)", boxShadow: "0 4px 16px rgba(74,124,247,0.3)" }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Finish
                    </button>
                </div>
            </header>

            {/* ── Main question area ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
                <div className="w-full max-w-3xl">
                    <AnimatePresence mode="wait">
                        {!isComplete ? (
                            <motion.div
                                key={activeQuestionId || "loading"}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -24 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                {/* AI badge */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg,#4A7CF7,#818CF8)" }}>
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-[#4A7CF7] uppercase tracking-[0.18em]">
                                        Interviewer · Question {questionCount}
                                    </span>
                                    <div className="flex-1 h-px bg-[#1d2535]" />
                                </div>

                                {/* Question card */}
                                <div className="relative p-8 rounded-2xl border border-[#252f42] bg-[#141c2e]"
                                    style={{ boxShadow: "0 0 0 1px rgba(74,124,247,0.05), 0 20px 60px rgba(0,0,0,0.3)" }}>
                                    {/* Left accent strip */}
                                    <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
                                        style={{ background: "linear-gradient(180deg,#4A7CF7,#818CF8)" }} />

                                    <h2 className="text-xl sm:text-2xl font-bold text-[#e6eaf2] leading-snug pl-5">
                                        {loading && !currentQuestion ? (
                                            <span className="text-[#7a8faa] animate-pulse">Generating next question...</span>
                                        ) : currentQuestion}
                                    </h2>

                                    {/* Loading dots overlay */}
                                    {loading && (
                                        <div className="absolute inset-0 bg-[#141c2e]/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <div className="flex gap-2">
                                                {[0, 0.15, 0.3].map((d, i) => (
                                                    <span key={i} className="h-2 w-2 rounded-full bg-[#4A7CF7] animate-bounce"
                                                        style={{ animationDelay: `-${d}s` }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Gemini tag */}
                                <div className="flex items-center gap-2 mt-4">
                                    <Zap className="h-3 w-3 text-[#4A7CF7]" />
                                    <span className="text-[10px] font-bold text-[#7a8faa] uppercase tracking-widest">
                                        Powered by Gemini 2.5 · Use voice or text
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            /* ── Complete state ── */
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8 py-12"
                            >
                                <div className="relative mx-auto w-24 h-24">
                                    <div className="absolute inset-0 rounded-[2rem] animate-ping opacity-20"
                                        style={{ background: "linear-gradient(135deg,#4A7CF7,#818CF8)" }} />
                                    <div className="relative h-24 w-24 rounded-[2rem] flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg,rgba(74,124,247,0.2),rgba(129,140,248,0.2))", border: "1px solid rgba(74,124,247,0.3)" }}>
                                        <CheckCircle2 className="h-10 w-10 text-[#818CF8]" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#e6eaf2]">Session Complete!</h3>
                                    <p className="text-[#7a8faa] mt-2 max-w-sm mx-auto">
                                        Your answers have been recorded. Your AI analysis report is ready.
                                    </p>
                                </div>
                                <button
                                    onClick={handleEndInterview}
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold transition-all active:scale-95"
                                    style={{ background: "linear-gradient(135deg,#4A7CF7,#818CF8)", boxShadow: "0 8px 32px rgba(74,124,247,0.35)" }}
                                >
                                    View Full Feedback
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ── Answer footer ── */}
            {!isComplete && (
                <footer className="shrink-0 px-6 pb-6 pt-4 border-t border-[#1d2535] bg-[#0f1623]">
                    <div className="max-w-3xl mx-auto">
                        <AnswerInput
                            onSubmit={handleSubmitAnswer}
                            loading={loading}
                            placeholder={`Your answer to this ${sessionInfo.type} question...`}
                        />
                        <p className="text-center text-[10px] text-[#3a4a60] mt-3 font-semibold uppercase tracking-widest">
                            Professional Simulation · Quality responses favored
                        </p>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default InterviewSession;
