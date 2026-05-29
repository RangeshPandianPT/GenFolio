import { NextResponse } from "next/server";

const ADJECTIVES = ["passionate", "creative", "driven", "innovative", "results-oriented", "detail-oriented"];
const ROLES = ["Full-stack Developer", "Software Engineer", "Frontend Specialist", "UI/UX Designer", "Product Builder"];
const EXPERIENCES = ["building scalable web applications", "crafting intuitive user experiences", "architecting robust backend systems", "developing modern responsive interfaces"];
const GOALS = ["always striving to deliver exceptional user experiences", "focusing on clean, maintainable code", "bridging the gap between design and engineering", "solving complex problems with elegant solutions"];
const CLOSINGS = ["Let's build something amazing together!", "I'm always open to new opportunities and collaborations.", "Check out my work below to see what I can do.", "Let's turn your ideas into reality."];

function getRandomElement(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, currentBio } = body;
    
    // In a real app with an API key, we would use fetch to call OpenAI or Gemini here.
    // e.g., await fetch('https://api.openai.com/v1/chat/completions', { ... })
    // For now, we simulate AI magic by dynamically generating a professional bio based on the input name!
    
    const adjective = getRandomElement(ADJECTIVES);
    const role = getRandomElement(ROLES);
    const experience = getRandomElement(EXPERIENCES);
    const goal = getRandomElement(GOALS);
    const closing = getRandomElement(CLOSINGS);
    
    const displayName = name && name.trim() !== "Your Name" ? name : "a professional";
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedBio = `I am ${displayName}, a ${adjective} ${role} with a focus on ${experience}. I specialize in modern web technologies, ${goal}. ${closing}`;

    return NextResponse.json({ bio: generatedBio });
  } catch (error) {
    console.error("Error generating bio:", error);
    return NextResponse.json({ error: "Failed to generate bio" }, { status: 500 });
  }
}
