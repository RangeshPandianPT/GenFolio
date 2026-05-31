import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Metadata } from "next";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

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


export default async function PublishedPortfolio(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  let portfolioData = null;

  try {
    const docRef = doc(db, "portfolios", id);
    const docSnap = await getDoc(docRef);


    if (docSnap.exists()) {
      portfolioData = docSnap.data();
      // Increment view count server-side
      try {
        await updateDoc(docRef, { views: increment(1) });
      } catch(e) { console.error("Error updating views", e); }
    } else {

      notFound();
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    notFound();
  }

  const { blocks, themeColor, themeRadius, themeFont, themeMode } = portfolioData as any;

  return (
    <div 
      className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-zinc-950 text-white' : 'bg-background text-foreground'} ${themeFont || 'font-sans'}`}
      style={{ '--primary': themeColor || '#6366f1', '--radius': themeRadius || '0.5rem' } as React.CSSProperties}
    >
      <div className="max-w-5xl mx-auto py-12 px-8 flex flex-col gap-6">
        {blocks?.map((block: any) => (
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
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-4 right-4">
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
