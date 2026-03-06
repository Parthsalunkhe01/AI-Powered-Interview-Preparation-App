import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Building2, MessageSquare, Layout } from "lucide-react";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/Layouts/DashBoardLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

const InterviewSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [blueprint, setBlueprint] = useState(null);
    const [formData, setFormData] = useState({
        company: "",
        type: "technical",
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
            }
        };
        fetchBlueprint();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (value) => {
        setFormData({ ...formData, type: value });
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();
        if (!formData.company) {
            toast.error("Please enter a company name");
            return;
        }

        setLoading(true);
        try {
            // 1. Create the session
            const sessionRes = await axiosInstance.post(API_PATHS.INTERVIEW_SESSION.CREATE, {
                company: formData.company,
                type: formData.type,
            });

            const session = sessionRes.data.session;

            // 2. Trigger the first question (empty answer to start)
            const questionRes = await axiosInstance.post(
                API_PATHS.INTERVIEW_SESSION.SUBMIT_ANSWER(session._id),
                {
                    answer: "", // Initial trigger
                }
            );

            toast.success("Interview started! Good luck.");

            // Navigate to session page with initial data
            navigate(`/ai-interview/session/${session._id}`, {
                state: {
                    firstQuestion: questionRes.data.nextQuestion,
                    firstQuestionId: questionRes.data.questionId,
                    company: formData.company,
                    type: formData.type,
                },
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to start interview. Please check your API key.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-1.5 text-xs font-semibold text-amber mb-2">
                        <Zap className="h-3.5 w-3.5" />
                        AI Interviewer Mode
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
                        Prepare for the Real Deal
                    </h1>
                    <p className="text-lg text-gray-500 max-w-md mx-auto">
                        Configure your AI interview session. The AI will behave like a professional recruiter.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <form onSubmit={handleStartInterview} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                                Target Company
                            </Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="company"
                                    name="company"
                                    placeholder="e.g. Google, Meta, Startup X"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-amber focus:ring-amber shadow-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Interview Type</Label>
                            <Select value={formData.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-amber focus:ring-amber shadow-none bg-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100">
                                    <SelectItem value="technical">Technical (Coding & Concepts)</SelectItem>
                                    <SelectItem value="behavioural">Behavioural (STAR Method)</SelectItem>
                                    <SelectItem value="mixed">Mixed (A bit of both)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {blueprint && (
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-white flex items-center justify-center border border-gray-100">
                                    <Layout className="h-5 w-5 text-amber" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-black">Blueprint Detected</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                        Role: {blueprint.targetRole} • {blueprint.experienceLevel}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        The AI will tailor questions to your {blueprint.skills.length} listed skills.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!blueprint && (
                            <div className="p-4 rounded-2xl bg-amber/5 border border-amber/10 flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-white flex items-center justify-center border border-amber/10">
                                    <MessageSquare className="h-5 w-5 text-amber" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber">First Interview?</h4>
                                    <p className="text-xs text-amber/80 mt-0.5">
                                        No blueprint found. The AI will ask general {formData.type} questions.
                                        Set up a blueprint for better targeting!
                                    </p>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-bold text-lg shadow-lg hover:shadow-black/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Initialising AI...
                                </div>
                            ) : (
                                <>
                                    Start Session
                                    <Zap className="h-5 w-5 fill-amber text-amber group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    By starting, you agree to follow professional conduct. This is an AI-driven simulation.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default InterviewSetup;
