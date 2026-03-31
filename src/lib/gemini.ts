import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please configure it in the Secrets panel.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function getEnhancedExplanation(district: string, area: string, soil: string, crops: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `You are an agriculture assistant for Kerala.

User location:
District: ${district}
Area: ${area}

Soil type: ${soil}

Explain this soil in a simple, beginner-friendly way.
Mention why it is suitable for the following crops:
${crops.join(", ")}

Keep response short and clear (2-3 sentences).`
        }]
      }]
    });
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini Error (Enhanced Explanation):", error);
    return "Could not enhance explanation at this time.";
  }
}

export async function getChatResponse(message: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `You are an agriculture assistant for Kerala. 
Context: ${context}
User asked: ${message}
Provide a helpful, concise response for a farmer.`
        }]
      }]
    });
    return response.text || "I'm not sure how to answer that.";
  } catch (error) {
    console.error("Gemini Error (Chat):", error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
}

export async function getDetailedCropPlan(district: string, area: string, soil: string, crop: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `You are an expert agriculture consultant for Kerala. 
Generate a detailed crop plan for:
Crop: ${crop}
Location: ${area}, ${district}
Soil Type: ${soil}

The plan must include:
1. Planting Schedule (Best months to plant in Kerala)
2. Nutrient Management (Fertilizers and organic manure)
3. Pest Control (Common pests and organic/chemical solutions)

Keep the response structured with clear headings and bullet points. Use simple language.`
        }]
      }]
    });
    return response.text || "No crop plan available.";
  } catch (error) {
    console.error("Gemini Error (Crop Plan):", error);
    return "Could not generate crop plan at this time.";
  }
}

export async function getSoilImprovementAdvice(district: string, area: string, soil: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `You are an expert soil scientist specializing in Kerala's geography. 
Provide tailored soil enrichment and improvement advice for:
Location: ${area}, ${district}
Soil Type: ${soil}

The advice should cover:
1. Organic Amendments (Compost, green manure, etc. specific to Kerala)
2. pH Correction (If typical for this soil type)
3. Water Retention/Drainage strategies
4. Long-term sustainability tips

Keep the response structured with clear headings and bullet points. Use simple, actionable language for a farmer.`
        }]
      }]
    });
    return response.text || "No soil improvement advice available.";
  } catch (error) {
    console.error("Gemini Error (Soil Advice):", error);
    return "Could not generate soil improvement advice at this time.";
  }
}
