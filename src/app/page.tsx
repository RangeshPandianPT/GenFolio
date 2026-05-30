"use client";

import Link from "next/link";
import { Component as HorizonHeroSection } from "@/components/ui/horizon-hero-section";

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full relative selection:bg-white/30">
      {/* Navbar overlay */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold">
              G
            </div>
            <span className="text-xl font-bold tracking-tight text-white">GenFolio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section handles its own fullscreen layout, canvas, and scrolling sections */}
      <HorizonHeroSection />
      
    </div>
  );
}
