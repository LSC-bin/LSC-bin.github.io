"use client";

import { motion } from "framer-motion";
import { Download, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Changed from 'next/link' just to be explicitly safe.

import { useRouter } from "next/navigation";
import { useLatestRelease } from "@/hooks/useLatestRelease";

export default function Navbar() {
    const router = useRouter();
    const downloadUrl = useLatestRelease();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white transition-opacity hover:opacity-80">
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
                </a>



                <div className="flex items-center gap-6">
                    <Link
                        href="/reviews"
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Reviews
                    </Link>
                    <a
                        href="https://github.com/LSC-bin/LSC-bin.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={downloadUrl.windows}
                        onClick={() => router.push('/reviews')}
                        className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-[0_4px_12px_-3px_rgba(37,99,235,0.4)] cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Windows</span>
                    </a>
                    <a
                        href={downloadUrl.mac}
                        onClick={() => router.push('/reviews')}
                        className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>macOS</span>
                    </a>
                </div>
            </div>
        </motion.nav>
    );
}
