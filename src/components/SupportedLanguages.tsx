"use client";

import { motion } from "framer-motion";
import { FileJson, Hash, Globe, Coffee, FileCode, Terminal, Code2 } from "lucide-react";

// Language Data
const languages = [
    { name: "Python", textColor: "text-blue-400", icon: Terminal, bg: "bg-blue-500/10" },
    { name: "Java", textColor: "text-red-400", icon: Coffee, bg: "bg-orange-500/10" },
    { name: "JavaScript", textColor: "text-yellow-400", icon: FileCode, bg: "bg-yellow-500/10" },
    { name: "TypeScript", textColor: "text-blue-500", icon: FileCode, bg: "bg-blue-500/10" },
    { name: "HTML", textColor: "text-orange-500", icon: Globe, bg: "bg-orange-500/10" },
    { name: "C#", textColor: "text-purple-400", icon: Hash, bg: "bg-purple-500/10" },
    { name: "C++", textColor: "text-blue-600", icon: Code2, bg: "bg-blue-600/10" },
    { name: "JSON", textColor: "text-gray-400", icon: FileJson, bg: "bg-gray-500/10" },
    { name: "C", textColor: "text-slate-400", icon: Code2, bg: "bg-slate-500/10" },
];

export default function SupportedLanguages() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-black" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                        Works with your stack
                    </h2>
                    <p className="text-lg text-gray-400">
                        Day-on supports a wide range of languages and file formats out of the box.
                        Just drag and drop your project.
                    </p>
                </div>

                {/* Marquee Container */}
                <div
                    className="relative w-full overflow-hidden py-10"
                >
                    {/* Scrolling Track */}
                    <motion.div
                        className="flex w-fit"
                        animate={{ x: "-33.33%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 20
                        }}
                    >
                        {/* Double the list for seamless loop */}
                        {[...languages, ...languages, ...languages].map((lang, index) => (
                            <div
                                key={`${lang.name}-${index}`}
                                className="flex-shrink-0 mx-4"
                            >
                                <div className={`
                                    w-40 h-32 rounded-2xl border border-white/5 
                                    ${lang.bg}
                                    flex flex-col items-center justify-center gap-4
                                    transition-all duration-300 hover:scale-105 hover:bg-white/5
                                    group
                                    will-change-transform
                                `}>
                                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 group-hover:border-white/20 transition-colors">
                                        <lang.icon className={`w-8 h-8 ${lang.textColor}`} />
                                    </div>
                                    <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">{lang.name}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
