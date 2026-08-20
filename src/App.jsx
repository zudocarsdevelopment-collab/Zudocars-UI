import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import CarsPage from "./components/Carspage";
import ContactPage from "./components/Contactpage";
import About from "./components/About";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import OnamPreloader from "./components/OnamPreloader"; // Import preloader component

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash, pathname]);

  return null;
}

function App() {
  const [showPreloader, setShowPreloader] = useState(() => {
    // Check if the user has already seen the preloader during this browser session
    return !sessionStorage.getItem("onam_preloader_seen");
  });

  const handlePreloaderComplete = () => {
    // Mark as seen so it won't trigger again on page refreshes or route changes
    sessionStorage.setItem("onam_preloader_seen", "true");
    setShowPreloader(false);
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      {/* 1. Onam Preloader Overlay */}
      {showPreloader && <OnamPreloader onComplete={handlePreloaderComplete} />}

      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();

  if (pathname === "/login") {
    return <Login />;
  }

  if (pathname === "/dashboard") {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_45%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)]">
      <Navbar />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
