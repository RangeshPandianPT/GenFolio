"use client";

import { useEffect, useState, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { LayoutDashboard, Plus, Edit2, Trash2, ExternalLink, Eye, LogOut, Copy, BarChart2, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type PortfolioMeta = {
  id: string;
  seo?: { title: string; description: string };
  updatedAt: string;
  views?: number;
  username?: string;
  isPublished?: boolean;
  [key: string]: any;
};

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState<PortfolioMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"portfolios" | "messages">("portfolios");
  const [messages, setMessages] = useState<any[]>([]);
  const router = useRouter();

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      let totalViews = 0;
      portfolios.forEach(p => {
        if (p.viewStats && p.viewStats[dateStr]) {
          totalViews += p.viewStats[dateStr];
        }
      });
      data.push({ date: displayDate, views: totalViews, fullDate: dateStr });
    }
    return data;
  }, [portfolios]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await Promise.all([
          fetchPortfolios(user.uid),
          fetchMessages(user.uid)
        ]);
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

  const fetchMessages = async (userId: string) => {
    try {
      const q = query(collection(db, "messages"), where("ownerId", "==", userId));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const markMessageRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "messages", id), { read: true });
      setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (error) {
      console.error("Error marking read", error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages(messages.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting message", error);
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex gap-4 mt-4 border-b border-border">
              <button 
                onClick={() => setActiveTab("portfolios")}
                className={`pb-2 px-1 font-medium transition-colors ${activeTab === "portfolios" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Portfolios
              </button>
              <button 
                onClick={() => setActiveTab("messages")}
                className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${activeTab === "messages" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Messages
                {messages.filter(m => !m.read).length > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                    {messages.filter(m => !m.read).length}
                  </span>
                )}
              </button>
            </div>
          </div>
          {activeTab === "portfolios" && (
            <Link 
              href="/builder" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New
            </Link>
          )}
        </div>

        {activeTab === "messages" && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
                <p className="text-muted-foreground">When visitors contact you through your portfolio, their messages will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`bg-card border ${msg.read ? 'border-border' : 'border-primary/50'} rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative`}>
                    {!msg.read && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />}
                    <div className="md:w-1/3 shrink-0 border-r border-border pr-6">
                      <div className="font-semibold text-lg">{msg.name}</div>
                      <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="bg-secondary/30 p-4 rounded-lg text-sm whitespace-pre-wrap">
                        {msg.message}
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        {!msg.read && (
                          <button onClick={() => markMessageRead(msg.id)} className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Mark Read
                          </button>
                        )}
                        <button onClick={() => deleteMessage(msg.id)} className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-md hover:bg-destructive/20 flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "portfolios" && (
          <>
            {portfolios.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              Analytics (Last 7 Days)
            </h2>
            <div className="bg-card border border-border rounded-xl p-6 h-[300px] shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="views" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

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
          </>
        )}
      </main>
    </div>
  );
}

