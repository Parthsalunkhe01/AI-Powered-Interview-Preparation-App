import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    Bot,
    ArrowLeft,
    CheckCircle2,
    Building2,
    Zap,
    MessageSquare,
    Info,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/Layouts/DashBoardLayout";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import InterviewTimer from "../../components/InterviewTimer";
import AnswerInput from "../../components/AnswerInput";

const InterviewSession = () => {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // State from setup page
    const { firstQuestion, firstQuestionId, company, type } = location.state || {};

    const [currentQuestion, setCurrentQuestion] = useState(firstQuestion || "");
    const [activeQuestionId, setActiveQuestionId] = useState(firstQuestionId || null);
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        company: company || "Target",
        type: type || "technical"
    });
    const [questionCount, setQuestionCount] = useState(1);
    const [history, setHistory] = useState([]);

    const [isComplete, setIsComplete] = useState(false);

    // Initialize/Fetch session if needed
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

                        // Check if session is already complete (has feedback)
                        if (session.feedback) {
                            setIsComplete(true);
                        }
                    }
                } catch (err) {
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
                {
                    questionId: activeQuestionId,
                    answer: answerText,
                }
            );

            const { nextQuestion, questionId, isComplete: complete } = response.data;

            if (complete) {
                setIsComplete(true);
                toast.success("Interview complete! Analysis ready.");
            } else {
                // Transition to next question
                setCurrentQuestion(nextQuestion);
                setActiveQuestionId(questionId);
                setQuestionCount((prev) => prev + 1);
                setHistory((prev) => [...prev, { _id: activeQuestionId, question: currentQuestion, answer: answerText }]);
                toast.success("Answer submitted!");
            }

        } catch (error) {
            console.error(error);
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
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] bg-[#FAFAFA]">
                {/* Header */}
                <header className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-xl hover:bg-gray-50 border border-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Button>
                        <div className="h-10 w-[1px] bg-gray-100" />
                        <div>
                            <h1 className="text-lg font-bold text-black flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-amber" />
                                {sessionInfo.company}
                            </h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {sessionInfo.type} Interview • Part {questionCount}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <InterviewTimer />
                        <Button
                            variant="default"
                            onClick={handleEndInterview}
                            className="rounded-2xl bg-black hover:bg-black/90 text-white text-xs font-bold px-5 h-11 shadow-lg hover:shadow-black/10 transition-all active:scale-95"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-amber" />
                            Finish Session
                        </Button>
                    </div>
                </header>

                {/* Question Display Area */}
                <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                    <div className="w-full max-w-4xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeQuestionId || "loading"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
                            >
                                {/* AI Icon/Tag */}
                                <div className="absolute -top-6 left-12 flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-amber flex items-center justify-center shadow-lg shadow-amber/20">
                                        <Bot className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-[10px] font-bold text-amber uppercase tracking-widest">
                                        Interviewer
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="mt-4">
                                    <div className="flex items-start gap-4 mb-6 opacity-40">
                                        <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Question</span>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-bold text-black leading-snug tracking-tight">
                                        {loading && !currentQuestion ? "Analysing flow..." : currentQuestion}
                                    </h2>

                                    <div className="mt-10 flex items-center gap-6 pt-8 border-t border-gray-50">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className={`h-2 w-2 rounded-full border-2 border-white ${i <= (questionCount % 4) ? 'bg-amber' : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                            Round {Math.ceil(questionCount / 3)} • Question {questionCount}
                                        </span>
                                    </div>
                                </div>

                                {/* Loading Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[2.5rem] flex flex-col items-center justify-center z-10">
                                        <div className="flex gap-2 mb-4">
                                            <span className="h-2 w-2 bg-amber rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="h-2 w-2 bg-amber rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="h-2 w-2 bg-amber rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-xs font-bold text-black uppercase tracking-widest">Evaluating Answer...</span>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Info Bar */}
                <div className="bg-white border-y border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber/5 border border-amber/10">
                            <Zap className="h-3 w-3 text-amber fill-amber" />
                            <span className="text-[10px] font-bold text-amber uppercase tracking-widest">Gemini 2.5 Logic</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Info className="h-3 w-3" />
                            Use voice or text to respond
                        </div>
                    </div>
                </div>

                {/* Footer / Input Area */}
                <footer className="p-10 bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        {!isComplete ? (
                            <>
                                <AnswerInput
                                    onSubmit={handleSubmitAnswer}
                                    loading={loading}
                                    placeholder={`Describe your experience with ${sessionInfo.type} topics...`}
                                />
                                <p className="text-center text-[10px] text-gray-400 mt-5 font-bold uppercase tracking-widest opacity-60">
                                    Professional Simulation • Quality Responses Favored
                                </p>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 rounded-[2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Session Completed</h3>
                                    <p className="text-sm text-gray-500 font-medium max-w-sm">
                                        You've answered all 3 questions. Your deep-dive AI analysis is now ready for review.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleEndInterview}
                                    className="rounded-[1.5rem] bg-black hover:bg-black/90 text-white px-10 h-14 text-sm font-bold shadow-xl shadow-black/10 transition-all active:scale-95 flex items-center gap-3"
                                >
                                    Finish & View Feedback
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </footer>
            </div>
        </DashboardLayout>
    );
};

export default InterviewSession;
