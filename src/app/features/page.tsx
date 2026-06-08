"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Layout, Zap, Smartphone, Code, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeaturesPage() {
  const features = [
    {
      title: "AI-Powered Generation",
      description: "Generate beautiful, engaging bio text and descriptions instantly with our advanced AI.",
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Drag & Drop Builder",
      description: "Easily rearrange sections and build your portfolio with a simple drag-and-drop interface.",
      icon: <Layout className="w-8 h-8 text-indigo-500" />,
    },
    {
      title: "Lightning Fast",
      description: "Portfolios built with GenFolio are optimized for speed and SEO out of the box.",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Mobile Responsive",
      description: "Your portfolio will look perfect on every device, from massive desktop monitors to mobile phones.",
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Export to Code",
      description: "Download your portfolio as a raw Next.js/React project to host it anywhere you want.",
      icon: <Code className="w-8 h-8 text-red-500" />,
    },
    {
      title: "Media Integrations",
      description: "Seamlessly embed Spotify, Twitter, images, and other media directly into your blocks.",
      icon: <ImageIcon className="w-8 h-8 text-pink-500" />,
    },
  ];

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
            <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/builder" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need to stand out</h1>
          <p className="text-lg text-white/60">
            Our powerful suite of tools makes building your professional portfolio a breeze.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="mb-4 bg-black/50 w-16 h-16 rounded-xl flex items-center justify-center border border-zinc-800">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                <CardDescription className="text-zinc-400 mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
