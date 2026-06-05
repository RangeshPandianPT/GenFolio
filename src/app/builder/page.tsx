"use client";

import { useState } from "react";
import { Layout, Type, Image as ImageIcon, Briefcase, User, Settings, Save, Eye, ChevronLeft, Link as LinkIcon, Code, Hash, LayoutDashboard, Mail, MessageSquare, Sparkles, Github, Twitter, Music, Monitor, Smartphone, Tablet, LayoutTemplate, FileText } from "lucide-react";
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
import { db, auth, storage } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
    case "projects": return { items: [{ name: "Awesome Project", desc: "Built with Next.js", link: "" }] };
    case "skills": return { skills: ["React", "TypeScript", "Node.js"] };
    case "social": return { links: [{ platform: "GitHub", url: "" }, { platform: "LinkedIn", url: "" }] };
    case "contact": return { title: "Get in touch", description: "Drop me a message!" };
    case "testimonials": return { items: [{ name: "Client Name", role: "CEO", text: "Amazing work! Highly recommended." }] };
    case "github": return { username: "octocat", repos: [{name: "Hello-World", desc: "My first repository", stars: 12, forks: 4}] };
    case "github": return { username: "octocat", repos: [{name: "Hello-World", desc: "My first repository", stars: 12, forks: 4}] };
    case "twitter": return { username: "yourusername", tweetUrl: "" };
    case "spotify": return { embedUrl: "" };
    case "blog": return { title: "My Thoughts", posts: [{ title: "First Post", date: "Today", content: "Markdown content here..." }] };
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

const PORTFOLIO_TEMPLATES = [
  {
    id: "minimal",
    name: "Minimalist Light",
    theme: { color: "#171717", radius: "0", font: "font-sans", mode: "light" },
    blocks: [
      { id: "head-min", type: "heading", content: { text: "Hi, I'm Alex." } },
      { id: "bio-min", type: "bio", content: { name: "Product Designer", description: "I build simple and elegant digital experiences." } },
      { id: "proj-min", type: "projects", content: { items: [{ name: "Project Alpha", desc: "Minimal design system", link: "#" }] } }
    ]
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Hacker",
    theme: { color: "#22c55e", radius: "0", font: "font-mono", mode: "dark" },
    blocks: [
      { id: "head-cyb", type: "heading", content: { text: "> system.init()" } },
      { id: "bio-cyb", type: "bio", content: { name: "Full Stack Dev", description: "Hacking the mainframe since 1999." } },
      { id: "git-cyb", type: "github", content: { username: "hackerman", repos: [{name: "neural-net", desc: "AI stuff", stars: 999, forks: 42}] } },
      { id: "skills-cyb", type: "skills", content: { skills: ["Rust", "Go", "C++", "Assembly"] } }
    ]
  },
  {
    id: "modern",
    name: "Modern Professional",
    theme: { color: "#3b82f6", radius: "0.5rem", font: "font-sans", mode: "light" },
    blocks: [
      { id: "bio-mod", type: "bio", content: { name: "Sarah Jenkins", description: "Senior Marketing Manager with 10+ years of experience driving growth." } },
      { id: "exp-mod", type: "experience", content: { title: "VP of Marketing", company: "TechCorp", period: "2018 - Present", description: "Led a team of 50+ marketers." } },
      { id: "test-mod", type: "testimonials", content: { items: [{ name: "John Doe", role: "CEO", text: "Sarah is a visionary leader." }] } }
    ]
  }
];

export default function Builder() {
  const [activeTab, setActiveTab] = useState("blocks");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [themePrompt, setThemePrompt] = useState("");
  
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [themeRadius, setThemeRadius] = useState('0.5rem');
  const [themeFont, setThemeFont] = useState('font-sans');
  const [themeMode, setThemeMode] = useState('light');
  const [seoConfig, setSeoConfig] = useState({ title: "My Portfolio", description: "", ogImage: "" });
  const [username, setUsername] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState<{[key: string]: boolean}>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, path: string, arrayIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!userId) {
      alert("Please sign in to upload images.");
      return;
    }

    const uploadId = `${blockId}-${path}-${arrayIndex ?? 0}`;
    setUploadingState(prev => ({ ...prev, [uploadId]: true }));
    
    try {
      const storageRef = ref(storage, `users/${userId}/portfolios/${portfolioId || 'temp'}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;
      
      if (typeof arrayIndex === 'number' && block.content[path] && Array.isArray(block.content[path])) {
        const newArray = [...block.content[path]];
        newArray[arrayIndex] = downloadURL;
        updateBlockContent(blockId, { [path]: newArray });
      } else {
        updateBlockContent(blockId, { [path]: downloadURL });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Check Firebase Storage rules.");
    } finally {
      setUploadingState(prev => ({ ...prev, [uploadId]: false }));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    if (editId) {
      setPortfolioId(editId);
      const fetchPortfolio = async () => {
        const docRef = doc(db, "portfolios", editId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setBlocks(data.blocks || []);
          setThemeColor(data.themeColor || '#6366f1');
          setThemeRadius(data.themeRadius || '0.5rem');
          setThemeFont(data.themeFont || 'font-sans');
          setThemeMode(data.themeMode || 'light');
          setSeoConfig(data.seo || { title: "My Portfolio", description: "", ogImage: "" });
          setUsername(data.username || "");
          setIsPublished(data.isPublished || false);
        }
      };
      fetchPortfolio();
    }
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

  const generateTheme = async () => {
    if (!themePrompt) return;
    setIsGeneratingTheme(true);
    try {
      const res = await fetch("/api/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: themePrompt }),
      });
      if (!res.ok) throw new Error("Failed to generate theme");
      const data = await res.json();
      if (data.themeColor) setThemeColor(data.themeColor);
      if (data.themeRadius) setThemeRadius(data.themeRadius);
      if (data.themeFont) setThemeFont(data.themeFont);
      if (data.themeMode) setThemeMode(data.themeMode);
    } catch (error) {
      console.error("Theme generation error:", error);
      alert("Failed to generate AI theme.");
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const savePortfolio = async (publish: boolean) => {
    setIsSaving(true);
    try {
      if (!userId) {
        alert("Please sign in to save your portfolio.");
        setIsSaving(false);
        return;
      }
      
      const portfolioData = {
        userId,
        username: username.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        isPublished: publish,
        themeColor,
        themeRadius,
        themeFont,
        themeMode,
        seo: seoConfig,
        blocks,
        updatedAt: new Date().toISOString(),
      };

      let docId = portfolioId;
      if (docId) {
        await setDoc(doc(db, "portfolios", docId), portfolioData, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, "portfolios"), portfolioData);
        docId = docRef.id;
        setPortfolioId(docId);
      }
      
      setIsPublished(publish);
      alert(publish ? `Portfolio published successfully!\nView it at: ${window.location.origin}/${portfolioData.username || docId}` : "Draft saved successfully!");
    } catch (error) {
      console.error("Error saving portfolio: ", error);
      alert("Failed to save portfolio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    const { exportPortfolioToZip } = await import("@/lib/export");
    const portfolioData = {
      themeColor,
      themeRadius,
      themeFont,
      themeMode,
      seo: seoConfig,
      blocks
    };
    await exportPortfolioToZip(portfolioData);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (isPreview) {
    return (
      <div 
        className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-zinc-950 text-white' : 'bg-background text-foreground'} ${themeFont}`}
        style={{ '--primary': themeColor, '--radius': themeRadius } as React.CSSProperties}
      >
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/80 backdrop-blur-md p-2 rounded-full border border-border shadow-lg">
          <button onClick={() => setIsPreview(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80">Back to Builder</button>
          
          <div className="flex items-center bg-secondary rounded-full p-1 border border-border/50">
            <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-full ${previewDevice === 'desktop' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Monitor className="w-4 h-4"/></button>
            <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-full ${previewDevice === 'tablet' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Tablet className="w-4 h-4"/></button>
            <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-full ${previewDevice === 'mobile' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Smartphone className="w-4 h-4"/></button>
          </div>

          <button onClick={() => savePortfolio(false)} disabled={isSaving} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => savePortfolio(true)} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Publishing..." : "Publish"}
          </button>
        </div>
        <div className={`mx-auto py-12 px-8 flex flex-col gap-6 pt-24 pointer-events-none transition-all duration-300 ${
          previewDevice === 'mobile' ? 'max-w-[400px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-5xl'
        }`}>
          <DndContext>
           <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableCanvasItem 
                  key={block.id} id={block.id} type={block.type} content={block.content} onRemove={()=>{}}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`flex flex-col h-screen overflow-hidden ${themeMode === 'dark' ? 'dark bg-zinc-950 text-white' : 'bg-background text-foreground'} ${themeFont}`} style={{ '--primary': themeColor, '--radius': themeRadius } as React.CSSProperties}>
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-20 relative">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="font-semibold">{seoConfig.title || "Untitled Portfolio"}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2 transition-colors">
              <Code className="w-4 h-4" /> Export ZIP
            </button>
            <button onClick={() => setIsPreview(true)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2 transition-colors">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button onClick={() => savePortfolio(false)} disabled={isSaving} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50">
              Save Draft
            </button>
            <button onClick={() => savePortfolio(true)} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Publish"}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-64 border-r border-border bg-card flex flex-col z-10 shrink-0 shadow-sm">
            <div className="p-4 flex gap-2 border-b border-border/50">
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
              <button 
                onClick={() => setActiveTab("templates")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${activeTab === "templates" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                Templates
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${activeTab === "settings" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                Settings
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
                      <DraggableSidebarItem id="sidebar-projects" type="projects" label="Projects" icon={Code} />
                      <DraggableSidebarItem id="sidebar-skills" type="skills" label="Skills" icon={Hash} />
                      <DraggableSidebarItem id="sidebar-blog" type="blog" label="Notes / Blog" icon={FileText} />
                      <DraggableSidebarItem id="sidebar-github" type="github" label="GitHub" icon={Github} />
                      <DraggableSidebarItem id="sidebar-twitter" type="twitter" label="Twitter/X" icon={Twitter} />
                      <DraggableSidebarItem id="sidebar-spotify" type="spotify" label="Spotify" icon={Music} />
                      <DraggableSidebarItem id="sidebar-social" type="social" label="Social Links" icon={LinkIcon} />
                      <DraggableSidebarItem id="sidebar-testimonials" type="testimonials" label="Testimonials" icon={MessageSquare} />
                      <DraggableSidebarItem id="sidebar-contact" type="contact" label="Contact Form" icon={Mail} />
                    </div>
                  </div>
                </>
              ) : activeTab === "theme" ? (
                <div className="space-y-6">
                  <div className="space-y-3 p-4 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-xl border border-primary/20">
                    <h3 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider mb-2">
                      <Sparkles className="w-3 h-3" /> AI Theme Gen
                    </h3>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Dark Cyberpunk..."
                        value={themePrompt}
                        onChange={(e) => setThemePrompt(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-primary"
                      />
                      <button 
                        onClick={generateTheme}
                        disabled={isGeneratingTheme || !themePrompt}
                        className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {isGeneratingTheme ? "Generating..." : "Generate Theme"}
                      </button>
                    </div>
                  </div>

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
                  
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Border Radius</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['0', '0.5rem', '9999px'].map((r, i) => (
                        <button key={i} onClick={() => setThemeRadius(r)} className={`px-2 py-1 text-xs border rounded-md ${themeRadius === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                          {r === '0' ? 'Sharp' : r === '0.5rem' ? 'Rounded' : 'Pill'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h3>
                    <div className="flex flex-col gap-2">
                      {['font-sans', 'font-serif', 'font-mono'].map((f, i) => (
                        <button key={i} onClick={() => setThemeFont(f)} className={`px-3 py-2 text-sm border rounded-md text-left ${themeFont === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                          {f.replace('font-', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setThemeMode('light')} className={`px-2 py-1 text-xs border rounded-md ${themeMode === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>Light</button>
                      <button onClick={() => setThemeMode('dark')} className={`px-2 py-1 text-xs border rounded-md ${themeMode === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>Dark</button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "templates" ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pre-built Layouts</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {PORTFOLIO_TEMPLATES.map((tpl) => (
                        <div 
                          key={tpl.id} 
                          onClick={() => {
                            if (window.confirm("Applying a template will replace your current blocks and theme. Continue?")) {
                              setBlocks(tpl.blocks);
                              setThemeColor(tpl.theme.color);
                              setThemeRadius(tpl.theme.radius);
                              setThemeFont(tpl.theme.font);
                              setThemeMode(tpl.theme.mode);
                            }
                          }}
                          className="p-4 border border-border rounded-xl cursor-pointer hover:border-primary transition-all group relative overflow-hidden"
                        >
                          <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${tpl.theme.mode === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{backgroundColor: tpl.theme.color}}>
                              <LayoutTemplate className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold">{tpl.name}</h4>
                              <p className="text-[10px] text-muted-foreground">{tpl.blocks.length} blocks • {tpl.theme.mode}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeTab === "settings" ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Publishing</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-medium flex justify-between">
                        Custom Username (URL)
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </label>
                      <div className="flex text-sm bg-background border border-border rounded-md overflow-hidden">
                        <span className="bg-secondary px-2 py-2 text-muted-foreground border-r border-border">genfolio.com/</span>
                        <input 
                          type="text" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="your-name"
                          className="w-full px-2 py-2 bg-transparent focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Letters, numbers, and hyphens only.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Settings</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Page Title</label>
                      <input 
                        type="text" 
                        value={seoConfig.title} 
                        onChange={(e) => setSeoConfig({...seoConfig, title: e.target.value})}
                        className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Meta Description</label>
                      <textarea 
                        value={seoConfig.description} 
                        onChange={(e) => setSeoConfig({...seoConfig, description: e.target.value})}
                        className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">OpenGraph Image URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={seoConfig.ogImage || ""} 
                          onChange={(e) => setSeoConfig({...seoConfig, ogImage: e.target.value})}
                          placeholder="https://..."
                          className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Image shown when sharing on social media.</p>
                    </div>
                  </div>
                </div>
              ) : null}
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
                        <label className="text-xs font-medium">Image URL or Upload</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedBlock.content?.imageUrl || ""} 
                            onChange={(e) => updateBlockContent(selectedBlock.id, { imageUrl: e.target.value })}
                            className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="https://..."
                          />
                          <label className="cursor-pointer bg-secondary px-3 py-2 rounded-md flex items-center justify-center hover:bg-secondary/80">
                            {uploadingState[`${selectedBlock.id}-imageUrl-0`] ? <span className="text-[10px]">...</span> : <ImageIcon className="w-4 h-4" />}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedBlock.id, 'imageUrl')} />
                          </label>
                        </div>
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
                        <label className="text-xs font-medium">Logo URL or Upload</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedBlock.content?.logoUrl || ""} 
                            onChange={(e) => updateBlockContent(selectedBlock.id, { logoUrl: e.target.value })}
                            className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="https://..."
                          />
                          <label className="cursor-pointer bg-secondary px-3 py-2 rounded-md flex items-center justify-center hover:bg-secondary/80">
                            {uploadingState[`${selectedBlock.id}-logoUrl-0`] ? <span className="text-[10px]">...</span> : <ImageIcon className="w-4 h-4" />}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedBlock.id, 'logoUrl')} />
                          </label>
                        </div>
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
                      <h4 className="text-xs font-medium">Image URLs or Uploads</h4>
                      {(selectedBlock.content?.images || ["", "", ""]).map((url: string, index: number) => (
                        <div key={index} className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase">Image {index + 1}</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={url} 
                              onChange={(e) => {
                                const newImages = [...(selectedBlock.content?.images || ["", "", ""])];
                                newImages[index] = e.target.value;
                                updateBlockContent(selectedBlock.id, { images: newImages });
                              }}
                              className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="https://..."
                            />
                            <label className="cursor-pointer bg-secondary px-3 py-2 rounded-md flex items-center justify-center hover:bg-secondary/80">
                              {uploadingState[`${selectedBlock.id}-images-${index}`] ? <span className="text-[10px]">...</span> : <ImageIcon className="w-4 h-4" />}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedBlock.id, 'images', index)} />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBlock.type === "projects" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium">Projects</h4>
                        <button 
                          onClick={() => {
                            const newItems = [...(selectedBlock.content?.items || []), { name: "", desc: "", link: "" }];
                            updateBlockContent(selectedBlock.id, { items: newItems });
                          }}
                          className="text-[10px] bg-secondary px-2 py-1 rounded"
                        >+ Add</button>
                      </div>
                      {(selectedBlock.content?.items || []).map((item: any, index: number) => (
                        <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
                          <input 
                            type="text" placeholder="Name" value={item.name}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.content.items];
                              newItems[index].name = e.target.value;
                              updateBlockContent(selectedBlock.id, { items: newItems });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <input 
                            type="text" placeholder="Description" value={item.desc}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.content.items];
                              newItems[index].desc = e.target.value;
                              updateBlockContent(selectedBlock.id, { items: newItems });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <input 
                            type="text" placeholder="Link URL" value={item.link}
                            onChange={(e) => {
                              const newItems = [...selectedBlock.content.items];
                              newItems[index].link = e.target.value;
                              updateBlockContent(selectedBlock.id, { items: newItems });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <button onClick={() => {
                            const newItems = [...selectedBlock.content.items];
                            newItems.splice(index, 1);
                            updateBlockContent(selectedBlock.id, { items: newItems });
                          }} className="text-[10px] text-destructive">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBlock.type === "twitter" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Username</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.username || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { username: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Tweet URL (Optional Embed)</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.tweetUrl || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { tweetUrl: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {selectedBlock.type === "spotify" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Spotify Embed URL</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.embedUrl || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { embedUrl: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
                          placeholder="https://open.spotify.com/embed/..."
                        />
                        <p className="text-[10px] text-muted-foreground">Go to Spotify -&gt; Share -&gt; Embed Track/Playlist, and copy the `src` URL.</p>
                      </div>
                    </div>
                  )}

                  {selectedBlock.type === "github" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">GitHub Username</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.username || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { username: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium">Repositories</h4>
                        <button 
                          onClick={() => {
                            const newRepos = [...(selectedBlock.content?.repos || []), { name: "", desc: "", stars: 0, forks: 0 }];
                            updateBlockContent(selectedBlock.id, { repos: newRepos });
                          }}
                          className="text-[10px] bg-secondary px-2 py-1 rounded"
                        >+ Add</button>
                      </div>
                      {(selectedBlock.content?.repos || []).map((repo: any, index: number) => (
                        <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
                          <input 
                            type="text" placeholder="Repo Name" value={repo.name}
                            onChange={(e) => {
                              const newRepos = [...selectedBlock.content.repos];
                              newRepos[index].name = e.target.value;
                              updateBlockContent(selectedBlock.id, { repos: newRepos });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <input 
                            type="text" placeholder="Description" value={repo.desc}
                            onChange={(e) => {
                              const newRepos = [...selectedBlock.content.repos];
                              newRepos[index].desc = e.target.value;
                              updateBlockContent(selectedBlock.id, { repos: newRepos });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <div className="flex gap-2">
                            <input 
                              type="number" placeholder="Stars" value={repo.stars}
                              onChange={(e) => {
                                const newRepos = [...selectedBlock.content.repos];
                                newRepos[index].stars = parseInt(e.target.value) || 0;
                                updateBlockContent(selectedBlock.id, { repos: newRepos });
                              }}
                              className="w-1/2 text-xs px-2 py-1 bg-background border border-border rounded"
                            />
                            <input 
                              type="number" placeholder="Forks" value={repo.forks}
                              onChange={(e) => {
                                const newRepos = [...selectedBlock.content.repos];
                                newRepos[index].forks = parseInt(e.target.value) || 0;
                                updateBlockContent(selectedBlock.id, { repos: newRepos });
                              }}
                              className="w-1/2 text-xs px-2 py-1 bg-background border border-border rounded"
                            />
                          </div>
                          <button onClick={() => {
                            const newRepos = [...selectedBlock.content.repos];
                            newRepos.splice(index, 1);
                            updateBlockContent(selectedBlock.id, { repos: newRepos });
                          }} className="text-[10px] text-destructive">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBlock.type === "skills" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-medium">Skills (comma separated)</h4>
                      <textarea
                        value={(selectedBlock.content?.skills || []).join(", ")}
                        onChange={(e) => {
                          const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                          updateBlockContent(selectedBlock.id, { skills });
                        }}
                        className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md min-h-[80px]"
                      />
                    </div>
                  )}

                  {selectedBlock.type === "social" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium">Links</h4>
                        <button 
                          onClick={() => {
                            const newLinks = [...(selectedBlock.content?.links || []), { platform: "New Link", url: "" }];
                            updateBlockContent(selectedBlock.id, { links: newLinks });
                          }}
                          className="text-[10px] bg-secondary px-2 py-1 rounded"
                        >+ Add</button>
                      </div>
                      {(selectedBlock.content?.links || []).map((link: any, index: number) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input 
                            type="text" placeholder="Platform" value={link.platform}
                            onChange={(e) => {
                              const newLinks = [...selectedBlock.content.links];
                              newLinks[index].platform = e.target.value;
                              updateBlockContent(selectedBlock.id, { links: newLinks });
                            }}
                            className="w-1/3 text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <input 
                            type="text" placeholder="URL" value={link.url}
                            onChange={(e) => {
                              const newLinks = [...selectedBlock.content.links];
                              newLinks[index].url = e.target.value;
                              updateBlockContent(selectedBlock.id, { links: newLinks });
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <button onClick={() => {
                            const newLinks = [...selectedBlock.content.links];
                            newLinks.splice(index, 1);
                            updateBlockContent(selectedBlock.id, { links: newLinks });
                          }} className="text-[10px] text-destructive">X</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBlock.type === "blog" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Section Title</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.title || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium">Posts</h4>
                        <button 
                          onClick={() => {
                            const newPosts = [...(selectedBlock.content?.posts || []), { title: "New Post", date: new Date().toLocaleDateString(), content: "" }];
                            updateBlockContent(selectedBlock.id, { posts: newPosts });
                          }}
                          className="text-[10px] bg-secondary px-2 py-1 rounded"
                        >+ Add Post</button>
                      </div>
                      {(selectedBlock.content?.posts || []).map((post: any, index: number) => (
                        <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
                          <input 
                            type="text" placeholder="Title" value={post.title}
                            onChange={(e) => {
                              const newPosts = [...selectedBlock.content.posts];
                              newPosts[index].title = e.target.value;
                              updateBlockContent(selectedBlock.id, { posts: newPosts });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <input 
                            type="text" placeholder="Date" value={post.date}
                            onChange={(e) => {
                              const newPosts = [...selectedBlock.content.posts];
                              newPosts[index].date = e.target.value;
                              updateBlockContent(selectedBlock.id, { posts: newPosts });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <textarea 
                            placeholder="Content (Markdown supported in future)" value={post.content}
                            onChange={(e) => {
                              const newPosts = [...selectedBlock.content.posts];
                              newPosts[index].content = e.target.value;
                              updateBlockContent(selectedBlock.id, { posts: newPosts });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded resize-none min-h-[60px]"
                          />
                          <button onClick={() => {
                            const newPosts = [...selectedBlock.content.posts];
                            newPosts.splice(index, 1);
                            updateBlockContent(selectedBlock.id, { posts: newPosts });
                          }} className="text-[10px] text-destructive">Remove Post</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBlock.type === "contact" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Title</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.title || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Description</label>
                        <input 
                          type="text" 
                          value={selectedBlock.content?.description || ""} 
                          onChange={(e) => updateBlockContent(selectedBlock.id, { description: e.target.value })}
                          className="w-full text-sm px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}

                  {selectedBlock.type === "testimonials" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium">Testimonials</h4>
                        <button 
                          onClick={() => {
                            const newItems = [...(selectedBlock.content?.items || []), { name: "", role: "", text: "" }];
                            updateBlockContent(selectedBlock.id, { items: newItems });
                          }}
                          className="text-[10px] bg-secondary px-2 py-1 rounded"
                        >+ Add</button>
                      </div>
                      {(selectedBlock.content?.items || []).map((item: any, index: number) => (
                        <div key={index} className="p-3 border border-border rounded-md space-y-2 bg-secondary/20">
                          <input 
                            type="text" placeholder="Name" value={item.name}
                            onChange={(e) => {
                               const newItems = [...selectedBlock.content.items];
                               newItems[index].name = e.target.value;
                               updateBlockContent(selectedBlock.id, { items: newItems });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <input 
                            type="text" placeholder="Role" value={item.role}
                            onChange={(e) => {
                               const newItems = [...selectedBlock.content.items];
                               newItems[index].role = e.target.value;
                               updateBlockContent(selectedBlock.id, { items: newItems });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded"
                          />
                          <textarea 
                            placeholder="Quote text" value={item.text}
                            onChange={(e) => {
                               const newItems = [...selectedBlock.content.items];
                               newItems[index].text = e.target.value;
                               updateBlockContent(selectedBlock.id, { items: newItems });
                            }}
                            className="w-full text-xs px-2 py-1 bg-background border border-border rounded resize-none min-h-[60px]"
                          />
                          <button onClick={() => {
                             const newItems = [...selectedBlock.content.items];
                             newItems.splice(index, 1);
                             updateBlockContent(selectedBlock.id, { items: newItems });
                          }} className="text-[10px] text-destructive">Remove</button>
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
