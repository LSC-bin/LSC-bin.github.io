"use client";

import { motion } from "framer-motion";
import { Headphones, Terminal, GraduationCap, ArrowRight, Zap, Eye, Bug } from "lucide-react";

const advantages = [
    {
        id: "vibe-coders",
        icon: Headphones,
        title: "For Vibe Coders",
        subtitle: "Coding is not just logic, it's a flow.",
        description: "Escape the boredom of reading endless lines of text. Visualize the rhythm of your data and ride the wave of your logic using our immersive interactive map.",
        features: ["Visual Flow", "Intuitive Navigation", "Immersive Experience"],
        color: "blue"
    },
    {
        id: "developers",
        icon: Terminal,
        title: "For Developers",
        subtitle: "Stop fearing legacy code.",
        description: "Instantly grasp the structure of massive projects or spaghetti code. Debug dependency hell by seeing exactly where functions are called and what classes are inherited.",
        features: ["Rapid Structure Analysis", "Dependency Visualization", "Debug Faster"],
        color: "purple"
    },
    {
        id: "students",
        icon: GraduationCap,
        title: "For Students",
        subtitle: "See OOP concepts come to life.",
        description: "Don't just memorize 'classes' and 'inheritance'. See how they actually connect in a big picture. Develop the structural thinking skills that senior engineers possess.",
        features: ["Visual OOP Learning", "Big Picture Thinking", "Understanding Relations"],
        color: "green"
    }
];

export default function WhyDaon() {
    return (
        <section className="py-32 relative z-10 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Why <span className="text-blue-500">DAoN</span>?
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Whether you are a veteran engineer or just starting out, we offer a new perspective on code.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {advantages.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative group"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-b from-${item.color}-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative h-full bg-[#0F1115] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors flex flex-col">
                                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6`}>
                                    <item.icon className={`w-7 h-7 text-${item.color}-400`} />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                <p className={`text-${item.color}-400 font-medium mb-6 text-sm`}>
                                    "{item.subtitle}"
                                </p>

                                <p className="text-gray-400 leading-relaxed mb-8 flex-1">
                                    {item.description}
                                </p>

                                <ul className="space-y-3 pt-6 border-t border-white/5">
                                    {item.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500`} />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
