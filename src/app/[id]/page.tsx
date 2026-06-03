import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioViewer } from "@/components/portfolio/PortfolioViewer";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  try {
    let docRef = doc(db, "portfolios", id);
    let docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const q = query(collection(db, "portfolios"), where("username", "==", id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        docSnap = querySnapshot.docs[0];
      }
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      const seo = data.seo || {};
      return {
        title: seo.title || "Portfolio",
        description: seo.description || "Created with GenFolio",
        openGraph: seo.ogImage ? {
          images: [{ url: seo.ogImage }],
        } : undefined,
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
    let docRef = doc(db, "portfolios", id);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const q = query(collection(db, "portfolios"), where("username", "==", id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        docSnap = querySnapshot.docs[0];
        docRef = docSnap.ref;
      }
    }

    if (docSnap.exists()) {
      portfolioData = docSnap.data();
      
      // If it has the new isPublished flag and it's false, return 404
      if (portfolioData.isPublished === false) {
        notFound();
      }

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
