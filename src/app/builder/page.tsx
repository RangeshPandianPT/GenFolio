"use client";

import { useState } from "react";
import { Layout, Type, Image as ImageIcon, Briefcase, User, Settings, Save, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Builder() {
  const [activeTab, setActiveTab] = useState("blocks");

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
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
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" />
            Publish
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
                    <div className="aspect-square rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary/50 transition-colors">
                      <Layout className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">Section</span>
                    </div>
                    <div className="aspect-square rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary/50 transition-colors">
                      <Type className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">Heading</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary/50 transition-colors">
                      <User className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">Hero / Bio</span>
                    </div>
                    <div className="aspect-square rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary/50 transition-colors">
                      <Briefcase className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">Experience</span>
                    </div>
                    <div className="aspect-square rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary/50 transition-colors">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">Gallery</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-border ring-offset-2 ring-offset-background"></div>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-rose-500 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-amber-500 cursor-pointer"></div>
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
          
          <div className="relative min-h-[800px] max-w-5xl mx-auto my-8 bg-background border border-border/40 shadow-2xl rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 border border-border border-dashed flex items-center justify-center">
                <Layout className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Your portfolio is empty</h2>
              <p className="text-sm text-muted-foreground">Drag and drop components from the sidebar to start building your portfolio.</p>
            </div>
          </div>
        </main>
        
        {/* Right Sidebar - Properties */}
        <aside className="w-64 border-l border-border glass-panel flex flex-col z-10 shrink-0">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Properties
            </h2>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">Select an element to edit its properties.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
