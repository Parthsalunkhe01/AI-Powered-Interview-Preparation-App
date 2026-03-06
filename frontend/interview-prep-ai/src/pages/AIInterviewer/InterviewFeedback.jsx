import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Bot,
    Sparkles,
    MessageSquare,
    Info,
    ChevronRight,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/Layouts/DashBoardLayout";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import StrengthList from "../../components/StrengthList";
import ImprovementList from "../../components/ImprovementList";
import ReadinessStatus from "../../components/ReadinessStatus";

const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [status, setStatus] = useState("Improving");

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await axiosInstance.post(API_PATHS.INTERVIEW_SESSION.GENERATE_FEEDBACK(sessionId));
                setFeedback(res.data.feedback);

                // Simple logic to determine readiness based on lengths for demo
                const strengths = res.data.feedback.strengths?.length || 0;
                const improvements = res.data.feedback.improvementAreas?.length || 0;

                if (strengths > improvements + 2) setStatus("Ready");
                else if (improvements > strengths) setStatus("Needs Practice");
                else setStatus("Improving");

            } catch (err) {
                console.error(err);
                toast.error("Could not generate feedback. Please try again.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [sessionId, navigate]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] space-y-6">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-3xl bg-amber/5 border-2 border-amber/10 flex items-center justify-center animate-pulse">
                            <Bot className="h-10 w-10 text-amber" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                            <Loader2 className="h-4 w-4 text-amber animate-spin" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">
                            Generating your AI Feedback
                        </h2>
                        <p className="text-sm text-gray-500 font-medium mt-2">
                            Our AI is analyzing your technical reasoning and communication style...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#FAFAFA] pb-20">
                {/* Header */}
                <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/interview-prep/${sessionId}`)}
                            className="rounded-xl hover:bg-gray-50 border border-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Button>
                        <div className="h-10 w-[1px] bg-gray-100" />
                        <div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber fill-amber" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber">
                                    AI Performance Review
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mt-0.5">Interview Feedback</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="rounded-[1.25rem] bg-gray-900 hover:bg-black text-white px-6 h-12 shadow-lg shadow-black/10 transition-all active:scale-95"
                        >
                            Return to Dashboard
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-8 mt-12 space-y-12">
                    {/* Hero Section: Readiness Indicator */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ReadinessStatus status={status} />
                    </motion.section>

                    {/* Qualitative Analysis Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Communication Analysis */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
                        >
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                                <MessageSquare className="h-5 w-5 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Communication Analysis</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mt-4 font-medium opacity-80">
                                {feedback?.qualitativeAnalysis?.communication}
                            </p>
                        </motion.div>

                        {/* Technical Reasoning */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
                        >
                            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mb-6">
                                <Sparkles className="h-5 w-5 text-amber" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Technical Reasoning</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mt-4 font-medium opacity-80">
                                {feedback?.qualitativeAnalysis?.technicalReasoning}
                            </p>
                        </motion.div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                        <StrengthList strengths={feedback?.strengths} />
                        <ImprovementList improvements={feedback?.improvementAreas} />
                    </div>

                    {/* Company Expectations */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900 p-10 rounded-[3rem] text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-10">
                            <div className="md:w-1/3">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 ring-1 ring-white/20">
                                    <Info className="h-6 w-6 text-amber" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Company Expectations</h3>
                                <p className="text-sm text-gray-400 mt-4 leading-relaxed font-medium">
                                    Based on your target role, our AI identified typical standards at these organizations.
                                </p>
                            </div>

                            <div className="md:w-2/3 flex flex-wrap gap-3">
                                {feedback?.companyExpectations?.map((exp, idx) => (
                                    <div
                                        key={idx}
                                        className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-semibold hover:bg-white/10 transition-colors"
                                    >
                                        {exp}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default InterviewFeedback;
