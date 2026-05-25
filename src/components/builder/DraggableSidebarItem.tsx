"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LucideIcon } from "lucide-react";

interface DraggableSidebarItemProps {
  id: string;
  type: string;
  label: string;
  icon: LucideIcon;
}

export function DraggableSidebarItem({ id, type, label, icon: Icon }: DraggableSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type,
      isSidebarItem: true,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`aspect-square rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary/50 transition-colors ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <Icon className="w-6 h-6 text-muted-foreground" />
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
