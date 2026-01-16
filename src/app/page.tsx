import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import TechSpecs from "@/components/TechSpecs";
import Footer from "@/components/Footer";
import WhyDaon from "@/components/WhyDaon";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyDaon />
      <Features />
      <TechSpecs />
      <Footer />
    </main>
  );
}
