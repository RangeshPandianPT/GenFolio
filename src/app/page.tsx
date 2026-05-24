"use client";

import { motion } from "framer-motion";
import { ArrowRight, Layout, Sparkles, Zap, FileText, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary/30">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="text-xl font-bold tracking-tight">GenFolio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mt-12 md:mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Portfolio Builder</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl text-balance"
            >
              Build your stunning portfolio in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">seconds.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance"
            >
              Upload your resume, and our AI will generate a beautiful, fully customizable portfolio website instantly. No coding required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/builder" className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-all hover:scale-105">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-secondary/80 transition-all">
                View Examples
              </Link>
            </motion.div>
          </div>

          {/* Features Section */}
          <div id="features" className="mt-32 md:mt-48">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Layout,
                  title: "Drag & Drop Builder",
                  description: "Customize every section with an intuitive interface. No technical skills needed.",
                },
                {
                  icon: Zap,
                  title: "AI Bio Generation",
                  description: "Let our AI write professional, engaging copy based on your experience.",
                },
                {
                  icon: Globe,
                  title: "Instant Deployment",
                  description: "Publish to a custom subdomain instantly. Share your work with the world.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-panel p-8 rounded-2xl flex flex-col items-start hover:-translate-y-1 transition-transform"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
