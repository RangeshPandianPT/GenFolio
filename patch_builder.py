import re

def patch():
    with open('src/app/builder/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    content = content.replace(
        'import { Layout, Type, Image as ImageIcon, Briefcase, User, Settings, Save, Eye, ChevronLeft } from "lucide-react";',
        'import { Layout, Type, Image as ImageIcon, Briefcase, User, Settings, Save, Eye, ChevronLeft, Link as LinkIcon, Code, Hash, LayoutDashboard } from "lucide-react";'
    )
    content = content.replace(
        'import { collection, addDoc, doc, setDoc } from "firebase/firestore";',
        'import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";'
    )

    # 2. default content
    content = content.replace(
        'case "gallery": return { images: ["", "", ""] };\n    default: return {};',
        'case "gallery": return { images: ["", "", ""] };\n    case "projects": return { items: [{ name: "Awesome Project", desc: "Built with Next.js", link: "" }] };\n    case "skills": return { skills: ["React", "TypeScript", "Node.js"] };\n    case "social": return { links: [{ platform: "GitHub", url: "" }, { platform: "LinkedIn", url: "" }] };\n    default: return {};'
    )

    # 3. state variables
    state_vars = """
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [themeRadius, setThemeRadius] = useState('0.5rem');
  const [themeFont, setThemeFont] = useState('font-sans');
  const [themeMode, setThemeMode] = useState('light');
  const [seoConfig, setSeoConfig] = useState({ title: "My Portfolio", description: "" });
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
"""
    content = content.replace(
        "const [themeColor, setThemeColor] = useState('#6366f1');",
        state_vars
    )

    # 4. useEffect for fetching portfolio and auth
    auth_effect = """
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
          setSeoConfig(data.seo || { title: "My Portfolio", description: "" });
        }
      };
      fetchPortfolio();
    }
  }, []);
"""
    content = re.sub(
        r'useEffect\(\(\) => \{\s+const unsubscribe = onAuthStateChanged\(auth, \(user\) => \{\s+if \(user\) setUserId\(user\.uid\);\s+else setUserId\(null\);\s+\}\);\s+return \(\) => unsubscribe\(\);\s+\}, \[\]\);',
        auth_effect.strip(),
        content
    )

    # 5. savePortfolio
    save_logic = """
      const portfolioData = {
        userId,
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
      alert(`Portfolio published successfully!\\nView it at: ${window.location.origin}/${docId}`);
"""
    content = re.sub(
        r'const portfolioData = \{.*?userId,.*?themeColor,.*?blocks,.*?updatedAt: new Date\(\)\.toISOString\(\),.*?\}\;.*?const docRef = await addDoc\(collection\(db, "portfolios"\), portfolioData\);.*?alert\(`Portfolio published successfully!\\nView it at: \$\{window\.location\.origin\}/\$\{docRef\.id\}`\);',
        save_logic.strip(),
        content,
        flags=re.DOTALL
    )

    # 6. Sidebar tabs
    tabs = """
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
                onClick={() => setActiveTab("settings")}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${activeTab === "settings" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                Settings
              </button>
"""
    content = re.sub(
        r'<button.*?onClick=\{\(\) => setActiveTab\("blocks"\)\}.*?</button>\s*<button.*?onClick=\{\(\) => setActiveTab\("theme"\)\}.*?</button>',
        tabs.strip(),
        content,
        flags=re.DOTALL
    )

    # 7. Sidebar elements
    blocks_sidebar = """
                      <DraggableSidebarItem id="sidebar-bio" type="bio" label="Hero / Bio" icon={User} />
                      <DraggableSidebarItem id="sidebar-experience" type="experience" label="Experience" icon={Briefcase} />
                      <DraggableSidebarItem id="sidebar-gallery" type="gallery" label="Gallery" icon={ImageIcon} />
                      <DraggableSidebarItem id="sidebar-projects" type="projects" label="Projects" icon={Code} />
                      <DraggableSidebarItem id="sidebar-skills" type="skills" label="Skills" icon={Hash} />
                      <DraggableSidebarItem id="sidebar-social" type="social" label="Social Links" icon={LinkIcon} />
"""
    content = re.sub(
        r'<DraggableSidebarItem id="sidebar-bio" type="bio" label="Hero / Bio" icon=\{User\} />\s*<DraggableSidebarItem id="sidebar-experience" type="experience" label="Experience" icon=\{Briefcase\} />\s*<DraggableSidebarItem id="sidebar-gallery" type="gallery" label="Gallery" icon=\{ImageIcon\} />',
        blocks_sidebar.strip(),
        content
    )

    # 8. Theme panel updates + Settings panel
    theme_panel = """
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
              ) : activeTab === "settings" ? (
                <div className="space-y-6">
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
                  </div>
                </div>
"""
    content = re.sub(
        r'<div className="space-y-6">\s*<div className="space-y-3">\s*<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colors</h3>.*?</div>\s*</div>\s*</div>\s*\)\}',
        theme_panel.strip() + '\n              )}',
        content,
        flags=re.DOTALL
    )

    # 9. Previews theme wrapper logic
    preview_style = """
      <div 
        className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-zinc-950 text-white' : 'bg-background text-foreground'} ${themeFont}`}
        style={{ '--primary': themeColor, '--radius': themeRadius } as React.CSSProperties}
      >
"""
    content = re.sub(
        r'<div \s*className="min-h-screen bg-background text-foreground"\s*style=\{\{ \'--primary\': themeColor \} as React\.CSSProperties\}\s*>',
        preview_style.strip(),
        content
    )

    # Update builder styling wrapper
    builder_style = """
      <div 
        className={`min-h-screen bg-background flex flex-col overflow-hidden ${themeMode === 'dark' ? 'dark' : ''} ${themeFont}`} 
        style={{ '--primary': themeColor, '--radius': themeRadius } as React.CSSProperties}
      >
"""
    content = re.sub(
        r'<div \s*className="min-h-screen bg-background flex flex-col overflow-hidden" \s*style=\{\{ \'--primary\': themeColor \} as React\.CSSProperties\}\s*>',
        builder_style.strip(),
        content
    )

    # 10. Header Link Back to Dashboard
    header_link = """
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-border"></div>
"""
    content = re.sub(
        r'<Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">\s*<ChevronLeft className="w-4 h-4" />\s*<span className="text-sm font-medium">Back to Home</span>\s*</Link>\s*<div className="h-4 w-px bg-border"></div>',
        header_link.strip(),
        content
    )

    # 11. New properties editors for projects, skills, social
    # Since writing regex for this is hard, let's append it to the gallery block
    props_code = """
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
"""
    content = re.sub(
        r'\{selectedBlock\.type === "gallery" && \(.*?</div>\s*\)\}',
        props_code.strip(),
        content,
        flags=re.DOTALL
    )

    with open('src/app/builder/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch()
