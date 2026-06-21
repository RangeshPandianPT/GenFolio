import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    
    if (!apiKey) {
      // Fallback if no API key is provided
      return NextResponse.json({ 
        themeColor: "#6366f1",
        themeRadius: "0.5rem",
        themeFont: "font-sans",
        themeMode: "light"
      });
    }

    const aiPrompt = `Generate a website theme based on this prompt: "${prompt || 'professional and modern'}".
    Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) with the following exact keys:
    - themeColor: A hex color code (e.g., "#3b82f6"). Make sure it looks good as a primary accent color.
    - themeRadius: Either "0", "0.5rem", or "9999px".
    - themeFont: Either "font-sans", "font-serif", or "font-mono".
    - themeMode: Either "light" or "dark".`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: aiPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate with Gemini API');
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || "{}";
    
    // Clean up response if the model accidentally included markdown
    const cleanedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedTheme = JSON.parse(cleanedText);

    return NextResponse.json(parsedTheme);
  } catch (error) {
    console.error("Error generating theme:", error);
    return NextResponse.json({ error: "Failed to generate theme" }, { status: 500 });
  }
}
