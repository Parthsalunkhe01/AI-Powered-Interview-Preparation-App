import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, AlertCircle, ChevronRight, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "../../components/ui/button";
import { BlueprintSummary } from "../../components/ui/BlueprintSummary";
import { SessionSettings } from "../../components/ui/SessionSettings";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

const InterviewSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [blueprint, setBlueprint] = useState(null);
    const [settings, setSettings] = useState({
        type: "technical",
        difficulty: "medium",
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
            // 1. Create the session (company/role/exp auto-filled by backend from blueprint)
            const sessionRes = await axiosInstance.post(API_PATHS.INTERVIEW_SESSION.CREATE, {
                type: settings.type,
                difficulty: settings.difficulty,
                questionLimit: settings.questionLimit,
            });

            const session = sessionRes.data.session;

            // 2. Trigger the first question
            const questionRes = await axiosInstance.post(
                API_PATHS.INTERVIEW_SESSION.SUBMIT_ANSWER(session._id),
                { answer: "" }
            );

            toast.success("Interview started! Good luck.");

            // Navigate to session page
            navigate(`/ai-interview/session/${session._id}`, {
                state: {
                    firstQuestion: questionRes.data.nextQuestion,
                    firstQuestionId: questionRes.data.questionId,
                    company: session.company,
                    type: settings.type,
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
            <>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <p className="text-muted-foreground font-medium">Loading session data...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="max-w-6xl mx-auto py-12 px-6">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-2">
                        <Zap className="h-3.5 w-3.5" />
                        Simulation Environment Ready
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        Start Your High-Fidelity Interview
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your blueprint has been loaded. Configure your session parameters below to begin the technical evaluation.
                    </p>
                </div>

                {!blueprint ? (
                    <div className="bg-accent/5 border border-accent/10 rounded-3xl p-12 text-center space-y-6">
                        <div className="h-20 w-20 bg-card rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-accent/20">
                            <AlertCircle className="h-10 w-10 text-accent" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Blueprint Required</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                We couldn't find an interview blueprint for your account. Blueprints are required to fuel the AI's technical reasoning.
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate("/blueprint")}
                            className="bg-accent hover:opacity-90 text-white rounded-xl h-12 px-8 font-bold"
                        >
                            Create Blueprint Now <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left: Summary */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-2">Summary</h3>
                            <BlueprintSummary blueprint={blueprint} />
                            <div className="p-6 rounded-3xl bg-card border border-border text-foreground space-y-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-accent fill-accent" />
                                    AI Logic Primed
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The engine will use your {blueprint.skills.length} skills and targeting for {blueprint.company || "tech companies"} to generate unique, challenging questions.
                                </p>
                            </div>
                        </div>

                        {/* Right: Settings */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-2">Session Parameters</h3>
                            <SessionSettings settings={settings} onChange={handleSettingChange} />

                            <div className="pt-4">
                                <Button
                                    onClick={handleStartInterview}
                                    disabled={loading}
                                    className="w-full h-16 rounded-3xl bg-accent hover:opacity-90 text-white font-black text-xl shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Authenticating with AI...
                                        </>
                                    ) : (
                                        <>
                                            Begin Technical Session
                                            <ArrowRight className="h-6 w-6" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground mt-4">
                                    Clicking "Begin" will initialize a dedicated virtual environment for your interview.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default InterviewSetup;
