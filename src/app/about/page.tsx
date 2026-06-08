"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white/30 pt-24 pb-12">
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-xl font-bold tracking-tight text-white">GenFolio</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/builder" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Our Mission</h1>
          <p className="text-xl text-white/60 leading-relaxed">
            At GenFolio, we believe everyone deserves a stunning online presence without the hassle of learning how to code or struggling with complex website builders. Our mission is to democratize professional portfolio creation using the power of AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">The Problem</h2>
            <p className="text-zinc-400 leading-relaxed">
              For years, building a personal portfolio meant choosing between restrictive templates that look like everyone else's, or spending countless hours learning web development. Professionals were spending more time formatting their work than actually showcasing it.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Our Solution</h2>
            <p className="text-zinc-400 leading-relaxed">
              We built GenFolio to be the bridge between custom development and ease of use. By combining a flexible block-based builder with advanced AI generation, we enable users to create deeply personalized, high-performance portfolios in minutes.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to build your story?</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already upgraded their online presence with GenFolio.
          </p>
          <Link href="/builder" className="inline-flex items-center justify-center h-12 px-8 font-medium bg-white text-black rounded-full hover:bg-white/90 transition-colors">
            Start Building for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
