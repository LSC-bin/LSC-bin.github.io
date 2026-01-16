"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link"; // Changed from 'next/link' just to be explicitly safe.

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-20 rotate-3"></div>
                        <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-20 -rotate-3"></div>
                        <div className="relative w-full h-full bg-gradient-to-tr from-blue-600 to-blue-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-mono text-lg">D</span>
                        </div>
                    </div>
                    <span>DAy-oN</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="#" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#" className="hover:text-white transition-colors">Docs</Link>
                    <Link href="#" className="hover:text-white transition-colors">Changelog</Link>
                </div>

                <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                    <Download className="w-4 h-4" />
                    <span>Get App</span>
                </button>
            </div>
        </motion.nav>
    );
}
