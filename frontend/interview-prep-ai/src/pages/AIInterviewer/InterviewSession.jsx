import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    Bot, ArrowLeft, CheckCircle2, Zap, ChevronRight, Send, Mic, MicOff,
    MonitorPlay, Cpu, Sparkles, MessageSquare, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import InterviewTimer from "../../components/InterviewTimer";
import AnswerInput from "../../components/AnswerInput";
import SaaSCard from "../../components/ui/SaaSCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/Skeleton";

const FocusedProgressBar = ({ current, total }) => (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
        <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((current / (total || 5)) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
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

    const handleSubmitAnswer = useCallback(async (answerText) => {
        if (!answerText || !answerText.trim()) {
            toast.error("Input protocol required. Please articulate your response.");
            return;
        }
        if (loading || isComplete) return;

        setLoading(true);
        try {
            const response = await axiosInstance.post(
                API_PATHS.INTERVIEW_SESSION.SUBMIT_ANSWER(sessionId),
                { questionId: activeQuestionId, answer: answerText }
            );
            const { nextQuestion, questionId, isComplete: complete } = response.data;
            if (complete) {
                setIsComplete(true);
                toast.success("Intelligence gathering complete. Analysis ready.");
            } else {
                setCurrentQuestion(nextQuestion);
                setActiveQuestionId(questionId);
                setQuestionCount((prev) => prev + 1);
                toast.success("Signal captured.");
            }
        } catch {
            toast.error("Neural link synchronization error. Retrying...");
        } finally {
            setLoading(false);
        }
    }, [sessionId, activeQuestionId, loading, isComplete]);

    const handleEndInterview = useCallback(() => {
        navigate(`/ai-interview/feedback/${sessionId}`);
    }, [navigate, sessionId]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* ── Initial Loading Flow ── */}
            {loading && !currentQuestion ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32 rounded-2xl" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                    <Skeleton className="h-[400px] w-full rounded-[32px]" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
            ) : (
                <>
                    {/* ── Status Header ── */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Cpu className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="info">{sessionInfo.type} Context</Badge>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">• Simulation {sessionId.slice(-4)}</span>
                                </div>
                                <h1 className="text-2xl font-black tracking-tight">{sessionInfo.company} Simulation</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                            <div className="px-3 border-r border-white/10 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <InterviewTimer />
                            </div>
                            <div className="px-3 flex items-center gap-2">
                                <span className="text-[10px] font-black text-muted-foreground uppercase">Progress</span>
                                <span className="text-sm font-black text-foreground">{questionCount}</span>
                                <span className="text-[10px] text-muted-foreground">/ {totalQuestions}</span>
                            </div>
                        </div>
                    </div>

                    <FocusedProgressBar current={questionCount} total={totalQuestions} />
                </>
            )}


            <div className="relative">
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key={activeQuestionId || "loading"}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="space-y-8"
                        >
                            <SaaSCard className="p-10 md:p-14 min-h-[300px] flex flex-col justify-center border-primary/5">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Intelligence Node</span>
                                    <div className="flex-1 h-px bg-white/5 mx-2" />
                                    <Badge variant="outline" className="opacity-60">Q{questionCount}</Badge>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-foreground/90">
                                    {loading && !currentQuestion ? (
                                        <span className="text-muted-foreground animate-pulse">Synthesizing personalized inquiry...</span>
                                    ) : currentQuestion}
                                </h2>

                                {loading && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-[32px] flex items-center justify-center z-20">
                                        <div className="flex gap-1.5 p-4 bg-black/40 rounded-full border border-white/10">
                                            {[0, 0.2, 0.4].map((d, i) => (
                                                <motion.span 
                                                    key={i} 
                                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                                    transition={{ repeat: Infinity, duration: 1, delay: d }}
                                                    className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </SaaSCard>

                            {/* ── Input Area ── */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 px-1">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Response Input · Voice or Text active
                                    </span>
                                </div>
                                <AnswerInput
                                    onSubmit={handleSubmitAnswer}
                                    loading={loading}
                                    placeholder={`Your response for the ${sessionInfo.company} interview...`}
                                />
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2 opacity-40">
                                        <Zap className="h-3 w-3 text-primary" />
                                        <span className="text-[9px] font-bold uppercase">End-to-End Encryption</span>
                                    </div>
                                    <button 
                                        onClick={handleEndInterview}
                                        className="text-[10px] font-black text-rose-500/60 hover:text-rose-400 transition-colors uppercase tracking-widest"
                                    >
                                        Force Terminate Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <SaaSCard className="max-w-lg mx-auto p-16">
                                <div className="relative mx-auto w-28 h-28 mb-10">
                                    <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 animate-ping opacity-20" />
                                    <div className="relative h-28 w-28 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <CheckCircle2 className="h-12 w-12 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black tracking-tighter mb-4">Mastery Session Decoded</h3>
                                <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-sm mx-auto">
                                    The interview is finalized. Our AI is currently processing your performance metrics and contextual answers.
                                </p>
                                <Button
                                    variant="saas"
                                    size="lg"
                                    onClick={handleEndInterview}
                                    className="w-full py-7 text-lg rounded-2xl shadow-2xl shadow-primary/30"
                                >
                                    Access Performance Intelligence
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </SaaSCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InterviewSession;

