"use client";

import { motion } from "framer-motion";
import { Terminal, Zap, Activity, FileCode, Box, GitBranch, Layers, Search, Command, Minus, Square, X as XIcon, Play } from "lucide-react";

const steps = [
    {
        icon: Terminal,
        title: "Open Code Editor",
        description: "Just open VS Code or your favorite editor. No manual file selection or uploads required. We detect your workspace automatically."
    },
    {
        icon: Zap,
        title: "Real-time Events",
        description: "Our engine listens to filesystem events instantly. Every save, new file, or modification is captured in milliseconds."
    },
    {
        icon: Activity,
        title: "Live Sync",
        description: "Watch your code map evolve as you type. The visualization updates in real-time to reflect your latest architecture changes."
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 relative z-10 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[#0F1115]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] via-transparent to-[#0F1115]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                        From Code to <span className="text-blue-500">Cosmos</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Three simple steps to transform your understanding of any project.
                    </p>
                </div>

                {/* Main Visual: High-Fidelity Sync Simulation */}
                <div className="relative mb-24">
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-0 xl:gap-8">

                        {/* 1. Left Window: VS Code Mockup (High Fidelity - Windows Style) */}
                        <motion.div
                            className="relative w-full max-w-lg xl:w-[600px] h-[450px] bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col"
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: false }}
                        >
                            {/* Windows Title Bar */}
                            <div className="h-8 bg-[#18181b] flex items-center justify-between px-3 shrink-0 select-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 bg-blue-500/20 rounded flex items-center justify-center">
                                        <FileCode className="w-2.5 h-2.5 text-blue-400" />
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-sans">MyProject - VS Code</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-500">
                                    <Minus className="w-3 h-3 hover:text-white cursor-pointer" />
                                    <Square className="w-2.5 h-2.5 hover:text-white cursor-pointer" />
                                    <XIcon className="w-3 h-3 hover:text-red-500 cursor-pointer" />
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Sidebar (Activity Bar) */}
                                <div className="w-12 bg-[#333333] flex flex-col items-center pt-2 gap-6 shrink-0 border-r border-white/5 z-10">
                                    <div className="w-6 h-6 text-white/80 border-l-2 border-white pl-3 -ml-3.5"><FileCode className="w-6 h-6" /></div>
                                    <div className="w-6 h-6 text-white/40"><Search className="w-6 h-6" /></div>
                                    <div className="w-6 h-6 text-white/40"><GitBranch className="w-6 h-6" /></div>
                                    <div className="mt-auto w-6 h-6 text-white/40 pb-4"><Command className="w-6 h-6" /></div>
                                </div>

                                {/* Main Editor Area */}
                                <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                                    {/* Tabs */}
                                    <div className="h-9 bg-[#252526] flex items-center overflow-hidden relative z-0">
                                        <div className="px-4 h-full bg-[#1e1e1e] flex items-center gap-2 border-t border-blue-500 text-xs text-white">
                                            <FileCode className="w-3.5 h-3.5 text-blue-400" />
                                            <span>Player.ts</span>
                                            <XIcon className="w-3 h-3 ml-1 text-white/20 hover:text-white" />
                                        </div>
                                        <div className="px-4 h-full flex items-center gap-2 text-xs text-white/50 bg-[#2d2d2d] border-r border-[#1e1e1e]">
                                            <span>Enemy.ts</span>
                                        </div>
                                    </div>

                                    {/* Breadcrumbs */}
                                    <div className="h-6 flex items-center px-4 text-[10px] text-white/40 gap-1 border-b border-white/5 bg-[#1e1e1e]">
                                        <span>src</span>
                                        <span>&gt;</span>
                                        <span>game</span>
                                        <span>&gt;</span>
                                        <span className="text-white/80">Player.ts</span>
                                    </div>

                                    {/* Code Area */}
                                    <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-hidden relative bg-[#1e1e1e]">
                                        {/* Line Numbers */}
                                        <div className="absolute left-0 top-4 w-10 text-right pr-3 text-white/30 select-none">
                                            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div>
                                        </div>

                                        {/* Code Content */}
                                        <div className="pl-8 text-gray-300">
                                            <div><span className="text-blue-400">class</span> <span className="text-yellow-400">Player</span> <span className="text-white">{`{`}</span></div>
                                            <div className="pl-4"><span className="text-blue-400">public</span> <span className="text-yellow-400">health</span>() <span className="text-white">{`{`}</span></div>
                                            <div className="pl-8"><span className="text-blue-400">const</span> <span className="text-sky-300">base</span> = <span className="text-green-400">100</span>;</div>
                                            <div className="pl-8"><span className="text-purple-400">return</span> <span className="text-sky-300">base</span>;</div>
                                            <div className="pl-4"><span className="text-white">{`}`}</span></div>
                                            <div className="pl-4"><span className="text-blue-400">private</span> <span className="text-sky-300">input</span>: <span className="text-yellow-400">InputHandler</span>;</div>

                                            {/* Sequence 1: Method Definition (Header) */}
                                            {/* Timeline: 0.00 -> 0.15 (Type), Hold until 0.95 */}
                                            {/* Sequence 1: Method Definition (Header) */}
                                            {/* Timeline: 0.00 -> 0.13 (Type, 17 chars), Hold until 0.95 */}
                                            <div className="pl-4 h-6 flex items-center">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 1, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "100%", "100%", "100%"], // Keep width 100% until reset
                                                        opacity: [1, 1, 1, 0], // Fade out at end
                                                        borderRightColor: ["rgb(96 165 250)", "rgb(96 165 250)", "transparent", "transparent"]
                                                    }}
                                                    transition={{
                                                        duration: 12,
                                                        times: [0, 0.13, 0.95, 1], // Type -> Hold -> Fade Out
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap inline-block text-left border-r-2 border-blue-400"
                                                    style={{ maxWidth: 'fit-content', width: 0 }}
                                                >
                                                    <span className="text-blue-400">public</span> <span className="text-yellow-400">update</span>() <span className="text-white">{`{`}</span>
                                                </motion.div>
                                            </div>

                                            {/* Sequence 1.5: Comment */}
                                            {/* Timeline: 0.13 -> 0.32 (Type, 25 chars), Hold until 0.95 */}
                                            <div className="pl-8 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "100%", "100%", "100%", "100%"],
                                                        opacity: [0, 0, 1, 1, 1, 1, 0], // Stay 0 until start, Hold 1 until 0.95, Fade out
                                                        borderRightColor: ["transparent", "transparent", "rgb(107 114 128)", "rgb(107 114 128)", "transparent", "transparent", "transparent"]
                                                    }}
                                                    transition={{
                                                        duration: 12,
                                                        times: [0, 0.129, 0.13, 0.32, 0.321, 0.95, 1], // Wait -> Safety -> Start -> End -> Cursor Off -> Hold -> FadeOut
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap border-r-2 border-gray-500 w-0 inline-block align-bottom min-w-0"
                                                    style={{ maxWidth: 'fit-content', width: 0, borderRightStyle: 'solid' }}
                                                >
                                                    <span className="text-gray-500">{`// Check user input first`}</span>
                                                </motion.div>
                                            </div>

                                            {/* Sequence 2: Content inside Method (check) */}
                                            {/* Timeline: 0.20 -> 0.35 (Type), Hold until 0.95 */}
                                            {/* Sequence 2: Content inside Method (check) */}
                                            {/* Timeline: 0.32 -> 0.46 (Type, 19 chars), Hold until 0.95 */}
                                            <div className="pl-8 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "100%", "100%", "100%", "100%"],
                                                        opacity: [0, 0, 1, 1, 1, 1, 0], // Stay 0 until start, Hold 1 until 0.95, Fade out
                                                        borderRightColor: ["transparent", "transparent", "rgb(96 165 250)", "rgb(96 165 250)", "transparent", "transparent", "transparent"]
                                                    }}
                                                    transition={{
                                                        duration: 12,
                                                        times: [0, 0.319, 0.32, 0.46, 0.461, 0.95, 1],
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap border-r-2 border-blue-400 w-0 inline-block align-bottom min-w-0"
                                                    style={{ maxWidth: 'fit-content', width: 0, borderRightStyle: 'solid' }}
                                                >
                                                    <span className="text-purple-400">this</span>.<span className="text-sky-300">input</span>.<span className="text-yellow-400">check</span>();
                                                </motion.div>
                                            </div>

                                            {/* Sequence 3: More Content (move) */}
                                            {/* Timeline: 0.35 -> 0.50 (Type), Hold until 0.95 */}
                                            {/* Sequence 3: More Content (move) */}
                                            {/* Timeline: 0.46 -> 0.55 (Type, 12 chars), Hold until 0.95 */}
                                            <div className="pl-8 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "100%", "100%", "100%", "100%"],
                                                        opacity: [0, 0, 1, 1, 1, 1, 0], // Stay 0 until start, Hold 1 until 0.95, Fade out
                                                        borderRightColor: ["transparent", "transparent", "rgb(96 165 250)", "rgb(96 165 250)", "transparent", "transparent", "transparent"]
                                                    }}
                                                    transition={{
                                                        duration: 12,
                                                        times: [0, 0.459, 0.46, 0.55, 0.551, 0.95, 1],
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap pr-1 w-0 inline-block align-bottom min-w-0"
                                                    style={{ maxWidth: 'fit-content', width: 0, borderRightStyle: 'solid' }}
                                                >
                                                    <span className="text-purple-400">this</span>.<span className="text-yellow-400">move</span>();
                                                </motion.div>
                                            </div>

                                            {/* Sequence 4: Closing Brace */}
                                            {/* Timeline: 0.50 -> 0.55 (Type), Hold until 0.95 */}
                                            {/* Sequence 4: Closing Brace */}
                                            {/* Timeline: 0.55 -> 0.57 (Type, 1 char), Hold until 0.95 */}
                                            <div className="pl-4 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "100%", "100%", "100%", "100%"],
                                                        opacity: [0, 0, 1, 1, 1, 1, 0], // Stay 0 until start, Hold 1 until 0.95, Fade out
                                                        borderRightColor: ["transparent", "transparent", "rgb(96 165 250)", "rgb(96 165 250)", "transparent", "transparent", "transparent"]
                                                    }}
                                                    transition={{
                                                        duration: 12,
                                                        times: [0, 0.549, 0.55, 0.57, 0.571, 0.95, 1],
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap border-r-2 border-blue-400 w-0 inline-block align-bottom min-w-0"
                                                    style={{ maxWidth: 'fit-content', width: 0, borderRightStyle: 'solid' }}
                                                >
                                                    <span className="text-white">{`}`}</span>
                                                </motion.div>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 1 }}
                                                className="pl-0"
                                            >
                                                <span className="text-white">{`}`}</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>


                        {/* 2. Center Connection: Animated Pulse */}
                        <div className="relative w-full xl:w-[120px] h-20 xl:h-auto flex items-center justify-center -my-4 xl:my-0 z-20">
                            {/* Desktop: Horizontal Line */}
                            <div className="hidden xl:block absolute w-full h-0.5 bg-gray-800 overflow-hidden">
                                <motion.div
                                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            {/* Mobile: Vertical Line */}
                            <div className="xl:hidden absolute h-full w-0.5 bg-gray-800 overflow-hidden">
                                <motion.div
                                    className="h-1/2 w-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"
                                    animate={{ y: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            {/* Central Icon */}
                            <div className="relative w-12 h-12 bg-[#0F1115] border border-blue-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                            </div>
                        </div>


                        {/* 3. Right Window: CodeViewer Graph Preview (Complex & Large) */}
                        <motion.div
                            className="relative w-full max-w-lg xl:w-[600px] h-[450px] bg-[#111] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col"
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: false }}
                        >
                            {/* Window Header (Windows Style) */}
                            <div className="h-8 bg-[#18181b] flex items-center justify-between px-3 border-b border-white/5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 bg-blue-500/20 rounded flex items-center justify-center">
                                        <Activity className="w-2.5 h-2.5 text-blue-400" />
                                    </div>
                                    <span className="text-[11px] text-blue-400 font-bold font-sans">DAy-oN Preview</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-500">
                                    <Minus className="w-3 h-3 hover:text-white cursor-pointer" />
                                    <Square className="w-2.5 h-2.5 hover:text-white cursor-pointer" />
                                    <XIcon className="w-3 h-3 hover:text-red-500 cursor-pointer" />
                                </div>
                            </div>

                            {/* Graph Content */}
                            <div className="relative w-full h-full p-6 overflow-hidden">
                                <div className="absolute inset-0 opacity-20"
                                    style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                                />

                                {/* SVG Edges */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                    <defs>
                                        <marker id="arrowhead-how-gray" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                            <polygon points="0 0, 6 2, 0 4" fill="#52525b" />
                                        </marker>
                                        <marker id="arrowhead-how-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
                                        </marker>
                                        <marker id="arrowhead-how-purple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                            <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
                                        </marker>
                                    </defs>

                                    {/* Player -> health (Static Field) */}
                                    <path d="M 230 110 L 260 110 L 260 80 L 290 80"
                                        stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-how-gray)" opacity="0.5" />

                                    {/* Player -> update (Synced with Method Def) */}
                                    {/* Appears after typing header (approx 15% of cycle), Hold until 0.95 */}
                                    <motion.path
                                        d="M 230 110 L 260 110 L 260 220 L 290 220"
                                        stroke="#52525b" strokeWidth="2" fill="none"
                                        animate={{
                                            opacity: [0, 0, 1, 1, 0],
                                            pathLength: [0, 0, 1, 1, 1]
                                        }}
                                        transition={{
                                            duration: 12,
                                            times: [0, 0.15, 0.20, 0.95, 1],
                                            repeat: Infinity
                                        }}
                                    />
                                    {/* Arrowhead for update (Synced) */}
                                    <motion.polygon
                                        points="280,216 292,220 280,224"
                                        fill="#52525b"
                                        animate={{
                                            opacity: [0, 0, 1, 1, 0]
                                        }}
                                        transition={{
                                            duration: 12,
                                            times: [0, 0.199, 0.20, 0.95, 1], // Appear EXACTLY when line connects (0.20)
                                            repeat: Infinity
                                        }}
                                    />
                                </svg>

                                {/* --- Nodes --- */}

                                {/* 1. Player (Components) - Static */}
                                <div className="absolute top-[80px] left-[70px] w-40 rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg z-10">
                                    <div className="flex items-center p-2.5 gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Box className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-gray-200 leading-none truncate">Player</span>
                                            <span className="text-[10px] text-gray-500 mt-1">Class</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. health (Method) - Static */}
                                <div className="absolute top-[50px] left-[290px] w-40 rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg z-10 opacity-80">
                                    <div className="flex items-center p-2.5 gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                            <GitBranch className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-gray-200 leading-none truncate">health</span>
                                            <span className="text-[9px] text-gray-500 mt-1">Method</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. update (Method) - Appears after Loop Start */}
                                {/* Timeline: 0.15 Fade In, Hold until 0.95 */}
                                <motion.div
                                    className="absolute top-[190px] left-[290px] w-40 rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg z-10"
                                    animate={{
                                        opacity: [0, 0, 1, 1, 0],
                                        scale: [0.8, 0.8, 1, 1, 0.8]
                                    }}
                                    transition={{
                                        duration: 12,
                                        times: [0, 0.15, 0.20, 0.95, 1],
                                        repeat: Infinity
                                    }}
                                >
                                    <div className="flex items-center p-2.5 gap-3 relative">
                                        {/* Click Trigger Area (Icon) */}
                                        <div className="relative">
                                            <motion.div
                                                className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden relative z-20"
                                                animate={{
                                                    scale: [1, 1, 0.9, 1.1, 1, 1],
                                                    backgroundColor: ["rgba(168, 85, 247, 0.1)", "rgba(168, 85, 247, 0.1)", "rgba(168, 85, 247, 0.3)", "rgba(168, 85, 247, 0.1)", "rgba(168, 85, 247, 0.1)"]
                                                }}
                                                transition={{
                                                    duration: 12,
                                                    times: [0, 0.55, 0.56, 0.58, 0.6, 1],
                                                    repeat: Infinity
                                                }}
                                            >
                                                <GitBranch className="w-5 h-5 text-purple-400" />
                                            </motion.div>

                                            {/* Click Ripple Effect */}
                                            <motion.div
                                                className="absolute inset-0 rounded-lg bg-purple-500/50 z-10"
                                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                                transition={{
                                                    duration: 12,
                                                    times: [0.56, 0.65],
                                                    repeat: Infinity,
                                                    ease: "easeOut"
                                                }} // Only animate during the click phase
                                                style={{ opacity: 0 }} // Hidden by default
                                            />
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-gray-200 leading-none truncate">update</span>
                                            <span className="text-[10px] text-gray-500 mt-1">Method</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 4. CODE VIEWER POPUP (The "Code Content" Card) */}
                                {/* Appears after click (approx 60% of cycle), Hold until 0.95 */}
                                <motion.div
                                    className="absolute top-[140px] left-[180px] w-[320px] bg-[#1e1e1e]/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-50 overflow-hidden flex flex-col"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{
                                        opacity: [0, 0, 1, 1, 0],
                                        scale: [0.9, 0.9, 1, 1, 0.9],
                                        y: [10, 10, 0, 0, 10]
                                    }}
                                    transition={{
                                        duration: 12,
                                        times: [0, 0.60, 0.65, 0.95, 1], // Appear 0.60, Hold 0.95, Reset
                                        repeat: Infinity,
                                        ease: "easeOut"
                                    }}
                                >
                                    {/* Header */}
                                    <div className="h-8 bg-[#252526] flex items-center justify-between px-3 border-b border-white/10 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <span className="text-xs font-mono text-gray-300 font-bold">update</span>
                                        </div>
                                        <XIcon className="w-3 h-3 text-white/30" />
                                    </div>

                                    {/* Code Content Container */}
                                    <div className="relative p-4 font-mono text-[10px] sm:text-xs leading-relaxed text-gray-300 bg-[#1e1e2e]">
                                        {/* Line Numbers Column */}
                                        <div className="absolute left-3 top-4 bottom-4 w-6 text-right flex flex-col gap-3 text-white/20 select-none border-r border-white/5 pr-2">
                                            <span>118</span>
                                            <span>119</span>
                                            <span>121</span>
                                            <span>123</span>
                                            <span>124</span>
                                        </div>

                                        {/* Code Blocks Area */}
                                        <div className="pl-8 relative z-10 flex flex-col gap-3">

                                            {/* Block 1: Method Definition (Green) */}
                                            <div className="relative group">
                                                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded px-2 py-1 w-fit shadow-[0_2px_10px_rgba(34,197,94,0.1)]">
                                                    <Play className="w-3 h-3 text-green-400 fill-green-400" />
                                                    <span className="text-green-400 font-bold">public update():</span>
                                                </div>

                                                {/* Vertical Indentation Guide */}
                                                <div className="absolute left-[14px] top-full h-[120px] w-px bg-gradient-to-b from-green-500/30 to-transparent" />
                                            </div>

                                            {/* Indented Content */}
                                            <div className="pl-6 flex flex-col gap-3">
                                                {/* Comment */}
                                                <div className="text-gray-500 italic pl-1">
                                                    # Check user input first
                                                </div>

                                                {/* Block 2: Statement (Purple) */}
                                                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded px-2 py-1 w-fit shadow-[0_2px_10px_rgba(168,85,247,0.1)]">
                                                    <Activity className="w-3 h-3 text-purple-400" />
                                                    <span className="text-purple-300">this.input.check()</span>
                                                </div>

                                                {/* Block 3: Statement (Blue) */}
                                                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1 w-fit shadow-[0_2px_10px_rgba(59,130,246,0.1)]">
                                                    <GitBranch className="w-3 h-3 text-blue-400" />
                                                    <span className="text-blue-300">this.move()</span>
                                                </div>
                                            </div>

                                            {/* Closing Brace */}
                                            <div className="text-green-500/50 pl-1 -mt-1 font-bold">
                                                {`}`}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* Steps Description Text */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + (index * 0.2) }}
                            className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-center mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <step.icon className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div >
        </section >
    );
}
