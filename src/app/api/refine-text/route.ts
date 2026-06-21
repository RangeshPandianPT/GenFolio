import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, context } = body;
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    
    if (!apiKey) {
      // Fallback if no API key is provided
      return NextResponse.json({ refinedText: `(AI Refined) ${text || context}` });
    }

    const prompt = `Refine the following text to make it sound professional, engaging, and polished for a portfolio website.
    Context: ${context || 'General text'}.
    Original text: ${text || 'None'}.
    Do not add any additional commentary, just output the refined text. Keep the length roughly similar. Do not wrap in quotes.`;

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
      throw new Error('Failed to refine with Gemini API');
    }

    const data = await response.json();
    const refinedText = data.candidates[0]?.content?.parts[0]?.text || text;

    return NextResponse.json({ refinedText: refinedText.trim() });
  } catch (error) {
    console.error("Error refining text:", error);
    return NextResponse.json({ error: "Failed to refine text" }, { status: 500 });
  }
}
