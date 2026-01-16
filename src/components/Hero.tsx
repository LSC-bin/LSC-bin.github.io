"use client";

import { motion } from "framer-motion";
import { Download, Play, Terminal, Box, Search, Layers, Command, GitBranch, FileCode, Minus, Square, X as XIcon } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-32 pb-20 bg-[#0A0A0A]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-20" />

            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_1.4fr] gap-16 items-center">

                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-start text-left"
                    >


                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.1]">
                            DAy-oN. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400 animate-gradient-x">
                                Redefined.
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed font-light">
                            DAy-oN transforms your development experience.
                            Visualize your entire codebase as an interactive code map.
                            Understand dependencies, trace execution, and vibe with your code like never before.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <button className="w-full sm:w-auto group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold transition-all shadow-[0_4px_20px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 active:scale-95">
                                <Download className="w-5 h-5" />
                                <span>Download for Windows</span>
                            </button>


                        </div>

                        <div className="mt-6 text-xs text-gray-500 font-mono">
                            v1.2.0 | Free for personal use | <span className="text-blue-400 hover:underline cursor-pointer">Release Notes</span>
                        </div>
                    </motion.div>

                    {/* Right Column: React Flow Mockup - High Fidelity */}
                    <div className="relative hidden lg:block h-[700px] w-full perspective-[1000px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotateX: 5, rotateY: -5 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
                            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                            className="relative w-full h-full bg-[#111] rounded-xl border border-white/5 shadow-2xl overflow-hidden font-sans select-none"
                        >
                            {/* Window Header (Windows Style) */}
                            <div className="h-9 bg-[#18181b] border-b border-white/5 flex items-center justify-between px-4 select-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 bg-blue-500/20 rounded flex items-center justify-center">
                                        <Terminal className="w-2.5 h-2.5 text-blue-400" />
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-sans">vibe_simple_demo.py - Visual Map</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-500">
                                    <Minus className="w-3 h-3 hover:text-white cursor-pointer" />
                                    <Square className="w-2.5 h-2.5 hover:text-white cursor-pointer" />
                                    <XIcon className="w-3 h-3 hover:text-red-500 cursor-pointer" />
                                </div>
                            </div>

                            {/* Canvas Area with Dot Grid */}
                            <div className="relative w-full h-full p-0 overflow-hidden bg-[#0F1115]">
                                {/* Dot Grid */}
                                <div className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />

                                {/* SVG Edges */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                    <defs>
                                        <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
                                        </marker>
                                        <marker id="arrowhead-gray" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                            <polygon points="0 0, 6 2, 0 4" fill="#52525b" />
                                        </marker>
                                        <marker id="arrowhead-purple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                            <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
                                        </marker>
                                    </defs>

                                    {/* --- 1. Grey Orthogonal Lines (Structure) --- */}
                                    {/* File -> Button (196,82 -> 320,152) */}
                                    {/* File -> Button (196,82 -> 320,152) */}
                                    <motion.path d="M 196 82 L 258 82 L 258 152 L 320 152" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeInOut" }} />
                                    {/* File -> Player (196,82 -> 320,272) */}
                                    {/* File -> Player (196,82 -> 320,272) */}
                                    <motion.path d="M 196 82 L 258 82 L 258 272 L 320 272" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.35, duration: 0.6, ease: "easeInOut" }} />
                                    {/* File -> App (196,82 -> 320,392) */}
                                    {/* File -> App (196,82 -> 320,392) */}
                                    <motion.path d="M 196 82 L 258 82 L 258 392 L 320 392" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }} />

                                    {/* App -> run (496,392 -> 620,392) */}
                                    {/* App -> run (496,392 -> 620,392) */}
                                    <motion.path d="M 496 392 L 620 392" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }} />

                                    {/* run -> play (796,392 -> 920,432) - Purple Dashed Orthogonal */}
                                    {/* run -> play (796,392 -> 920,432) - Purple Dashed Orthogonal */}
                                    {/* run -> play (796,392 -> 920,432) - Purple Dashed Orthogonal */}
                                    <motion.path d="M 796 392 L 858 392 L 858 432 L 920 432" stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="10,10" markerEnd="url(#arrowhead-purple)" initial={{ opacity: 0, strokeDashoffset: 0 }} animate={{ opacity: 1, strokeDashoffset: -20 }} transition={{ opacity: { delay: 0.6, duration: 0.5 }, strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" } }} />

                                    {/* run -> click (796,392 -> 920,272) - Purple Dashed Orthogonal */}
                                    {/* run -> click (796,392 -> 920,272) - Purple Dashed Orthogonal */}
                                    {/* run -> click (796,392 -> 920,272) - Purple Dashed Orthogonal */}
                                    <motion.path d="M 796 392 L 858 392 L 858 272 L 920 272" stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="10,10" markerEnd="url(#arrowhead-purple)" initial={{ opacity: 0, strokeDashoffset: 0 }} animate={{ opacity: 1, strokeDashoffset: -20 }} transition={{ opacity: { delay: 0.6, duration: 0.5 }, strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" } }} />




                                    {/* --- 3. New Edges for Enemy --- */}
                                    {/* Player -> Enemy (Logic - Blue Dashed) */}
                                    {/* Player -> Enemy (Logic - Blue Dashed) */}
                                    {/* Player -> Enemy (Logic - Blue Dashed) */}
                                    <motion.path d="M 496 272 L 620 272" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="10,10" markerEnd="url(#arrowhead-blue)" initial={{ opacity: 0, strokeDashoffset: 0 }} animate={{ opacity: 1, strokeDashoffset: -20 }} transition={{ opacity: { delay: 0.45, duration: 0.5 }, strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" } }} />

                                    {/* Button -> Element (496,152 -> 620,152) */}
                                    {/* Button -> Element (496,152 -> 620,152) */}
                                    <motion.path d="M 496 152 L 620 152" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.45, duration: 0.6, ease: "easeInOut" }} />

                                    {/* Element -> render (796,152 -> 920,152) */}
                                    {/* Element -> render (796,152 -> 920,152) */}
                                    <motion.path d="M 796 152 L 920 152" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.55, duration: 0.6, ease: "easeInOut" }} />

                                    {/* Enemy -> click (796,272 -> 920,272) */}
                                    {/* Enemy -> click (796,272 -> 920,272) */}
                                    <motion.path d="M 796 272 L 920 272" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gray)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.55, duration: 0.6, ease: "easeInOut" }} />

                                    {/* Button -> Enemy (496,152 -> 620,272) - Blue Dashed Curve */}
                                    <motion.path
                                        d="M 496 152 C 558 152, 558 272, 620 272"
                                        stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="10,10" markerEnd="url(#arrowhead-blue)"
                                        initial={{ opacity: 0, strokeDashoffset: 0 }} animate={{ opacity: 1, strokeDashoffset: -20 }} transition={{ opacity: { duration: 0.8, delay: 0.5 }, strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" } }}
                                    />


                                </svg>




                                {/* Nodes Container */}
                                <div className="absolute inset-0 z-10">

                                    {/* --- ROOT: File Node --- */}
                                    {/* vibe_simple_demo.py */}
                                    {/* vibe_simple_demo.py */}
                                    <motion.div className="absolute top-[50px] left-[20px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}>
                                        <div className="rounded-xl border border-red-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                <FileCode className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200 truncate">vibe_simple_demo.py</span>
                                                <span className="text-[10px] text-gray-500">Source File</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-[#3f3f46] rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>


                                    {/* --- COL 1: Classes --- */}

                                    {/* Button */}
                                    {/* Button */}
                                    <motion.div className="absolute top-[120px] left-[320px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.05 }}>
                                        <div className="rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">Button</span>
                                                <span className="text-[10px] text-gray-500">Class</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                    {/* Player */}
                                    {/* Player */}
                                    <motion.div className="absolute top-[240px] left-[320px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.1 }}>
                                        <div className="rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">Player</span>
                                                <span className="text-[10px] text-gray-500">Class</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                    {/* App */}
                                    {/* App */}
                                    <motion.div className="absolute top-[360px] left-[320px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.15 }}>
                                        <div className="rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">App</span>
                                                <span className="text-[10px] text-gray-500">Class</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>


                                    {/* --- COL 2: Element & Run --- */}

                                    {/* Element */}
                                    {/* Element */}
                                    <motion.div className="absolute top-[120px] left-[620px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.2 }}>
                                        <div className="rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">Element</span>
                                                <span className="text-[10px] text-gray-500">Class</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                    {/* Enemy (NEW) */}
                                    {/* Enemy (NEW) */}
                                    <motion.div className="absolute top-[240px] left-[620px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.25 }}>
                                        <div className="rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">Enemy</span>
                                                <span className="text-[10px] text-gray-500">Class</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                    {/* run */}
                                    {/* run */}
                                    <motion.div className="absolute top-[360px] left-[620px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.3 }}>
                                        <div className="rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <GitBranch className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">run</span>
                                                <span className="text-[10px] text-gray-500">Method</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>


                                    {/* --- COL 3: Methods --- */}

                                    {/* render */}
                                    {/* render */}
                                    <motion.div className="absolute top-[120px] left-[920px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.35 }}>
                                        <div className="rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <GitBranch className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">render</span>
                                                <span className="text-[10px] text-gray-500">Method</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                    {/* click */}
                                    {/* click */}
                                    <motion.div className="absolute top-[240px] left-[920px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.4 }}>
                                        <div className="rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <GitBranch className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">click</span>
                                                <span className="text-[10px] text-gray-500">Method</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                    {/* play */}
                                    {/* play */}
                                    <motion.div className="absolute top-[400px] left-[920px] w-44" initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.5, delay: 0.45 }}>
                                        <div className="rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg flex items-center p-3 gap-3 relative">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <GitBranch className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200">play</span>
                                                <span className="text-[10px] text-gray-500">Method</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-gray-400 rounded-full border border-black" />
                                    </motion.div>

                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}


