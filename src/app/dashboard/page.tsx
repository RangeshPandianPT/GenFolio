"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import Link from "next/link";
import { LayoutDashboard, Plus, Edit2, Trash2, ExternalLink, Eye, LogOut, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

type PortfolioMeta = {
  id: string;
  seo?: { title: string; description: string };
  updatedAt: string;
  views?: number;
  [key: string]: any;
};

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState<PortfolioMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchPortfolios(user.uid);
      } else {
        setUser(null);
        setLoading(false);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchPortfolios = async (userId: string) => {
    try {
      const q = query(collection(db, "portfolios"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const data: PortfolioMeta[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as PortfolioMeta);
      });
      // Sort by updatedAt descending
      data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPortfolios(data);
    } catch (error) {
      console.error("Error fetching portfolios", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "portfolios", id));
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting portfolio", error);
      alert("Failed to delete portfolio");
    }
  };

  const handleDuplicate = async (portfolio: PortfolioMeta) => {
    try {
      const { id, ...dataToCopy } = portfolio;
      const duplicatedData = {
        ...dataToCopy,
        seo: {
          ...dataToCopy.seo,
          title: `${dataToCopy.seo?.title || "Untitled"} (Copy)`
        },
        views: 0,
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "portfolios"), duplicatedData);
      setPortfolios([{ id: docRef.id, ...duplicatedData } as PortfolioMeta, ...portfolios]);
    } catch (error) {
      console.error("Error duplicating portfolio", error);
      alert("Failed to duplicate portfolio");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            G
          </div>
          <span className="text-xl font-bold tracking-tight">GenFolio Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <button onClick={() => auth.signOut()} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Portfolios</h1>
            <p className="text-muted-foreground mt-1">Manage and edit your published sites.</p>
          </div>
          <Link 
            href="/builder" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New
          </Link>
        </div>

        {portfolios.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No portfolios yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">You haven't created any portfolios. Click the button below to start building your first one!</p>
            <Link 
              href="/builder" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Building
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg truncate pr-4">
                      {portfolio.seo?.title || "Untitled Portfolio"}
                    </h3>
                    <div className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-md">
                      <Eye className="w-3 h-3" />
                      {portfolio.views || 0}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {portfolio.seo?.description || "No description set."}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Last updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-border flex justify-between items-center gap-2">
                  <a 
                    href={`/${portfolio.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-md transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                  <Link 
                    href={`/builder?id=${portfolio.id}`} 
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDuplicate(portfolio)}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    title="Duplicate Portfolio"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(portfolio.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Delete Portfolio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

