import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CarCategories from './components/CarCategories';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials';
import FeaturedCars from './components/FeaturedCars';
function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_45%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)]">
      <Navbar />
      <HeroSection />
      <CarCategories />
      <FeaturedCars />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
