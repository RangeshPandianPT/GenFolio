"use client";

import { motion } from "framer-motion";
import { Briefcase, ExternalLink, Image as ImageIcon, Sparkles, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PortfolioViewerProps {
  portfolioData: any;
}

export function PortfolioViewer({ portfolioData }: PortfolioViewerProps) {
  const { blocks, themeColor, themeRadius, themeFont, themeMode } = portfolioData;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    // Simulate sending
    setTimeout(() => {
      setFormStatus("sent");
    }, 1500);
  };

  return (
    <div 
      className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-zinc-950 text-white' : 'bg-background text-foreground'} ${themeFont || 'font-sans'}`}
      style={{ '--primary': themeColor || '#6366f1', '--radius': themeRadius || '0.5rem' } as React.CSSProperties}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto py-12 px-8 flex flex-col gap-8"
      >
        {blocks?.map((block: any) => (
          <motion.div variants={itemVariants} key={block.id} className="w-full">
            {block.type === "section" && <div className="h-16" />}
            
            {block.type === "heading" && (
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                {block.content?.text}
              </h1>
            )}

            {block.type === "bio" && (
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-gradient-to-br from-background to-secondary/20 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="w-40 h-40 rounded-full bg-secondary/50 shrink-0 overflow-hidden shadow-xl ring-4 ring-background z-10">
                  {block.content?.imageUrl ? (
                    <img src={block.content.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                  )}
                </div>
                <div className="space-y-4 z-10 text-center md:text-left pt-2">
                  <h2 className="text-4xl font-extrabold tracking-tight">{block.content?.name}</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">{block.content?.description}</p>
                </div>
              </div>
            )}

            {block.type === "experience" && (
              <div className="space-y-4 p-8 bg-card rounded-2xl border border-border/50 shadow-sm group hover:shadow-md transition-all duration-300 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                <div className="flex gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                    {block.content?.logoUrl ? (
                      <img src={block.content.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Briefcase className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold">{block.content?.title}</h4>
                    <div className="flex items-center gap-2 text-primary font-medium mt-1">
                      <span>{block.content?.company}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-muted-foreground">{block.content?.period}</span>
                    </div>
                    <p className="text-muted-foreground mt-4 leading-relaxed whitespace-pre-wrap">{block.content?.description}</p>
                  </div>
                </div>
              </div>
            )}

            {block.type === "gallery" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {(block.content?.images || []).map((img: string, i: number) => img ? (
                  <div key={i} className="aspect-video md:aspect-square lg:aspect-video bg-secondary/30 rounded-2xl border border-border/50 overflow-hidden group relative">
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white opacity-50" />
                    </div>
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  </div>
                ) : null)}
              </div>
            )}
            
            {block.type === "projects" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {(block.content?.items || []).map((p: any, i: number) => (
                  <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full">
                    <h4 className="font-bold text-xl">{p.name}</h4>
                    <p className="text-muted-foreground mt-3 leading-relaxed flex-1">{p.desc}</p>
                    {p.link && (
                      <a href={p.link} className="flex items-center gap-2 text-primary font-medium text-sm mt-6 group-hover:underline w-fit" target="_blank" rel="noreferrer">
                        View Project <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {block.type === "skills" && (
              <div className="flex flex-wrap gap-3 pt-4">
                {(block.content?.skills || []).map((s: string, i: number) => (
                  <span key={i} className="px-5 py-2.5 bg-background border border-primary/20 shadow-sm text-foreground rounded-full text-sm font-medium hover:border-primary/50 transition-colors cursor-default">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {block.type === "testimonials" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {(block.content?.items || []).map((t: any, i: number) => (
                  <div key={i} className="p-8 bg-gradient-to-br from-card to-secondary/10 border border-border/50 rounded-2xl shadow-sm relative">
                    <MessageSquare className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                    <p className="text-lg italic text-muted-foreground mb-6">"{t.text}"</p>
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-sm text-primary font-medium">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {block.type === "contact" && (
              <div className="max-w-xl mx-auto p-8 bg-card border border-border/50 rounded-2xl shadow-sm">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{block.content?.title || "Get in touch"}</h3>
                  <p className="text-muted-foreground mt-2">{block.content?.description || "Drop me a message!"}</p>
                </div>
                
                {formStatus === "sent" ? (
                  <div className="text-center p-6 bg-green-500/10 text-green-600 rounded-xl font-medium">
                    Message sent successfully! I'll get back to you soon.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <input type="text" placeholder="Your Name" required className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                    <input type="email" placeholder="Your Email" required className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                    <textarea placeholder="Your Message" required rows={4} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none" />
                    <button type="submit" disabled={formStatus === "sending"} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-70">
                      {formStatus === "sending" ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            )}
            
            {block.type === "social" && (
              <div className="flex flex-wrap justify-center gap-4 py-12 mt-8 border-t border-border/50">
                {(block.content?.links || []).map((link: any, i: number) => (
                  <a key={i} href={link.url} className="px-6 py-3 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 shadow-md" target="_blank" rel="noreferrer">
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      
      <div className="fixed bottom-4 right-4 z-50">
        <Link 
          href="/" 
          className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-full shadow-lg border border-border/50 hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <div className="w-4 h-4 rounded-sm bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-[8px]">
            G
          </div>
          Built with GenFolio
        </Link>
      </div>
    </div>
  );
}
