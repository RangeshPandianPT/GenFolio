import re

def patch():
    with open('src/app/[id]/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Imports
    content = content.replace(
        'import { doc, getDoc } from "firebase/firestore";',
        'import { doc, getDoc, updateDoc, increment } from "firebase/firestore";\nimport { Metadata } from "next";'
    )
    
    # Metadata Export function
    metadata_func = """
export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  try {
    const docRef = doc(db, "portfolios", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const seo = data.seo || {};
      return {
        title: seo.title || "Portfolio",
        description: seo.description || "Created with GenFolio",
      };
    }
  } catch(e) {}
  return { title: "Portfolio" };
}
"""
    content = content.replace(
        'export const revalidate = 60; // Revalidate every 60 seconds',
        'export const revalidate = 60; // Revalidate every 60 seconds\n' + metadata_func
    )

    # Analytics update inside PublishedPortfolio
    analytics_logic = """
    if (docSnap.exists()) {
      portfolioData = docSnap.data();
      // Increment view count server-side
      try {
        await updateDoc(docRef, { views: increment(1) });
      } catch(e) { console.error("Error updating views", e); }
    } else {
"""
    content = content.replace(
        """    if (docSnap.exists()) {
      portfolioData = docSnap.data();
    } else {""",
        analytics_logic
    )

    # Styling and themes
    content = content.replace(
        'const { blocks, themeColor } = portfolioData as any;',
        'const { blocks, themeColor, themeRadius, themeFont, themeMode } = portfolioData as any;'
    )
    
    style_wrapper = """
    <div 
      className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-zinc-950 text-white' : 'bg-background text-foreground'} ${themeFont || 'font-sans'}`}
      style={{ '--primary': themeColor || '#6366f1', '--radius': themeRadius || '0.5rem' } as React.CSSProperties}
    >
"""
    content = re.sub(
        r'<div \s*className="min-h-screen bg-background text-foreground"\s*style=\{\{ \'--primary\': themeColor \|\| \'#6366f1\' \} as React\.CSSProperties\}\s*>',
        style_wrapper.strip(),
        content
    )

    # New components rendering (projects, skills, social)
    new_blocks = """
            {block.type === "gallery" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8">
                {(block.content?.images || []).map((img: string, i: number) => img ? (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-md group">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : null)}
              </div>
            )}
            
            {block.type === "projects" && (
              <div className="py-8 space-y-6">
                <h3 className="text-3xl font-bold">Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(block.content?.items || []).map((p: any, i: number) => (
                    <div key={i} className="p-6 bg-secondary/10 border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-xl">{p.name}</h4>
                      <p className="text-muted-foreground mt-2">{p.desc}</p>
                      {p.link && <a href={p.link} className="text-primary mt-4 inline-block font-medium hover:underline" target="_blank" rel="noreferrer">View Project →</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {block.type === "skills" && (
              <div className="py-8 space-y-6">
                <h3 className="text-3xl font-bold">Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {(block.content?.skills || []).map((s: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {block.type === "social" && (
              <div className="py-12 flex justify-center gap-4 border-t border-border/50 mt-12">
                {(block.content?.links || []).map((link: any, i: number) => (
                  <a key={i} href={link.url} className="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-full hover:bg-secondary/80 transition-colors" target="_blank" rel="noreferrer">
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
"""
    content = re.sub(
        r'\{block\.type === "gallery" && \(.*?</div>\s*\)\}',
        new_blocks.strip(),
        content,
        flags=re.DOTALL
    )

    with open('src/app/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch()
