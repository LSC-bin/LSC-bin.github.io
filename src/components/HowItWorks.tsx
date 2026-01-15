"use client";

import { motion } from "framer-motion";
import { Terminal, Zap, Activity, FileCode, Box, GitBranch, Layers, Search, Command, Minus, Square, X as XIcon } from "lucide-react";

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
        description: "Watch your 3D map evolve as you type. The visualization updates in real-time to reflect your latest architecture changes."
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
                            viewport={{ once: true }}
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
                                            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div>
                                        </div>

                                        {/* Code Content */}
                                        <div className="pl-8 text-gray-300">
                                            <div><span className="text-blue-400">class</span> <span className="text-yellow-400">Player</span> <span className="text-white">{`{`}</span></div>
                                            <div className="pl-4"><span className="text-blue-400">private</span> <span className="text-sky-300">health</span>: <span className="text-green-400">number</span>;</div>
                                            <div className="pl-4"><span className="text-blue-400">private</span> <span className="text-sky-300">input</span>: <span className="text-yellow-400">InputHandler</span>;</div>

                                            {/* Sequence 1: Method Definition (Loop) */}
                                            <div className="pl-4 h-6 flex items-center">
                                                <motion.div
                                                    animate={{ width: ["0%", "100%", "100%", "0%"] }}
                                                    transition={{ duration: 8, times: [0.05, 0.2, 0.9, 0.95], repeat: Infinity, ease: "linear" }}
                                                    className="overflow-hidden whitespace-nowrap inline-block text-left"
                                                    style={{ maxWidth: 'fit-content', width: 0 }}
                                                >
                                                    <span className="text-blue-400">public</span> <span className="text-yellow-400">update</span>() <span className="text-white">{`{`}</span>
                                                </motion.div>
                                            </div>

                                            <motion.div
                                                animate={{ opacity: [0, 1, 1, 0] }}
                                                transition={{ duration: 8, times: [0.2, 0.25, 0.9, 0.95], repeat: Infinity }}
                                                className="pl-8 text-gray-500"
                                            >
                                                {`// Check user input first`}
                                            </motion.div>

                                            {/* Sequence 2: Content inside Method (check) */}
                                            <div className="pl-8 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "5.26%", "5.26%", "10.53%", "10.53%", "15.79%", "15.79%", "21.05%", "21.05%", "26.32%", "26.32%", "31.58%", "31.58%", "36.84%", "36.84%", "42.11%", "42.11%", "47.37%", "47.37%", "52.63%", "52.63%", "57.89%", "57.89%", "63.16%", "63.16%", "68.42%", "68.42%", "73.68%", "73.68%", "78.95%", "78.95%", "84.21%", "84.21%", "89.47%", "89.47%", "94.74%", "94.74%", "100.00%", "100.00%", "0%"],
                                                        opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                                                        borderRightColor: Array(40).fill("rgb(96 165 250)").map((c, i) => (i < 2 || i > 39) ? "transparent" : c).concat(["transparent", "transparent"])
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        times: [0, 0.249, 0.257, 0.258, 0.265, 0.266, 0.273, 0.274, 0.281, 0.282, 0.289, 0.290, 0.297, 0.298, 0.305, 0.306, 0.312, 0.313, 0.320, 0.321, 0.328, 0.329, 0.336, 0.337, 0.344, 0.345, 0.352, 0.353, 0.360, 0.361, 0.368, 0.369, 0.375, 0.376, 0.383, 0.384, 0.391, 0.392, 0.399, 0.400, 0.9, 0.95],
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
                                            <div className="pl-8 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "9.09%", "9.09%", "18.18%", "18.18%", "27.27%", "27.27%", "36.36%", "36.36%", "45.45%", "45.45%", "54.55%", "54.55%", "63.64%", "63.64%", "72.73%", "72.73%", "81.82%", "81.82%", "90.91%", "90.91%", "100.00%", "100.00%", "0%"],
                                                        opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                                                        borderRightColor: Array(24).fill("rgb(96 165 250)").map((c, i) => (i < 2 || i > 23) ? "transparent" : c).concat(["transparent", "transparent"])
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        times: [0, 0.449, 0.463, 0.464, 0.477, 0.478, 0.490, 0.491, 0.504, 0.505, 0.518, 0.519, 0.531, 0.532, 0.545, 0.546, 0.559, 0.560, 0.572, 0.573, 0.586, 0.587, 0.600, 0.601, 0.9, 0.95],
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
                                            {/* Sequence 4: Closing Brace */}
                                            <div className="pl-4 flex items-center h-6">
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0, borderRightWidth: "2px", borderColor: "transparent" }}
                                                    animate={{
                                                        width: ["0%", "0%", "0%", "100.00%", "100.00%", "0%"],
                                                        opacity: [0, 0, 1, 1, 1, 0],
                                                        borderRightColor: ["transparent", "transparent", "rgb(96 165 250)", "rgb(96 165 250)", "rgb(96 165 250)", "transparent"]
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        times: [0, 0.699, 0.700, 0.720, 0.9, 0.95],
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
                            viewport={{ once: true }}
                        >
                            {/* Window Header (Windows Style) */}
                            <div className="h-8 bg-[#18181b] flex items-center justify-between px-3 border-b border-white/5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 bg-blue-500/20 rounded flex items-center justify-center">
                                        <Activity className="w-2.5 h-2.5 text-blue-400" />
                                    </div>
                                    <span className="text-[11px] text-blue-400 font-bold font-sans">DAoN Preview</span>
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

                                    {/* Player -> update (Synced with Method Def) - Loop */}
                                    <motion.path
                                        d="M 230 110 L 260 110 L 260 220 L 290 220"
                                        stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-how-gray)"
                                        animate={{ opacity: [0, 1, 1, 0], pathLength: [0, 1, 1, 1] }}
                                        transition={{ duration: 8, times: [0.05, 0.2, 0.9, 0.95], repeat: Infinity }}
                                    />

                                    {/* update -> check_input (Synced with Content) - Loop (REMOVED) */}
                                    {/* update -> move (Synced with Content) - NEW Loop (REMOVED) */}
                                </svg>

                                {/* --- Nodes --- */}
                                {/* Centered vertically in 450px height */}

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

                                {/* 2. health (Field) - Static */}
                                <div className="absolute top-[50px] left-[290px] w-40 rounded-xl border border-gray-500/50 bg-[#1e1e1e] shadow-lg z-10 opacity-80">
                                    <div className="flex items-center p-2.5 gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                                            <Box className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-gray-200 leading-none truncate">health</span>
                                            <span className="text-[9px] text-gray-500 mt-1">Field</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. update (Method) - Loop */}
                                <motion.div
                                    className="absolute top-[190px] left-[290px] w-40 rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg z-10"
                                    animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
                                    transition={{ duration: 8, times: [0.05, 0.2, 0.9, 0.95], repeat: Infinity }}
                                >
                                    <div className="flex items-center p-2.5 gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                            <GitBranch className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-gray-200 leading-none truncate">update</span>
                                            <span className="text-[10px] text-gray-500 mt-1">Method</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 4. check_input (Method) - Loop (REMOVED) */}
                                {/* 5. move (Method) - NEW Loop (REMOVED) */}

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
