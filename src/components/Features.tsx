"use client";

import { motion } from "framer-motion";
import { Box, Share2, Shield, Cpu, Code2, Globe, FileCode, GitBranch, Lock, Search } from "lucide-react";
import Image from "next/image";

export default function Features() {
    return (
        <section className="py-20 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Feature 1: Interactive Code Graph (Text Left - Visual Right) */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <div className="flex-1 text-left">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                            <GitBranch className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white">Interactive Code Graph</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Visualize relationships, inheritance, and call stacks as a dynamic graph.
                            We turn spaghetti code into a neatly organized, navigable tree structure.
                            Navigate through your project's architecture with eagle-eye precision.
                        </p>
                        <a href="#" className="inline-flex items-center text-blue-400 font-semibold hover:text-blue-300 transition-colors group">
                            Explore Graph View
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="relative aspect-video rounded-xl bg-[#0F1115] border border-white/10 overflow-hidden shadow-2xl group">
                            <div className="absolute inset-0 bg-[#111]">
                                {/* Dot Grid */}
                                <div className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />

                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    {/* Edge Layer */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                        <defs>
                                            <marker id="arrowhead-feature" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                                <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
                                            </marker>
                                        </defs>
                                        {/* Enemy (Right Port) -> attack (Left Port) */}
                                        {/* Approx Positions: Enemy Right ~ 200, attack Left ~ 320 */}
                                        {/* Adjusting coordinates to match the centered layout below */}
                                        <path d="M 190 150 L 320 150"
                                            stroke="#3B82F6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-feature)" />
                                    </svg>

                                    {/* Nodes Container - Centered */}
                                    <div className="relative w-full max-w-lg h-full flex items-center justify-between px-12">

                                        {/* Node 1: Enemy (Class) */}
                                        <div className="relative w-44 rounded-2xl border-2 border-[#3b82f6] bg-white shadow-xl group/node hover:scale-105 transition-transform duration-300 z-10">
                                            <div className="flex items-center p-3 gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0">
                                                    <Box className="w-5 h-5 text-[#3b82f6]" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-gray-900 leading-none truncate">Enemy</span>
                                                    <span className="text-[10px] font-bold text-gray-400 mt-1">Class</span>
                                                </div>
                                            </div>
                                            {/* Port */}
                                            <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-white border-[2.5px] border-gray-400 rounded-full z-20" />
                                        </div>

                                        {/* Node 2: attack (Method) */}
                                        <div className="relative w-44 rounded-2xl border-2 border-[#a855f7] bg-white shadow-xl group/node hover:scale-105 transition-transform duration-300 delay-100 z-10">
                                            <div className="flex items-center p-3 gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-[#faf5ff] flex items-center justify-center shrink-0">
                                                    <GitBranch className="w-5 h-5 text-[#a855f7]" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-gray-900 leading-none truncate">attack</span>
                                                    <span className="text-[10px] font-bold text-gray-400 mt-1">Method</span>
                                                </div>
                                            </div>
                                            {/* Port */}
                                            <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-white border-[2.5px] border-gray-400 rounded-full z-20" />
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Smart Focus & Filter (Visual Left - Text Right) */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-32">
                    <div className="flex-1 text-left">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                            <Search className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white">Smart Focus & Filter</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Double-click to dim irrelevant nodes and highlight only the connected context.
                            Instantly filter by functionality, type, or usage to find exactly what you need without the noise.
                        </p>
                        <a href="#" className="inline-flex items-center text-green-400 font-semibold hover:text-green-300 transition-colors group">
                            See Filtering in Action
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="relative aspect-video rounded-xl bg-[#0F1115] border border-white/10 overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 to-transparent" />
                            {/* Visual Representation of Focus */}
                            <div className="absolute inset-0 flex items-center justify-center gap-4">
                                {/* Dimmed Nodes */}
                                <div className="w-16 h-16 bg-white/5 rounded-lg backdrop-blur-sm opacity-20" />
                                <div className="w-16 h-16 bg-white/5 rounded-lg backdrop-blur-sm opacity-20" />

                                {/* Focused Node */}
                                <div className="w-24 h-24 bg-[#1E1E1E] border-2 border-green-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] z-10 scale-110">
                                    <Search className="w-8 h-8 text-green-500" />
                                </div>

                                {/* Dimmed Nodes */}
                                <div className="w-16 h-16 bg-white/5 rounded-lg backdrop-blur-sm opacity-20" />
                                <div className="w-16 h-16 bg-white/5 rounded-lg backdrop-blur-sm opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 3: Floating Code Cards (Text Left - Visual Right) */}
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-left">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                            <Code2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white">Floating Code Cards</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Click any node to summon a floating code card.
                            Drag, resize, and compare multiple files side-by-side with our infinite canvas.
                            It's like having multiple monitors in a single view.
                        </p>
                        <a href="#" className="inline-flex items-center text-purple-400 font-semibold hover:text-purple-300 transition-colors group">
                            Try Infinite Canvas
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="relative aspect-video rounded-xl bg-[#0F1115] border border-white/10 overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-grid-white/[0.02]" />
                            {/* Floating Cards Mockup */}
                            <div className="absolute inset-0 p-8">
                                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[#1E1E1E] border border-white/10 rounded-lg shadow-xl -rotate-6 z-0" />
                                <div className="absolute top-1/3 left-1/3 w-1/2 h-1/2 bg-[#1E1E1E] border border-purple-500/50 rounded-lg shadow-2xl rotate-3 z-10 flex flex-col p-4">
                                    <div className="h-4 w-1/3 bg-purple-500/20 rounded mb-4" />
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-white/10 rounded" />
                                        <div className="h-2 w-5/6 bg-white/10 rounded" />
                                        <div className="h-2 w-4/6 bg-white/10 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
