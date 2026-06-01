import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioViewer } from "@/components/portfolio/PortfolioViewer";

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
  const portfolioData = docSnap.data();
      // Increment view count server-side
      try {
        const today = new Date().toISOString().split('T')[0];
        await updateDoc(docRef, { 
          views: increment(1),
          [`viewStats.${today}`]: increment(1)
        });
      } catch(e) { console.error("Error updating views", e); }
    } else {

      notFound();
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    notFound();
  }

  return <PortfolioViewer portfolioData={portfolioData} />;
}
