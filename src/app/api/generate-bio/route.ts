import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, currentBio } = body;
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    
    if (!apiKey) {
      // Fallback if no API key is provided
      const displayName = name && name.trim() !== "Your Name" ? name : "a professional";
      return NextResponse.json({ bio: `I am ${displayName}, a creative professional. Please add GEMINI_API_KEY to your .env file for AI generated bios!` });
    }

    const prompt = `Write a professional, engaging, and modern portfolio bio for a person named ${name || 'someone'}. 
    Current bio context (if any): ${currentBio || 'None'}.
    Make it sound confident and professional, highlighting their skills and passion. Keep it to 3-4 sentences. Do not include quotes.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate with Gemini API');
    }

    const data = await response.json();
    const generatedBio = data.candidates[0]?.content?.parts[0]?.text || "Failed to generate bio.";

    return NextResponse.json({ bio: generatedBio.trim() });
  } catch (error) {
    console.error("Error generating bio:", error);
    return NextResponse.json({ error: "Failed to generate bio" }, { status: 500 });
  }
}
