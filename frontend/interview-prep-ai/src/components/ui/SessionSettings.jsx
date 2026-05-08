import React from "react";
import { MessageSquare, Gauge, ListOrdered } from "lucide-react";
import { Label } from "./Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select";

const SessionSettings = ({ settings, onChange }) => {
    return (
        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-slate-100 p-8 shadow-xl space-y-8">
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Interview Settings</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customize your mock interview experience</p>
            </div>

            <div className="space-y-6">
                {/* Interview Type */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                        Interview Type
                    </Label>
                    <Select
                        value={settings.type}
                        onValueChange={(val) => onChange("type", val)}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 shadow-sm text-slate-900 font-bold transition-all hover:bg-slate-100 focus:ring-indigo-500/50">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                            <SelectItem value="technical" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Technical (Coding & Concepts)</SelectItem>
                            <SelectItem value="behavioural" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Behavioural (STAR Method)</SelectItem>
                            <SelectItem value="mixed" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Mixed (A bit of both)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Gauge className="h-3.5 w-3.5 text-indigo-500" />
                        Difficulty Level
                    </Label>
                    <Select
                        value={settings.difficulty}
                        onValueChange={(val) => onChange("difficulty", val)}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 shadow-sm text-slate-900 font-bold transition-all hover:bg-slate-100 focus:ring-indigo-500/50">
                            <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                            <SelectItem value="easy" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Easy (Fundamentals)</SelectItem>
                            <SelectItem value="medium" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Medium (Standard Industry)</SelectItem>
                            <SelectItem value="hard" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Hard (Advanced Topics)</SelectItem>
                            <SelectItem value="adaptive" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Adaptive (AI Scales with Performance)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Number of Questions */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ListOrdered className="h-3.5 w-3.5 text-indigo-500" />
                        Number of Questions
                    </Label>
                    <Select
                        value={settings.questionLimit.toString()}
                        onValueChange={(val) => onChange("questionLimit", parseInt(val))}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 shadow-sm text-slate-900 font-bold transition-all hover:bg-slate-100 focus:ring-indigo-500/50">
                            <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                            <SelectItem value="5" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Standard (5 Questions)</SelectItem>
                            <SelectItem value="10" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Deep Dive (10 Questions)</SelectItem>
                            <SelectItem value="15" className="text-slate-700 focus:bg-slate-50 focus:text-slate-900">Extended (15 Questions)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 font-bold italic pl-1">
                        Note: Longer sessions provide more detailed feedback on your performance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export { SessionSettings };
