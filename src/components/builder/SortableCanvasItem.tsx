"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

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

  // Render content based on type and dynamic content
  const renderContent = () => {
    switch (type) {
      case "section":
        return <div className="h-32 bg-secondary/30 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">Empty Section</div>;
      case "heading":
        return <h1 className="text-4xl font-bold text-foreground">{content.text || "Add Your Heading Here"}</h1>;
      case "bio":
        return (
          <div className="flex items-center gap-6 p-6 bg-secondary/10 rounded-xl border border-border/50">
            <div className="w-24 h-24 rounded-full bg-secondary shrink-0 overflow-hidden">
              {content.imageUrl && <img src={content.imageUrl} alt="Profile" className="w-full h-full object-cover" />}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{content.name || "Your Name"}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{content.description || "A short, engaging bio about who you are and what you do. This area can be enhanced by AI later!"}</p>
            </div>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-4 p-6 bg-secondary/10 rounded-xl border border-border/50">
            <h3 className="text-xl font-semibold">Experience</h3>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-md bg-secondary shrink-0 overflow-hidden">
                {content.logoUrl && <img src={content.logoUrl} alt="Logo" className="w-full h-full object-cover" />}
              </div>
              <div>
                <h4 className="font-medium">{content.title || "Job Title"}</h4>
                <p className="text-sm text-muted-foreground">{content.company || "Company Name"} • {content.period || "2020 - Present"}</p>
                <p className="text-sm mt-2 whitespace-pre-wrap">{content.description || "Brief description of your responsibilities and achievements in this role."}</p>
              </div>
            </div>
          </div>
        );
      case "gallery":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(content.images || [1, 2, 3]).map((img: any, i: number) => (
              <div key={i} className="aspect-video bg-secondary rounded-lg border border-border/50 overflow-hidden">
                {typeof img === 'string' && <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />}
              </div>
            ))}
          </div>
        );
      case "projects":
        return (
          <div className="space-y-4 p-6 bg-secondary/10 rounded-xl border border-border/50">
            <h3 className="text-xl font-semibold">Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content.items || [{ name: "Project 1", desc: "Description 1" }]).map((p: any, i: number) => (
                <div key={i} className="p-4 bg-background border border-border/50 rounded-lg shadow-sm">
                  <h4 className="font-bold text-lg">{p.name || "Project Name"}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{p.desc || "Project description goes here."}</p>
                  {p.link && <a href={p.link} className="text-primary text-sm mt-4 inline-block hover:underline" target="_blank" rel="noreferrer">View Project →</a>}
                </div>
              ))}
            </div>
          </div>
        );
      case "skills":
        return (
          <div className="space-y-4 p-6 bg-secondary/10 rounded-xl border border-border/50">
            <h3 className="text-xl font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(content.skills || ["React", "Next.js", "Tailwind CSS"]).map((s: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        );
      case "social":
        return (
          <div className="flex justify-center gap-4 py-8">
            {(content.links || [{ platform: "Twitter", url: "#" }]).map((link: any, i: number) => (
              <a key={i} href={link.url} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors" target="_blank" rel="noreferrer">
                {link.platform}
              </a>
            ))}
          </div>
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
      className={`group relative bg-background border shadow-sm rounded-xl p-4 transition-all ${
        isSelected ? "border-primary ring-1 ring-primary" : "border-border/40 hover:border-primary/50"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="pl-8 pointer-events-none">
        {renderContent()}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute right-2 top-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
