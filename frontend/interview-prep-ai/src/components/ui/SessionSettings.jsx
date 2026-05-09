import React from "react";
import { Focus, ListOrdered, BookOpen } from "lucide-react";
import { Label } from "./Label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./select";

const FOCUS_OPTIONS = [
    { value: "android",      label: "Android Development", description: "Activities, Fragments, RecyclerView, Room, Firebase" },
    { value: "dsa",          label: "DSA",                  description: "Arrays, LinkedLists, Trees, Sorting, Graph algorithms" },
    { value: "system_design",label: "System Design",        description: "Architecture, Scalability, Caching, Databases at scale" },
    { value: "database",     label: "Database Design",      description: "SQL, NoSQL, Normalization, Query optimization" },
    { value: "java",         label: "Java Core",            description: "OOP, Concurrency, Collections, JVM internals" },
    { value: "hr",           label: "HR + Behavioral",      description: "STAR method, communication, leadership scenarios" },
    { value: "mixed",        label: "Mixed Interview",       description: "Combination of technical, DSA, and behavioral" },
];

const SessionSettings = ({ settings, onChange }) => {
    return (
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-slate-100 p-8 shadow-xl space-y-8">
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Session Settings</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Difficulty adapts automatically to your performance
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
