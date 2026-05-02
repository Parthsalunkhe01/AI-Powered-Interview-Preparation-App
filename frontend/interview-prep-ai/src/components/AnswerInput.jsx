import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

/**
 * AnswerInput Component
 * Handles user input for the interview: Text or Voice.
 */
const AnswerInput = ({ onSubmit, loading, placeholder = "Type your answer here..." }) => {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition if available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setText((prev) => prev + " " + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        if (isListening) recognitionRef.current.stop();

        onSubmit(text.trim());
        setText("");
    };

    return (
        <form onSubmit={handleFormSubmit} className="relative w-full max-w-3xl mx-auto group">
            <div className="relative flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-200 group-focus-within:border-indigo-300 transition-all shadow-sm">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleListening}
                    className={`shrink-0 h-10 w-10 rounded-2xl transition-all border border-transparent ${isListening
                        ? "bg-red-50 border-red-200 text-red-500 animate-pulse"
                        : "bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200"
                        }`}
                >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isListening ? "Listening..." : placeholder}
                    disabled={loading}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 outline-none disabled:opacity-50 text-slate-900 placeholder:text-slate-400"
                />

                <Button
                    type="submit"
                    disabled={!text.trim() || loading}
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white disabled:opacity-50 shadow-sm transition-all active:scale-95 border-0 hover:from-indigo-600 hover:to-violet-600"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </div>
            {isListening && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 bg-red-400 rounded-full animate-bounce" />
                    </span>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Recording</span>
                </div>
            )}
        </form>
    );
};

export default AnswerInput;
