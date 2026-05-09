import React from "react";
import { Focus, ListOrdered, BookOpen } from "lucide-react";
import { Label } from "./Label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./select";

const ROLE_BASED_FOCUS = {
    "ai/ml engineer": [
        { value: "python", label: "Python Mastery", description: "Advanced Python, NumPy, Pandas, AsyncIO" },
        { value: "machine_learning", label: "Machine Learning", description: "Supervised/Unsupervised, Scikit-learn, Feature Engineering" },
        { value: "deep_learning", label: "Deep Learning", description: "Neural Networks, CNNs, RNNs, PyTorch/TensorFlow" },
        { value: "nlp", label: "NLP", description: "Transformers, LLMs, Tokenization, Sentiment Analysis" },
        { value: "data_science", label: "Data Science", description: "Statistics, Probability, Data Visualization, SQL" },
        { value: "mlops", label: "MLOps", description: "Model deployment, monitoring, CI/CD for ML" },
        { value: "ai_system_design", label: "AI System Design", description: "Scalable ML architectures, vector databases, inference optimization" },
        { value: "prompt_engineering", label: "Prompt Engineering", description: "RAG, chain-of-thought, system prompting, LLM orchestration" },
        { value: "mixed", label: "Mixed AI Interview", description: "Broad range of AI/ML concepts and coding" },
    ],
    "android developer": [
        { value: "android", label: "Android SDK", description: "Activities, Fragments, Lifecycle, Intent, Services" },
        { value: "java_kotlin", label: "Java/Kotlin Core", description: "Coroutines, Flow, Generics, Collections" },
        { value: "jetpack_compose", label: "Jetpack Compose", description: "Declarative UI, State management, Composable lifecycle" },
        { value: "mvvm", label: "MVVM Architecture", description: "ViewModel, LiveData, Repository pattern, Clean Architecture" },
        { value: "mobile_system_design", label: "Mobile System Design", description: "Offline sync, caching, image loading, modularization" },
        { value: "dsa", label: "DSA (Mobile Focused)", description: "Arrays, Lists, Maps, Algorithm complexity" },
        { value: "mixed", label: "Mixed Android Interview", description: "Technical, architecture, and behavioral" },
    ],
    "backend developer": [
        { value: "apis", label: "API Design", description: "REST, GraphQL, gRPC, Versioning, Documentation" },
        { value: "authentication", label: "Auth & Security", description: "JWT, OAuth2, RBAC, Encryption, Hashing" },
        { value: "database", label: "Database Design", description: "SQL vs NoSQL, Indexing, Transactions, ACID" },
        { value: "caching", label: "Caching & Redis", description: "Cache invalidation, Distributed cache, Performance" },
        { value: "scalability", label: "Scalability", description: "Load balancing, Microservices, Message queues" },
        { value: "system_design", label: "System Design", description: "High-level architecture, CAP theorem, Distributed systems" },
        { value: "mixed", label: "Mixed Backend Interview", description: "Server-side logic, DB, and system thinking" },
    ],
    "default": [
        { value: "dsa", label: "DSA", description: "Data structures and algorithms" },
        { value: "system_design", label: "System Design", description: "Architecture and scalability" },
        { value: "database", label: "Database", description: "SQL and NoSQL" },
        { value: "hr", label: "HR + Behavioral", description: "Soft skills and culture fit" },
        { value: "mixed", label: "Mixed Technical", description: "General software engineering" },
    ]
};

const SessionSettings = ({ settings, onChange, blueprint }) => {
    const role = (blueprint?.targetRole || "").toLowerCase();
    const FOCUS_OPTIONS = ROLE_BASED_FOCUS[role] || ROLE_BASED_FOCUS["default"];

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-slate-100 p-8 shadow-xl space-y-8">
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Session Settings</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Tailored to your {blueprint?.targetRole || "career"} path
                </p>
            </div>

            <div className="space-y-6">
                {/* Interview Focus */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        Interview Focus
                    </Label>
                    <Select
                        value={settings.focus || "mixed"}
                        onValueChange={(val) => onChange("focus", val)}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 shadow-sm text-slate-900 font-bold transition-all hover:bg-slate-100 focus:ring-indigo-500/50">
                            <SelectValue placeholder="Select focus area" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                            {FOCUS_OPTIONS.map(opt => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-slate-700 focus:bg-slate-50 focus:text-slate-900"
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Show description of selected focus */}
                    {settings.focus && (
                        <p className="text-[10px] text-indigo-600 font-semibold pl-1 italic">
                            {FOCUS_OPTIONS.find(o => o.value === settings.focus)?.description}
                        </p>
                    )}
                </div>

                {/* Number of Questions */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ListOrdered className="h-3.5 w-3.5 text-indigo-500" />
                        Number of Questions
                    </Label>
                    <Select
                        value={settings.questionLimit?.toString() || "5"}
                        onValueChange={(val) => onChange("questionLimit", parseInt(val))}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 shadow-sm text-slate-900 font-bold transition-all hover:bg-slate-100 focus:ring-indigo-500/50">
                            <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                            <SelectItem value="5" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Quick (5 Questions)</SelectItem>
                            <SelectItem value="8" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Standard (8 Questions)</SelectItem>
                            <SelectItem value="10" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Deep Dive (10 Questions)</SelectItem>
                            <SelectItem value="15" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Extended (15 Questions)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 font-bold italic pl-1">
                        More questions = richer analytics and more detailed feedback.
                    </p>
                </div>

                {/* Adaptive Notice */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Focus className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-800">Adaptive Difficulty</p>
                        <p className="text-[11px] text-indigo-600/80 mt-0.5 leading-relaxed">
                            The AI automatically adjusts question difficulty based on your answers — no manual setting needed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { SessionSettings };
