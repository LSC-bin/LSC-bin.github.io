import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Documentation
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl">
          Detailed documentation and guides are currently being written. 
          Stay tuned for updates!
        </p>
        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all text-sm font-medium">
          Notify me when ready
        </button>
      </div>
      <Footer />
    </main>
  );
}
