import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// =========================================================================
// ⚠️ PASTE YOUR GOOGLE GEMINI API KEY HERE ⚠️
// 🆓 Gemini has a completely FREE tier! It will not ask for a credit card.
// Get it here: https://aistudio.google.com/app/apikey
// =========================================================================
const GEMINI_API_KEY = "AIzaSyBkyqRQXA2JW073fgQHjuy_H8xC8kjyNaw";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hi there! How can I help you today?" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            ...messages.map((m) => ({
                                role: m.role === "bot" ? "model" : "user",
                                parts: [{ text: m.text }],
                            })),
                            {
                                role: "user",
                                parts: [{ text: userMessage.text }],
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const botText =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "Sorry, I couldn't understand that.";

            setMessages((prev) => [...prev, { role: "bot", text: botText }]);
        } catch (error) {
            console.error("Chatbot API Error:", error);

            // Check if it's an API Key error
            let errorMsg = error.message;
            if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("key not valid")) {
                errorMsg = "Invalid API Key! Did you paste your Gemini key in the Chatbot.jsx file?";
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: `Error: ${errorMsg || "Failed to fetch response."}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] max-h-[80vh] bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Bot size={24} className="text-white" />
                                <h3 className="font-semibold text-lg">AI Assistant</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                                aria-label="Close Chat"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 overflow-x-hidden">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 text-sm flex gap-3 ${m.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm"
                                            }`}
                                    >
                                        {m.role === "bot" && (
                                            <div className="flex-shrink-0 mt-0.5">
                                                <Bot size={16} className="text-blue-400" />
                                            </div>
                                        )}
                                        <div className="leading-relaxed break-words whitespace-pre-wrap flex-1">
                                            {m.role === "bot" ? (
                                                <div className="markdown-prose text-sm">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            strong: ({ node, ...props }) => <span className="font-bold text-gray-100" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-4 my-2 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside pl-4 my-2 space-y-1" {...props} />,
                                                            li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
                                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2 text-white" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1 text-white" {...props} />,
                                                            code: ({ node, inline, className, children, ...props }) =>
                                                                inline
                                                                    ? <code className="bg-gray-700/80 rounded px-1.5 py-0.5 text-xs font-mono text-gray-200" {...props}>{children}</code>
                                                                    : <code className="block bg-black/40 border border-gray-700/50 rounded-lg p-3 text-xs font-mono my-3 overflow-x-auto text-gray-300" {...props}>{children}</code>,
                                                        }}
                                                    >
                                                        {m.text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span>{m.text}</span>
                                            )}
                                        </div>
                                        {m.role === "user" && (
                                            <div className="flex-shrink-0 mt-0.5">
                                                <User size={16} className="text-blue-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm p-4 flex gap-2 items-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-gray-900 border-t border-gray-800">
                            <div className="flex relative items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask a question..."
                                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-inner"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md"
                                    aria-label="Send"
                                >
                                    <Send size={16} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow focus:outline-none z-50"
                aria-label="Toggle Chat"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
}
