import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Code2, MessageSquare, Image as ImageIcon, Trash2, 
    Play, CheckCircle, AlertCircle, FileCode, Database,
    Layout, Cpu, Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const TaskAwareInput = ({ type, onSubmit, loading, placeholder }) => {
    const [textValue, setTextValue] = useState("");
    const [codeValue, setCodeValue] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [image, setImage] = useState(null);
    const [activeTab, setActiveTab] = useState("text"); // 'text' or 'code'

    const fileInputRef = useRef(null);

    // Reset fields when question type changes
    useEffect(() => {
        setTextValue("");
        setCodeValue("");
        setImage(null);
        if (type === 'coding' || type === 'debug') {
            setActiveTab("code");
        } else {
            setActiveTab("text");
        }
    }, [type]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image too large (max 2MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!textValue.trim() && !codeValue.trim()) {
            toast.error("Please provide an answer.");
            return;
        }
        
        onSubmit({
            answer: textValue.trim(),
            code: codeValue.trim(),
            language: language,
            image: image || ""
        });
    };

    const isCodingTask = type === 'coding' || type === 'debug';
    const isDesignTask = type === 'system_design' || type === 'database';

    return (
        <div className="space-y-4">
            {/* ── Tabs for Multi-modal ── */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                    onClick={() => setActiveTab("text")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        activeTab === "text" 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                    <MessageSquare className="h-3 w-3" />
                    Explanation
                </button>
                {isCodingTask && (
                    <button
                        onClick={() => setActiveTab("code")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            activeTab === "code" 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                        <Code2 className="h-3 w-3" />
                        Code Editor
                    </button>
                )}
                {isDesignTask && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        <ImageIcon className="h-3 w-3" />
                        {image ? "Change Diagram" : "Upload Diagram"}
                    </button>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "text" ? (
                    <motion.div
                        key="text-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative"
                    >
                        <textarea
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            disabled={loading}
                            rows={isCodingTask ? 4 : 8}
                            placeholder={placeholder || "Explain your approach..."}
                            className="w-full px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-400 outline-none transition-all resize-none font-medium leading-relaxed shadow-sm"
                        />
                        {isDesignTask && image && (
                            <div className="mt-3 relative inline-block group">
                                <img src={image} alt="Diagram" className="h-32 w-auto rounded-xl border border-slate-200 shadow-sm" />
                                <button 
                                    onClick={() => setImage(null)}
                                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Attached Diagram ✓</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="code-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                    >
                        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-700 outline-none"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="java">Java</option>
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                    <Play className="h-3 w-3" />
                                    Run
                                </button>
                            </div>
                        </div>
                        <Editor
                            height="300px"
                            language={language}
                            theme="vs-dark"
                            value={codeValue}
                            onChange={(val) => setCodeValue(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 10, bottom: 10 }
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle className={`h-3.5 w-3.5 ${textValue.length > 50 ? "text-emerald-500" : "text-slate-300"}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Explanation</span>
                    </div>
                    {isCodingTask && (
                        <div className="flex items-center gap-1.5">
                            <FileCode className={`h-3.5 w-3.5 ${codeValue.length > 0 ? "text-emerald-500" : "text-slate-300"}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Code</span>
                        </div>
                    )}
                    {isDesignTask && (
                        <div className="flex items-center gap-1.5">
                            <Layout className={`h-3.5 w-3.5 ${image ? "text-emerald-500" : "text-slate-300"}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Diagram</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || (!textValue.trim() && !codeValue.trim())}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100"
                >
                    Submit Task
                    <Play className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
};

export default TaskAwareInput;
