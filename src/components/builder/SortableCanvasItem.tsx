"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

interface SortableCanvasItemProps {
  id: string;
  type: string;
  onRemove: (id: string) => void;
}

export function SortableCanvasItem({ id, type, onRemove }: SortableCanvasItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  // Render dummy content based on type
  const renderContent = () => {
    switch (type) {
      case "section":
        return <div className="h-32 bg-secondary/30 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">Empty Section</div>;
      case "heading":
        return <h1 className="text-4xl font-bold text-foreground">Add Your Heading Here</h1>;
      case "bio":
        return (
          <div className="flex items-center gap-6 p-6 bg-secondary/10 rounded-xl border border-border/50">
            <div className="w-24 h-24 rounded-full bg-secondary shrink-0" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your Name</h2>
              <p className="text-muted-foreground">A short, engaging bio about who you are and what you do. This area can be enhanced by AI later!</p>
            </div>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-4 p-6 bg-secondary/10 rounded-xl border border-border/50">
            <h3 className="text-xl font-semibold">Experience</h3>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-md bg-secondary shrink-0" />
              <div>
                <h4 className="font-medium">Job Title</h4>
                <p className="text-sm text-muted-foreground">Company Name • 2020 - Present</p>
                <p className="text-sm mt-2">Brief description of your responsibilities and achievements in this role.</p>
              </div>
            </div>
          </div>
        );
      case "gallery":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-secondary rounded-lg border border-border/50" />
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
      className="group relative bg-background border border-border/40 shadow-sm rounded-xl p-4 hover:border-primary/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="pl-8">
        {renderContent()}
      </div>

      <button
        onClick={() => onRemove(id)}
        className="absolute right-2 top-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
