import { GoogleGenAI, Chat } from "@google/genai";
import type { PortfolioProfile, WebSource } from '../types';

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const SYSTEM_INSTRUCTION = `You are a friendly and expert financial assistant for novice investors in India. Your goal is to explain complex financial concepts in simple, easy-to-understand terms. You should provide educational content and guidance on investment products available in India (like Mutual Funds, Stocks, ETFs, Fixed Deposits, etc.). Do not provide personalized, direct financial advice. Always include a disclaimer at the end of every response stating: "This is not financial advice. Please consult with a qualified financial advisor before making any investment decisions." Keep your answers concise but informative.`;

export const initializeChat = (): Chat | null => {
  if (!ai) {
    console.error("API_KEY not set, GenAI client not initialized.");
    return null;
  }
  try {
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return chat;
  } catch (error) {
    console.error("Error initializing Gemini chat:", error);
    return null;
  }
};

export const getNewsSummary = async (): Promise<{ text: string, sources: WebSource[] }> => {
  if (!ai) throw new Error("AI not initialized. Please check your API key.");

  const response = await ai.models.generateContent({
     model: "gemini-2.5-flash",
     contents: "Summarize the latest top 3 financial news stories relevant to the Indian market. Explain their potential impact on common investments like stocks and mutual funds. Format the response using markdown.",
     config: {
       tools: [{googleSearch: {}}],
     },
  });

  const text = response.text;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources: WebSource[] = groundingChunks
    .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
    .map(chunk => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
    }));
  
  const uniqueSources = sources.filter((source, index, self) =>
    index === self.findIndex((s) => s.uri === source.uri)
  );

  return { text, sources: uniqueSources };
};

export const getPortfolioSuggestionStream = async (profile: PortfolioProfile) => {
    if (!ai) throw new Error("AI not initialized. Please check your API key.");

    const { riskTolerance, financialGoals, timeline } = profile;
    const prompt = `
    Based on the following user profile, suggest a diversified investment portfolio for an investor in India.
    - Risk Tolerance: ${riskTolerance}
    - Financial Goals: ${financialGoals.join(', ')}
    - Investment Timeline: ${timeline} years

    Provide a sample asset allocation (e.g., % in Equity, % in Debt, % in Gold).
    For each asset class, suggest 1-2 specific types of investment products available in India (e.g., for Equity, suggest Large-cap mutual funds or specific ETFs).
    Explain the reasoning behind each suggestion in simple terms.
    The response should be formatted using Markdown. Use headings for each section (e.g., ## Asset Allocation, ## Equity, ## Debt).
    Crucially, start the response with a clear disclaimer that this is a sample portfolio for educational purposes and not personalized financial advice. End with the standard disclaimer too.
    `;
    
    // Using a one-off call for this specific, structured task.
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
    
    return responseStream;
};
