"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Play, Activity } from "lucide-react";
import { useState } from "react";

export default function FloatingCardDemo() {
    const [showCard, setShowCard] = useState(false);

    const nodeTransition = {
        type: "spring" as const,
        mass: 0.5,
        stiffness: 400,
        damping: 25,
    };

    const cardTransition = {
        type: "spring" as const,
        mass: 1,
        stiffness: 120, // Much softer/slower
        damping: 20,
        delay: 0.5,
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            {/* Interactive Area */}
            <div className="relative w-full h-full flex items-center justify-center">

                {/* 1. The 'Update' Node (Image 0 Style) */}
                <motion.div
                    transition={nodeTransition}
                    className={`
                        relative z-20 w-48 bg-[#1e1e1e] rounded-xl border border-purple-500/50 shadow-lg cursor-pointer
                        hover:scale-105 transition-all duration-300 group
                    `}
                    style={{
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)',
                        willChange: "transform"
                    }}
                    onClick={() => setShowCard(!showCard)}
                    whileHover={{ y: -5 }}
                    animate={{
                        x: showCard ? -130 : 0, // Move left (reduced distance)
                        y: 0,
                    }}
                >
                    <div className="flex items-center p-4 gap-3">
                        {/* Icon Box */}
                        <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                            <GitBranch className="w-5 h-5 text-purple-400" />
                        </div>
                        {/* Text */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-base font-bold text-gray-100 leading-none">update</span>
                            <span className="text-xs font-medium text-gray-500 mt-1">Method</span>
                        </div>
                    </div>
                </motion.div>


                {/* 2. The Floating Code Card (Image 1 Style) */}
                <AnimatePresence>
                    {showCard && (
                        <motion.div
                            initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.8 }} // Start centered
                            animate={{
                                opacity: 1, x: "10%", y: "-50%", scale: 1,
                                transition: cardTransition
                            }} // Move slightly right
                            exit={{
                                opacity: 0, x: "-50%", y: "-50%", scale: 0.5,
                                transition: { ...nodeTransition, delay: 0.4 }
                            }} // Retreat to center
                            className="absolute z-10 w-80 bg-[#1A1D21] rounded-xl border border-gray-800 shadow-2xl overflow-hidden"
                            style={{
                                left: "50%",
                                top: "50%",
                                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
                                willChange: "transform, opacity"
                            }}
                        >
                            {/* Window Header */}
                            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-gray-200 font-bold text-sm tracking-wide">update</span>
                            </div>

                            {/* Code Content Area */}
                            <div className="p-5 font-mono text-xs relative">
                                {/* Line Numbers Background */}
                                <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-gray-800/50 bg-[#1A1D21] z-0" />

                                <div className="relative z-10 space-y-4">

                                    {/* Line 118: Green Block */}
                                    <div className="flex items-start gap-4 group">
                                        <span className="w-6 text-right text-gray-600 shrink-0 select-none">118</span>
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                                                <Play className="w-3 h-3 fill-current" />
                                                <span>public update():</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line 119-120: Comment/Logic */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-6 text-right text-gray-600 shrink-0 select-none opacity-50 space-y-4">
                                            <div>119</div>
                                        </div>
                                        <div className="flex-1 pt-0.5 pl-1">
                                            <div className="text-gray-500 italic"># Check user input first</div>
                                        </div>
                                    </div>

                                    {/* Line 121: Purple Block */}
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 text-right text-gray-600 shrink-0 select-none">121</span>
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                                <Activity className="w-3 h-3" />
                                                <span>this.input.check()</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line 123: Blue Block */}
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 text-right text-gray-600 shrink-0 select-none">123</span>
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                                                <GitBranch className="w-3 h-3" />
                                                <span>this.move()</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Closing Brace */}
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 text-right text-gray-600 shrink-0 select-none">124</span>
                                        <span className="text-green-500 pl-1">{'}'}</span>
                                    </div>

                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Initial Hint */}
                {!showCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute bottom-6 font-sans text-xs text-gray-500"
                    >
                        Click to structure node
                    </motion.div>
                )}
            </div>
        </div>
    );
}
