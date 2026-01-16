"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const specs = [
    { label: "Architecture", value: "Electron + Next.js Hybrid" },
    { label: "Rendering Engine", value: "Three.js / WebGL" },
    { label: "Parser", value: "Tree-sitter (WASM)" },
    { label: "Max File Count", value: "10,000+ Files" },
    { label: "Security", value: "Local Sandboxed Environment" },
    { label: "License", value: "MIT / Commercial" },
];

export default function TechSpecs() {
    return (
        <section className="py-24 relative z-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                                Built for <br />
                                <span className="text-blue-500">Performance</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                We didn't just wrap a website. DAy-oN is a native-feeling application optimized for handling massive codebases without breaking a sweat.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Multi-threaded Parsing Workers",
                                    "GPU-Accelerated Graph Rendering",
                                    "Zero Latency File Watching",
                                    "Native OS Integration"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    <div className="relative">
                        {/* Tech Spec Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
                        >
                            {/* Decorative Grid */}
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <div className="w-32 h-32 border-r border-t border-blue-500/50 rounded-tr-3xl" />
                            </div>

                            <h3 className="text-xl font-mono text-blue-400 mb-8 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                SYSTEM_SPECIFICATIONS
                            </h3>

                            <div className="space-y-6 font-mono text-sm">
                                {specs.map((spec, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-500">{spec.label}</span>
                                        <span className="text-gray-200">{spec.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                                    <div>STATUS: ONLINE</div>
                                    <div className="flex-1 h-px bg-white/10" />
                                    <div>VER: 1.2.0</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
