"use client";

import { useEffect, useRef, useState } from "react";
import FloatingDecor from "../components/landing/FloatingDecor";
import Navbar from "../components/landing/NavBar";
import Hero from "../components/landing/Hero";
import ScrollToTopButton from "../components/landing/ScrollToTopButton";
import CategoryHighlights from "../components/landing/CategoryHighlights";
import FeaturedRestaurants from "../components/landing/FeaturedRestaurants";
import HowItWorks from "../components/landing/HowItWorks";
import AppFeatures from "../components/landing/AppFeatures";
import CTASection from "../components/landing/CTASection";

export default function Home() {
  const [showTop, setShowTop] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const restaurantsRef = useRef<HTMLDivElement | null>(null);
  const howItWorksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handle = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    const h = 60;
    const top = (ref.current?.getBoundingClientRect().top || 0) + window.scrollY - h;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      <FloatingDecor />
      <Navbar
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onCategories={() => scrollTo(categoriesRef)}
        onRestaurants={() => scrollTo(restaurantsRef)}
        onHowItWorks={() => scrollTo(howItWorksRef)}
      />

      <div className="pt-24">
        <Hero />
        <div ref={categoriesRef}><CategoryHighlights /></div>
        <div ref={restaurantsRef}><FeaturedRestaurants /></div>
        <div ref={howItWorksRef}><HowItWorks /></div>
        <AppFeatures />
        <CTASection />
      </div>

      <ScrollToTopButton visible={showTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
}
