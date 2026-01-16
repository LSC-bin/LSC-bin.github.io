export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-gray-600 text-sm">
                    © {new Date().getFullYear()} DAy-oN. Crafted for developers.
                </div>
                <div className="flex items-center gap-8 text-gray-500 text-sm font-medium">
                    <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">GitHub</a>
                </div>
            </div>
        </footer>
    );
}
