"use client";

import Giscus from "@giscus/react";
import { motion } from "framer-motion";
import { MessageSquare, Star } from "lucide-react";

export default function Reviews() {
    return (
        <section id="reviews" className="py-24 relative z-10 bg-[#050505] overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6"
                >
                    <MessageSquare className="w-3 h-3" />
                    <span>Community Feedback</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-5xl font-bold mb-6 text-white"
                >
                    Detailed <span className="text-blue-500">Reviews & Discussion</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 max-w-2xl mx-auto text-lg"
                >
                    Share your thoughts, report bugs, or request features.
                    <br />
                    Your feedback shapes the future of DAy-oN.
                </motion.p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative"
                >
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-xl opacity-20 -z-10" />

                    <Giscus
                        id="comments"
                        repo="LSC-bin/LSC-bin.github.io"
                        repoId="R_kgDOQSiLMg"
                        category="General"
                        categoryId="DIC_kwDOQSiLMs4C1sMF"
                        mapping="pathname"
                        term="Welcome to DAy-oN Reviews"
                        reactionsEnabled="1"
                        emitMetadata="0"
                        inputPosition="top"
                        theme="dark_dimmed"
                        lang="en"
                        loading="lazy"
                    />
                </motion.div>
            </div>
        </section>
    );
}
