import React from "react"

const RoleInfoHeader = ({
    role,
    topicsToFocus,
    experience,
    questions,
    description,
    lastUpdated,
    onViewResources
}) => {
    return (
    <div className="bg-white relative">
        <div className="container mx-auto px-10 md:px-0">
            <div className="h-[200px] flex flex-col justify-center relative z-10">
                <div className="flex items-start">
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{role}</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">{topicsToFocus}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                    <div className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                        Experience: {experience} {experience == 1 ? "Year": "Years"}
                    </div>

                    <div className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                        {questions} Questions
                    </div>

                    <div className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                        Updated: {lastUpdated}
                    </div>

                    <button 
                        onClick={onViewResources}
                        className="text-[10px] font-bold text-white bg-primary hover:opacity-90 px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
                    >
                        View Resources
                    </button>
                </div>
            </div>

            <div className="w-[40vw] md:w-[30vw] h-[200px] flex items-center justify-center bg-white overflow-hidden absolute top-0 right-0">
                <div className="w-16 h-16 bg-lime-400 blur-[65px] animate-blob1"/>
                <div className="w-16 h-16 bg-teal-400 blur-[65px] animate-blob2"/>
                <div className="w-16 h-16 bg-cyan-300 blur-[45px] animate-blob3"/>
                <div className="w-16 h-16 bg-fuchsia-200 blur-[45px] animate-blob1"/>
            </div>
        </div>
    </div>
    )
}

export default RoleInfoHeader;