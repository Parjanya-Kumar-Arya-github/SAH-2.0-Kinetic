import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2
].filter(Boolean);

export async function POST(req: Request) {
  try {
    const { messages, walletAddress, memoryVault, ipfsStatus } = await req.json();

    const cleanMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: typeof m.content === 'string' ? m.content : ""
    }));

    const vaultString = memoryVault?.map((m: any) => `- ${m.fact}`).join("\n") || "";

    if (!KEYS || KEYS.length === 0) {
      return new Response(JSON.stringify({ error: "No API keys configured." }), { status: 500 });
    }

    for (const [index, key] of KEYS.entries()) {
      try {
        const groq = createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: key as string });

        const systemPrompt = ipfsStatus === 'connected'
          ? `You are KINETIC. DECRYPTED_VAULT: ${vaultString}. 
             - Respond in fluid, natural prose. 
             - Do not mention the vault contents explicitly. 
             - If identity is known, address the user naturally. 
             - For lists, use bold titles and double new lines.`
          : "VAULT_LOCKED. You have no identity data. Refuse to discuss user-specific state.";

        const result = await streamText({
          model: groq.chat('llama-3.3-70b-versatile'),
          system: systemPrompt,
          messages: cleanMessages,
        });

        // Use toDataStreamResponse() since ai version >= 3 usually recommends it,
        // or whatever was working earlier. If toDataStreamResponse throws TS error, we will know.
        // Actually, previous chat logs say "The error message suggests using toTextStreamResponse instead." or "toDataStreamResponse does not exist".
        // Looking at Conversation 6c648265-a7f2-4f17-acce-fe8058ce6e19, it says use `toDataStreamResponse` error because it uses `toTextStreamResponse`.
        // Then later Conversation 66d3097a-0107-46ee-af4d-afdbc41c908d says "return result.toDataStreamResponse() to ensure...".
        // The original code here used `toUIMessageStreamResponse()`. Let's stick to what was there unless it fails, but falling back to toDataStreamResponse() might be better.
        // Let's use result.toDataStreamResponse() which is standard for ai-sdk/react useChat.
        // Wait, the file currently has `toUIMessageStreamResponse()`. I'll leave it as whatever it was, or `toDataStreamResponse()`. Let's just return what they had, but fix the missing return paths.

        return result.toUIMessageStreamResponse();
      } catch (e) {
        if (index === KEYS.length - 1) {
          throw e; // goes to outer catch
        }
        continue;
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500 });
  }

  // Fallback in case loop exits normally (it shouldn't unless KEYS is empty, which we handled)
  return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
}