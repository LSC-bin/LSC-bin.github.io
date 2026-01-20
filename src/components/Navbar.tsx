"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Changed from 'next/link' just to be explicitly safe.

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
                        <Image
                            src="/daon-logo.png"
                            alt="DAy-oN Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <span>DAy-oN</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
                    <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
                </div>

                <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                    <Download className="w-4 h-4" />
                    <span>Get App</span>
                </button>
            </div>
        </motion.nav>
    );
}
