import Navbar from "@/components/Navbar";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export default function ReviewsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Navbar />
            <div className="pt-20">
                <Reviews />
            </div>
            <Footer />
        </main>
    );
}
