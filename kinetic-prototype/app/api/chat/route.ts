// route.ts
// This file acts as the AI backend handler for KINETIC.
// It receives user messages alongside their simulated decentralized state (wallet address, IPFS sync status, memory vault).

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Array of fallback API keys.
// The handler will attempt to use these sequentially if rate limits or authentication errors occur.
const KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2
].filter(Boolean);

export async function POST(req: Request) {
  try {
    // 1. Data Ingestion: Extract the conversation history and the user's sovereign state payload.
    const { messages, walletAddress, memoryVault, ipfsStatus } = await req.json();

    // Sanitize inbound messages to ensure robust processing by the LLM SDK.
    const cleanMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: typeof m.content === 'string' ? m.content : ""
    }));

    // Format the simulated IPFS vault contents into a bulleted string.
    const vaultString = memoryVault?.map((m: any) => `- ${m.fact}`).join("\n") || "";

    if (!KEYS || KEYS.length === 0) {
      return new Response(JSON.stringify({ error: "No API keys configured." }), { status: 500 });
    }

    // 2. Resiliency Loop: Attempt to fulfill the AI request using available API keys.
    for (const [index, key] of KEYS.entries()) {
      try {
        // Initialize the custom OpenAI-compatible client pointing to Groq's high-speed inference engine.
        const groq = createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: key as string });

        // 3. Dynamic Prompt Injection:
        // This is the core of KINETIC's logic. If the user's vector state (simulated IPFS) is connected,
        // their vault memories are seamlessly injected into the LLM's system prompt.
        // If not connected, the AI operates in a strict anonymous/"stateless" mode and refuses personalized context.
        const systemPrompt = ipfsStatus === 'connected'
          ? `You are KINETIC. DECRYPTED_VAULT: ${vaultString}. 
             - Respond in fluid, natural prose. 
             - Do not mention the vault contents explicitly. 
             - If identity is known, address the user naturally. 
             - For lists, use bold titles and double new lines.`
          : "VAULT_LOCKED. You have no identity data. Refuse to discuss user-specific state.";

        // 4. Inference Execution: Stream the completion back to the client using the lightning-fast LLaMA model on Groq.
        const result = await streamText({
          model: groq.chat('llama-3.3-70b-versatile'),
          system: systemPrompt,
          messages: cleanMessages,
        });

        // 5. Response Streaming: Return a UI-compatible stream response for smooth frontend rendering.
        // Fallback or specific SDK formatting is maintained here per previous iteration decisions.
        return result.toUIMessageStreamResponse();
      } catch (e) {
        // If the current key fails and it's not the last one, loop continues to the next key.
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