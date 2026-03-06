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
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
            <div>
                <h3 className="text-lg font-bold text-black mb-1">Session Configuration</h3>
                <p className="text-sm text-gray-500">Tune the AI behavior for this interview</p>
            </div>

            <div className="space-y-6">
                {/* Interview Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-amber" />
                        Interview Type
                    </Label>
                    <Select
                        value={settings.type}
                        onValueChange={(val) => onChange("type", val)}
                    >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/50 shadow-none">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            <SelectItem value="technical">Technical (Coding & Concepts)</SelectItem>
                            <SelectItem value="behavioural">Behavioural (STAR Method)</SelectItem>
                            <SelectItem value="mixed">Mixed (A bit of both)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-amber" />
                        Difficulty Level
                    </Label>
                    <Select
                        value={settings.difficulty}
                        onValueChange={(val) => onChange("difficulty", val)}
                    >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/50 shadow-none">
                            <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            <SelectItem value="easy">Easy (Fundamentals)</SelectItem>
                            <SelectItem value="medium">Medium (Standard Industry)</SelectItem>
                            <SelectItem value="hard">Hard (Advanced Topics)</SelectItem>
                            <SelectItem value="adaptive">Adaptive (AI Scales with Performance)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-amber" />
                        Question Count
                    </Label>
                    <Select
                        value={settings.questionLimit.toString()}
                        onValueChange={(val) => onChange("questionLimit", parseInt(val))}
                    >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/50 shadow-none">
                            <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            <SelectItem value="5">Standard (5 Questions)</SelectItem>
                            <SelectItem value="10">Deep Dive (10 Questions)</SelectItem>
                            <SelectItem value="15">Extended (15 Questions)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-gray-400 italic">
                        Note: Longer sessions provide more comprehensive qualitative feedback.
                    </p>
                </div>
            </div>
        </div>
    );
};

export { SessionSettings };
