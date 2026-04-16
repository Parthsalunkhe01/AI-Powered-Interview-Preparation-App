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
        <div className="!bg-[#0B1220] rounded-[32px] border border-white/5 ring-1 ring-white/5 p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] space-y-8">
            <div>
                <h3 className="text-xl font-black text-white mb-1">Session Configuration</h3>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Tune the AI behavior for this interview</p>
            </div>

            <div className="space-y-6">
                {/* Interview Type */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        Interview Type protocol
                    </Label>
                    <Select
                        value={settings.type}
                        onValueChange={(val) => onChange("type", val)}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 shadow-none text-white font-bold transition-all hover:bg-white/10">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-card">
                            <SelectItem value="technical">Technical (Coding & Concepts)</SelectItem>
                            <SelectItem value="behavioural">Behavioural (STAR Method)</SelectItem>
                            <SelectItem value="mixed">Mixed (A bit of both)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Gauge className="h-3.5 w-3.5 text-primary" />
                        Difficulty Level parameter
                    </Label>
                    <Select
                        value={settings.difficulty}
                        onValueChange={(val) => onChange("difficulty", val)}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 shadow-none text-white font-bold transition-all hover:bg-white/10">
                            <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-card">
                            <SelectItem value="easy">Easy (Fundamentals)</SelectItem>
                            <SelectItem value="medium">Medium (Standard Industry)</SelectItem>
                            <SelectItem value="hard">Hard (Advanced Topics)</SelectItem>
                            <SelectItem value="adaptive">Adaptive (AI Scales with Performance)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ListOrdered className="h-3.5 w-3.5 text-primary" />
                        Question Count density
                    </Label>
                    <Select
                        value={settings.questionLimit.toString()}
                        onValueChange={(val) => onChange("questionLimit", parseInt(val))}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 shadow-none text-white font-bold transition-all hover:bg-white/10">
                            <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-card">
                            <SelectItem value="5">Standard (5 Questions)</SelectItem>
                            <SelectItem value="10">Deep Dive (10 Questions)</SelectItem>
                            <SelectItem value="15">Extended (15 Questions)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-zinc-400 font-bold italic pl-1">
                        Note: Extended sessions calibrate deeper qualitative feedback strings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export { SessionSettings };
