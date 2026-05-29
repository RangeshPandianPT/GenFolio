"use client";

import { useState } from "react";
import { Layout, Type, Image as ImageIcon, Briefcase, User, Settings, Save, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableSidebarItem } from "@/components/builder/DraggableSidebarItem";
import { SortableCanvasItem } from "@/components/builder/SortableCanvasItem";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

type Block = {
  id: string;
  type: string;
  content?: any;
};

const getDefaultContent = (type: string) => {
  switch (type) {
    case "heading": return { text: "Add Your Heading Here" };
    case "bio": return { name: "Your Name", description: "A short, engaging bio about who you are and what you do. This area can be enhanced by AI later!", imageUrl: "" };
    case "experience": return { title: "Job Title", company: "Company Name", period: "2020 - Present", description: "Brief description of your responsibilities and achievements in this role.", logoUrl: "" };
    case "gallery": return { images: ["", "", ""] };
    default: return {};
  }
};

// A simple droppable wrapper for our canvas
function CanvasDroppable({ children, blocks }: { children: React.ReactNode, blocks: Block[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[800px] max-w-5xl mx-auto my-8 border-2 ${
        isOver && blocks.length === 0 ? "border-primary bg-primary/5" : "border-border/40 bg-background"
      } shadow-2xl rounded-2xl p-8 flex flex-col gap-4 transition-colors`}
    >
      {children}
    </div>
  );
}

const THEMES = [
  { id: 'blue', color: '#3b82f6', bgClass: 'bg-blue-500' },
  { id: 'indigo', color: '#6366f1', bgClass: 'bg-indigo-500' },
  { id: 'emerald', color: '#10b981', bgClass: 'bg-emerald-500' },
  { id: 'rose', color: '#f43f5e', bgClass: 'bg-rose-500' },
  { id: 'amber', color: '#f59e0b', bgClass: 'bg-amber-500' },
];

export default function Builder() {
  const [activeTab, setActiveTab] = useState("blocks");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!over) return;

    // Dragging a new item from the sidebar to the canvas
    if (active.data.current?.isSidebarItem && (over.id === "canvas" || blocks.find(b => b.id === over.id))) {
      const type = active.data.current.type;
      const newBlock = { 
        id: `${type}-${Date.now()}`, 
        type,
        content: getDefaultContent(type)
      };
      
      // If dropped over a specific item, insert it near there. Otherwise, append.
      if (over.id !== "canvas") {
        const overIndex = blocks.findIndex((block) => block.id === over.id);
        const newBlocks = [...blocks];
        newBlocks.splice(overIndex + 1, 0, newBlock);
        setBlocks(newBlocks);
      } else {
        setBlocks((prev) => [...prev, newBlock]);
      }
      return;
    }

    // Reordering existing items within the canvas
    if (active.id !== over.id && blocks.find(b => b.id === active.id)) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, content: { ...block.content, ...newContent } } : block
      )
    );
  };

  const generateBio = async () => {
    if (!selectedBlockId) return;
    setIsGeneratingBio(true);
    
    try {
      const selectedBlock = blocks.find(b => b.id === selectedBlockId);
      const res = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: selectedBlock?.content?.name,
          currentBio: selectedBlock?.content?.description 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      
      updateBlockContent(selectedBlockId, {
        description: data.bio
      });
    } catch (error) {
      console.error("Bio generation error:", error);
      alert("Failed to generate AI bio.");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const savePortfolio = async () => {
    setIsSaving(true);
    try {
      if (!userId) {
        alert("Please sign in to save your portfolio.");
        setIsSaving(false);
        return;
      }
      
      const portfolioData = {
        userId,
        themeColor,
        blocks,
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "portfolios"), portfolioData);
      alert(`Portfolio published successfully!\nView it at: ${window.location.origin}/${docRef.id}`);
    } catch (error) {
      console.error("Error saving portfolio: ", error);
      alert("Failed to publish portfolio.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (isPreview) {
    return (
      <div 
        className="min-h-screen bg-background text-foreground"
        style={{ '--primary': themeColor } as React.CSSProperties}
      >
        <button 
          onClick={() => setIsPreview(false)}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Exit Preview
        </button>
        <div className="max-w-5xl mx-auto py-12 px-8 flex flex-col gap-6">
          {blocks.map((block) => (
            <div key={block.id}>
              {block.type === "section" && <div className="h-16" />}
              {block.type === "heading" && <h1 className="text-5xl font-bold tracking-tight">{block.content?.text}</h1>}
              {block.type === "bio" && (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-12">
                  {block.content?.imageUrl && (
                    <div className="w-40 h-40 rounded-full overflow-hidden shrink-0 shadow-xl border-4 border-background">
                      <img src={block.content.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold">{block.content?.name}</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">{block.content?.description}</p>
                  </div>
                </div>
              )}
              {block.type === "experience" && (
                <div className="flex gap-6 py-6 border-b border-border/50 last:border-0">
                  {block.content?.logoUrl ? (
                    <div className="w-16 h-16 rounded-xl bg-secondary/50 shrink-0 overflow-hidden shadow-sm">
                      <img src={block.content.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">{block.content?.title}</h4>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>{block.content?.company}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{block.content?.period}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mt-4 whitespace-pre-wrap">{block.content?.description}</p>
                  </div>
                </div>
              )}
              {block.type === "gallery" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8">
                  {(block.content?.images || []).map((img: string, i: number) => img ? (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-md group">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="min-h-screen bg-background flex flex-col overflow-hidden" 
        style={{ '--primary': themeColor } as React.CSSProperties}
      >
        {/* Top Navbar */}
        <header className="h-14 border-b border-border glass flex items-center justify-between px-4 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <div className="h-4 w-px bg-border"></div>
            <span className="text-sm font-semibold tracking-tight">Untitled Portfolio</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPreview(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button 
              onClick={savePortfolio}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Publish"}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tools & Elements */}
          <aside className="w-64 border-r border-border glass-panel flex flex-col z-10 shrink-0">
            <div className="flex p-2 border-b border-border/50 gap-1">
              <button 
                onClick={() => setActiveTab("blocks")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${activeTab === "blocks" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                Blocks
              </button>
              <button 
                onClick={() => setActiveTab("theme")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${activeTab === "theme" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                Theme
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeTab === "blocks" ? (
                <>
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layout</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <DraggableSidebarItem id="sidebar-section" type="section" label="Section" icon={Layout} />
                      <DraggableSidebarItem id="sidebar-heading" type="heading" label="Heading" icon={Type} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <DraggableSidebarItem id="sidebar-bio" type="bio" label="Hero / Bio" icon={User} />
                      <DraggableSidebarItem id="sidebar-experience" type="experience" label="Experience" icon={Briefcase} />
                      <DraggableSidebarItem id="sidebar-gallery" type="gallery" label="Gallery" icon={ImageIcon} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {THEMES.map((t) => (
                        <div 
                          key={t.id}
                          onClick={() => setThemeColor(t.color)}
                          className={`w-8 h-8 rounded-full ${t.bgClass} cursor-pointer transition-all ${
                            themeColor === t.color ? 'ring-2 ring-border ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Canvas Area */}
          <main className="flex-1 bg-secondary/10 relative overflow-y-auto">
            {/* Canvas Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            <CanvasDroppable blocks={blocks}>
              {blocks.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 opacity-50 pointer-events-none">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border border-dashed flex items-center justify-center">
                    <Layout className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">Your portfolio is empty</h2>
                  <p className="text-sm text-muted-foreground">Drag and drop components here to start building.</p>
                </div>
              ) : (
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block) => (
                    <SortableCanvasItem 
                      key={block.id} 
                      id={block.id} 
                      type={block.type} 
                      content={block.content}
                      isSelected={selectedBlockId === block.id}
                      onSelect={setSelectedBlockId}
                      onRemove={removeBlock} 
                    />
                  ))}
                </SortableContext>
              )}
            </CanvasDroppable>
          </main>
          
          {/* Right Sidebar - Properties */}
          <aside className="w-64 border-l border-border glass-panel flex flex-col z-10 shrink-0">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Properties
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedBlock ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground">Select an element to edit its properties.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Block Type</h3>
                    <div className="px-3 py-2 bg-secondary/50 rounded-md text-sm font-medium capitalize">{selectedBlock.type}</div>
                  </div>
                  
                  {selectedBlock.type === "heading" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Text</label>
                      <input 
                        type="text" 
                        value={selectedBlock.content?.text || ""} 
                        onChange={(e) => updateBlockContent(selectedBlock.id, { text: e.target.value })}
                        className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}

                  {selectedBlock.type === "bio" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Name</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.name || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { name: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium">Bio Description</label>
                          <button 
                            onClick={generateBio}
                            disabled={isGeneratingBio}
                            className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {isGeneratingBio ? "Generating..." : "✨ AI Magic"}
                          </button>
                        </div>
                        <textarea 
                          value={selectedBlock.content?.description || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { description: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Image URL</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.imageUrl || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { imageUrl: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  )}

                  {selectedBlock.type === "experience" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Job Title</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.title || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Company</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.company || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { company: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Period</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.period || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { period: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Description</label>
                        <textarea 
                          value={selectedBlock.content?.description || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { description: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {selectedBlock.type === "gallery" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-medium">Image URLs</h4>
                      {(selectedBlock.content?.images || ["", "", ""]).map((url: string, index: number) => (
                        <div key={index} className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase">Image {index + 1}</label>
                          <input 
                            type="text" 
                            value={url} 
                            onChange={(e) => {
                              const newImages = [...(selectedBlock.content?.images || ["", "", ""])];
                              newImages[index] = e.target.value;
                              updateBlockContent(selectedBlock.id, { images: newImages });
                            }}
                            className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="https://..."
                          />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </aside>
        </div>

        <DragOverlay>
          {activeDragId && activeDragId.startsWith("sidebar-") ? (
            <div className="aspect-square rounded-xl border border-primary bg-primary/10 flex flex-col items-center justify-center gap-2 shadow-lg w-[118px]">
               <div className="w-6 h-6 bg-primary rounded-full animate-pulse" />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
