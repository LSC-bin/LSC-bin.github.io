"use client";

import { motion } from "framer-motion";
import { Box, Share2, Shield, Cpu, Code2, Globe, FileCode, GitBranch, Lock, Search, Settings, Activity, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Graph Data
const nodes = [
    { id: 'visual-synth', label: 'VisualSynthesizer', type: 'Class', x: 25, y: 70, icon: Box, color: 'blue' },
    { id: 'system-mod', label: 'SystemModule', type: 'Method', x: 75, y: 20, icon: Settings, color: 'purple' },
    { id: 'audio-core', label: 'AudioCore', type: 'Class', x: 25, y: 25, icon: Box, color: 'blue' },
    { id: 'start', label: 'start', type: 'Method', x: 75, y: 55, icon: Settings, color: 'purple' },
    { id: 'add-effect', label: 'add_effect', type: 'Method', x: 75, y: 85, icon: Settings, color: 'purple' },
];

const edges = [
    { from: 'audio-core', to: 'system-mod', label: 'imports', type: 'import' },
    { from: 'visual-synth', to: 'start', label: 'calls', type: 'call' },
    { from: 'visual-synth', to: 'add-effect', label: 'calls', type: 'call' },
];

export default function Features() {
    const [focusedNode, setFocusedNode] = useState<string | null>(null);

    const isNodeDimmed = (nodeId: string) => {
        if (!focusedNode) return false;
        if (nodeId === focusedNode) return false;
        // Check if connected
        const isConnected = edges.some(e =>
            (e.from === focusedNode && e.to === nodeId) ||
            (e.from === nodeId && e.to === focusedNode)
        );
        return !isConnected;
    };

    const isEdgeDimmed = (edge: any) => {
        if (!focusedNode) return false;
        return edge.from !== focusedNode && edge.to !== focusedNode;
    };

    const handleNodeClick = (nodeId: string) => {
        if (focusedNode === nodeId) {
            setFocusedNode(null);
        } else {
            setFocusedNode(nodeId);
        }
    };

    return (
        <section className="py-24 relative z-10 overflow-hidden">
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
                                {/* Nodes Container - Centered */}
                                <div className="relative w-full max-w-lg h-full flex items-center px-8 mx-auto">

                                    {/* Node 1: Enemy (Class) */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: false }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="relative w-44 shrink-0 rounded-xl border border-blue-500/50 bg-[#1e1e1e] shadow-lg group/node hover:scale-105 transition-transform duration-300 z-10"
                                    >
                                        <div className="flex items-center p-3 gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200 leading-none truncate">Enemy</span>
                                                <span className="text-[10px] font-bold text-gray-500 mt-1">Class</span>
                                            </div>
                                        </div>
                                        {/* Port */}
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-[#3f3f46] border border-black rounded-full z-20" />
                                    </motion.div>

                                    {/* Spacer with Edge */}
                                    <div className="flex-1 relative h-20 flex items-center">
                                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                                            <defs>
                                                <marker id="arrowhead-feature-gray" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                                    <polygon points="0 0, 6 2, 0 4" fill="#52525b" />
                                                </marker>
                                            </defs>
                                            <motion.line
                                                x1="0" y1="50%"
                                                y2="50%"
                                                initial={{ x2: "0%", opacity: 0 }}
                                                whileInView={{ x2: "100%", opacity: 1 }}
                                                stroke="#52525b"
                                                strokeWidth="2"
                                                markerEnd="url(#arrowhead-feature-gray)"
                                                viewport={{ once: false }}
                                                transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
                                            />
                                        </svg>
                                    </div>

                                    {/* Node 2: attack (Method) */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: false }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="relative w-44 shrink-0 rounded-xl border border-purple-500/50 bg-[#1e1e1e] shadow-lg group/node hover:scale-105 transition-transform duration-300 delay-100 z-10"
                                    >
                                        <div className="flex items-center p-3 gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <GitBranch className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200 leading-none truncate">attack</span>
                                                <span className="text-[10px] font-bold text-gray-500 mt-1">Method</span>
                                            </div>
                                        </div>
                                        {/* Port */}
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-[#3f3f46] border border-black rounded-full z-20" />
                                    </motion.div>

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
                            <div className="absolute inset-0 bg-[#0F1115]"
                                onClick={() => setFocusedNode(null)}
                            >
                                {/* Dot Grid Background */}
                                <div className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />

                                {/* Edges Layer */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <marker id="arrowhead-gray" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                            <polygon points="0 0, 6 2, 0 4" fill="#52525b" />
                                        </marker>
                                    </defs>
                                    {edges.map((edge, i) => {
                                        const fromNode = nodes.find(n => n.id === edge.from)!;
                                        const toNode = nodes.find(n => n.id === edge.to)!;
                                        const isDimmed = isEdgeDimmed(edge);

                                        // Orthogonal Path Calculation (Step Connector)
                                        // Connect Right Port (x + offset) to Left Port (x - offset)
                                        const NODE_WIDTH_PERCENT = 12; // Approx half width of node in %
                                        const x1 = fromNode.x + NODE_WIDTH_PERCENT;
                                        const y1 = fromNode.y;
                                        const x2 = toNode.x - NODE_WIDTH_PERCENT;
                                        const y2 = toNode.y;
                                        const midX = (x1 + x2) / 2;

                                        // Path: Start -> Horizontal to Mid -> Vertical to Target Y -> Horizontal to Target
                                        const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

                                        return (
                                            <motion.g key={i} animate={{ opacity: isDimmed ? 0.1 : 1 }}>
                                                <path
                                                    d={d}
                                                    fill="none"
                                                    stroke="#52525b"
                                                    strokeWidth="0.5"
                                                    vectorEffect="non-scaling-stroke"
                                                    markerEnd="url(#arrowhead-gray)"
                                                />
                                            </motion.g>
                                        );
                                    })}
                                </svg>

                                {/* Nodes Layer */}
                                {nodes.map((node) => {
                                    const isDimmed = isNodeDimmed(node.id);
                                    const isFocused = focusedNode === node.id;
                                    const Icon = node.icon;

                                    return (
                                        <motion.div
                                            key={node.id}
                                            className={`absolute p-0.5 rounded-xl cursor-pointer transition-all duration-300
                                                ${isFocused ? 'z-20 scale-100' : 'z-10 hover:scale-100 active:scale-95'}
                                            `}
                                            style={{
                                                left: `${node.x}%`,
                                                top: `${node.y}%`,
                                                translate: '-50% -50%',
                                            }}
                                            animate={{
                                                opacity: isDimmed ? 0.2 : 1,
                                                filter: isDimmed ? 'grayscale(100%)' : 'none'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNodeClick(node.id);
                                            }}
                                        >
                                            <div className={`
                                                relative w-40 flex items-center p-3 gap-3 rounded-lg border bg-[#1E1E1E] shadow-xl
                                                ${node.color === 'blue' ? 'border-blue-500/50' : 'border-purple-500/50'}
                                            `}>
                                                <div className={`h-8 w-8 rounded flex items-center justify-center
                                                    ${node.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}
                                                `}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-200">{node.label}</span>
                                                    <span className="text-[10px] text-gray-500">{node.type}</span>
                                                </div>
                                                {/* Ports */}
                                                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 rounded-full bg-gray-500" />
                                                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rounded-full bg-gray-500" />
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Hint Overlay */}

                            </div>
                        </div>
                        {/* Hint Text Outside */}
                        {!focusedNode && (
                            <div className="mt-4 text-center text-xs text-gray-500 animate-pulse">
                                Click a node to Focus
                            </div>
                        )}
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
        </section >
    );
}
