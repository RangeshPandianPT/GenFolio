"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Briefcase, ExternalLink, Image as ImageIcon, Sparkles, Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface SortableCanvasItemProps {
  id: string;
  type: string;
  content?: any;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SortableCanvasItem({ id, type, content = {}, isSelected = false, onSelect, onRemove }: SortableCanvasItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderContent = () => {
    switch (type) {
      case "section":
        return <div className="h-32 bg-secondary/10 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center text-primary/60 font-medium">Empty Section space</div>;
      case "heading":
        return (
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70"
          >
            {content.text || "Add Your Heading Here"}
          </motion.h1>
        );
      case "bio":
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-gradient-to-br from-background to-secondary/20 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="w-32 h-32 rounded-full bg-secondary/50 shrink-0 overflow-hidden shadow-xl ring-4 ring-background z-10">
              {content.imageUrl ? (
                <img src={content.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-8 h-8 opacity-20" /></div>
              )}
            </div>
            <div className="space-y-3 z-10 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">{content.name || "Your Name"}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-2xl">{content.description || "A short, engaging bio about who you are and what you do. This area can be enhanced by AI later!"}</p>
            </div>
          </motion.div>
        );
      case "experience":
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-8 bg-card rounded-2xl border border-border/50 shadow-sm group hover:shadow-md transition-all duration-300 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex gap-6 relative z-10">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                {content.logoUrl ? (
                  <img src={content.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Briefcase className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold">{content.title || "Job Title"}</h4>
                <div className="flex items-center gap-2 text-primary font-medium mt-1">
                  <span>{content.company || "Company Name"}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground">{content.period || "2020 - Present"}</span>
                </div>
                <p className="text-muted-foreground mt-4 leading-relaxed whitespace-pre-wrap">{content.description || "Brief description of your responsibilities and achievements in this role."}</p>
              </div>
            </div>
          </motion.div>
        );
      case "gallery":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {(content.images || [1, 2, 3]).map((img: any, i: number) => (
              <div key={i} className="aspect-square md:aspect-video bg-secondary/30 rounded-2xl border border-border/50 overflow-hidden group relative">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white opacity-50" />
                </div>
                {typeof img === 'string' && img ? (
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                )}
              </div>
            ))}
          </motion.div>
        );
      case "projects":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(content.items || [{ name: "Project 1", desc: "Description 1" }]).map((p: any, i: number) => (
              <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <h4 className="font-bold text-xl">{p.name || "Project Name"}</h4>
                <p className="text-muted-foreground mt-3 leading-relaxed">{p.desc || "Project description goes here."}</p>
                {p.link && (
                  <a href={p.link} className="flex items-center gap-2 text-primary font-medium text-sm mt-6 group-hover:underline w-fit" target="_blank" rel="noreferrer">
                    View Project <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </motion.div>
        );
      case "skills":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3 p-2">
            {(content.skills || ["React", "Next.js", "Tailwind CSS", "TypeScript"]).map((s: string, i: number) => (
              <span key={i} className="px-5 py-2.5 bg-background border border-primary/20 shadow-sm text-foreground rounded-full text-sm font-medium hover:border-primary/50 transition-colors cursor-default">
                {s}
              </span>
            ))}
          </motion.div>
        );
      case "social":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center gap-4 py-8">
            {(content.links || [{ platform: "Twitter", url: "#" }, { platform: "LinkedIn", url: "#" }]).map((link: any, i: number) => (
              <a key={i} href={link.url} className="px-6 py-3 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95" target="_blank" rel="noreferrer">
                {link.platform}
              </a>
            ))}
          </motion.div>
        );
      case "contact":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto p-8 bg-card border border-border/50 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{content.title || "Get in touch"}</h3>
            <p className="text-muted-foreground mt-2 mb-6">{content.description || "Drop me a message!"}</p>
            <div className="space-y-4 text-left pointer-events-none opacity-70">
              <input type="text" placeholder="Your Name" disabled className="w-full px-4 py-3 bg-background border border-border rounded-xl" />
              <input type="email" placeholder="Your Email" disabled className="w-full px-4 py-3 bg-background border border-border rounded-xl" />
              <textarea placeholder="Your Message" disabled rows={4} className="w-full px-4 py-3 bg-background border border-border rounded-xl resize-none" />
              <button disabled className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl">Send Message</button>
            </div>
          </motion.div>
        );
      case "testimonials":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(content.items || [{ name: "Client Name", role: "CEO", text: "Amazing work! Highly recommended." }]).map((t: any, i: number) => (
              <div key={i} className="p-8 bg-gradient-to-br from-card to-secondary/10 border border-border/50 rounded-2xl shadow-sm relative">
                <MessageSquare className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                <p className="text-lg italic text-muted-foreground mb-6">"{t.text}"</p>
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-sm text-primary font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </motion.div>
        );
      default:
        return <div>Unknown Block</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(id)}
      className={`group relative bg-background/50 backdrop-blur-sm border shadow-sm rounded-2xl p-6 transition-all duration-200 ${
        isSelected ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border/40 hover:border-primary/50"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 bg-background border border-border text-muted-foreground hover:text-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity rounded-md shadow-sm z-20"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="pointer-events-none">
        {renderContent()}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute right-4 top-4 p-2 bg-background border border-border text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm hover:bg-destructive/10 z-20"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

