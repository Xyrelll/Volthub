import { NextResponse } from "next/server";
import { getRelevantContext } from "@/lib/rag/knowledgeBase";

/**
 * Chat API Route - Integrates with Ollama LLM (local or cloud)
 * 
 * To use this, you need to:
 * 1. Install Ollama: https://ollama.ai (for local) OR use a cloud Ollama service
 * 2. Pull a model: ollama pull llama3.2 (for local) OR select a cloud model
 * 3. Set OLLAMA_BASE_URL in .env (defaults to http://localhost:11434)
 * 4. Set OLLAMA_MODEL in .env (defaults to llama3.2, or use cloud model name like gpt-oss:20b-cloud)
 * 
 * Cloud Model Examples:
 * - gpt-oss:20b-cloud
 * - deepseek-v3.1:671b-cloud
 * - qwen3-coder:480b-cloud
 * - glm-4.6:cloud
 */

// Support multiple LLM backends
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY; // Optional API key for cloud Ollama

// Alternative: Cloud LLM services (for production)
const USE_CLOUD_LLM = process.env.USE_CLOUD_LLM === 'true';
const CLOUD_LLM_PROVIDER = process.env.CLOUD_LLM_PROVIDER || 'ollama'; // 'ollama', 'openrouter', 'together', 'huggingface'
const CLOUD_LLM_API_KEY = process.env.CLOUD_LLM_API_KEY;
const CLOUD_LLM_MODEL = process.env.CLOUD_LLM_MODEL || OLLAMA_MODEL;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(
  context?: string,
  currentProduct?: { id: string; name: string }
): string {
  let systemPrompt = `You are a helpful AI customer support assistant for VoltHub Electric Power Generation Services Corporation. 
You help customers with questions about products, services, pricing, specifications, installation, and warranty information.
Be friendly, professional, and concise. If you don't know something, suggest contacting the support team.

CRITICAL: You MUST ONLY use the information provided in the context below. DO NOT make up, guess, or use any contact information, phone numbers, email addresses, or other details that are not explicitly provided in the context. If contact information is requested and not in the context, say you don't have that information and suggest they visit the contact page.`;

  // Add current page context if user is viewing a product
  if (currentProduct) {
    systemPrompt += `\n\nIMPORTANT: The user is currently viewing the product page for "${currentProduct.name}" (ID: ${currentProduct.id}). 
When they ask questions like "this product", "what page am I on", "tell me about this", or "I'd like to know more about this product", 
they are referring to "${currentProduct.name}". Always assume questions about "this product" refer to "${currentProduct.name}" unless they explicitly mention a different product.`;
  }

  if (context) {
    systemPrompt += `\n\nUse ONLY the following context to answer questions. DO NOT use any information not found in this context:\n\n${context}\n\nRemember: Only use information from the context above. Never make up contact details, phone numbers, or email addresses.`;
  } else {
    systemPrompt += `\n\nIMPORTANT: You do not have access to specific contact information. If asked about contact details, direct users to the contact page on the website.`;
  }

  return systemPrompt;
}

/**
 * Call Cloud LLM API (OpenRouter, Together AI, etc.)
 */
async function callCloudLLM(
  messages: ChatMessage[],
  context?: string,
  currentProduct?: { id: string; name: string }
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context, currentProduct);
  
  const allMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.filter(m => m.role !== "system"),
  ];

  try {
    if (CLOUD_LLM_PROVIDER === 'openrouter') {
      // OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CLOUD_LLM_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://volthubssupabase.app.netlify",
        },
        body: JSON.stringify({
          model: CLOUD_LLM_MODEL,
          messages: allMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } else if (CLOUD_LLM_PROVIDER === 'together') {
      // Together AI API
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CLOUD_LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: CLOUD_LLM_MODEL,
          messages: allMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Together AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } else if (CLOUD_LLM_PROVIDER === 'huggingface') {
      // Hugging Face Inference API
      // Format messages for instruction-tuned models (works with Llama, Mistral, etc.)
      const systemMessage = allMessages.find(m => m.role === 'system')?.content || '';
      const conversationMessages = allMessages.filter(m => m.role !== 'system');
      
      // Build prompt in a format that works with most instruction models
      let prompt = systemMessage ? `${systemMessage}\n\n` : '';
      
      // Add conversation history
      for (const msg of conversationMessages) {
        if (msg.role === 'user') {
          prompt += `User: ${msg.content}\n\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n\n`;
        }
      }
      
      // Add final assistant prompt
      prompt += 'Assistant:';
      
      const response = await fetch(`https://api-inference.huggingface.co/models/${CLOUD_LLM_MODEL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CLOUD_LLM_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: 0.7,
            max_new_tokens: 500,
            return_full_text: false,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If model is loading, provide helpful error
        if (response.status === 503) {
          const retryAfter = response.headers.get('Retry-After') || '10';
          throw new Error(`Model is loading. Please wait ${retryAfter} seconds and try again.`);
        }
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let generatedText = '';
      if (Array.isArray(data)) {
        generatedText = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        generatedText = data.generated_text;
      }
      
      // Clean up the response (remove prompt if included)
      if (generatedText) {
        // Remove the prompt part if model returned full text
        const cleaned = generatedText.replace(prompt, '').trim();
        return cleaned || "I apologize, but I couldn't generate a response.";
      }
      
      return "I apologize, but I couldn't generate a response.";
    } else {
      throw new Error(`Unsupported cloud LLM provider: ${CLOUD_LLM_PROVIDER}`);
    }
  } catch (error) {
    console.error(`Error calling ${CLOUD_LLM_PROVIDER}:`, error);
    throw error;
  }
}

/**
 * Call Ollama API (local or cloud)
 */
async function callOllama(
  messages: ChatMessage[],
  context?: string,
  currentProduct?: { id: string; name: string }
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(context, currentProduct);

    // Prepare messages for Ollama
    const ollamaMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages.filter(m => m.role !== "system"),
    ];

    // Handle both localhost and cloud Ollama URLs
    const apiUrl = OLLAMA_BASE_URL.includes('ollama.com') 
      ? `${OLLAMA_BASE_URL}/chat`  // Cloud API: https://ollama.com/api/chat
      : `${OLLAMA_BASE_URL}/api/chat`;  // Local: http://localhost:11434/api/chat
    
    // Prepare headers with API key if provided
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Add API key for cloud Ollama (if provided)
    if (OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling Ollama:", error);
    throw error;
  }
}

/**
 * POST /api/chat - Handle chat messages
 */
export async function POST(request: Request) {
  try {
    const { message, conversationHistory = [], productId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get current product info if productId is provided
    let currentProduct: { id: string; name: string } | undefined;
    if (productId) {
      const { getProductById } = await import("@/lib/rag/knowledgeBase");
      const product = await getProductById(productId);
      if (product) {
        currentProduct = { id: product.id, name: product.name };
      }
    }

    // Get relevant context from knowledge base
    const context = await getRelevantContext(message, productId || null, 5);

    // Build conversation history
    interface ConversationMessage {
      sender: "user" | "support";
      text: string;
    }
    const messages: ChatMessage[] = conversationHistory.map((msg: ConversationMessage) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Call LLM (Ollama or Cloud service) with current product context
    const response = USE_CLOUD_LLM 
      ? await callCloudLLM(messages, context, currentProduct)
      : await callOllama(messages, context, currentProduct);

    return NextResponse.json({
      response,
      contextUsed: context.length > 0,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if Ollama is not running
    if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "LLM service unavailable",
          message: "Ollama is not running. Please start Ollama and ensure a model is installed.",
          details: `Make sure Ollama is running at ${OLLAMA_BASE_URL} and model ${OLLAMA_MODEL} is installed.`,
        },
        { status: 503 }
      );
    }

      return NextResponse.json(
        {
          error: "Failed to generate response",
          message: errorMessage || "An unexpected error occurred",
        },
        { status: 500 }
      );
  }
}

/**
 * GET /api/chat - Health check
 */
export async function GET() {
  try {
    // Check if Ollama is available
    // Handle both localhost and cloud Ollama URLs
    const tagsUrl = OLLAMA_BASE_URL.includes('ollama.com')
      ? `${OLLAMA_BASE_URL}/tags`  // Cloud API: https://ollama.com/api/tags
      : `${OLLAMA_BASE_URL}/api/tags`;  // Local: http://localhost:11434/api/tags
    
    // Prepare headers with API key if provided
    const headers: HeadersInit = {};
    
    // Add API key for cloud Ollama (if provided)
    if (OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }
    
    const response = await fetch(tagsUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "unavailable",
          message: "Ollama is not running or not accessible",
        },
        { status: 503 }
      );
    }

    const data = await response.json() as { models?: Array<{ name: string }> };
    const models = data.models || [];
    const hasModel = models.some((m) => m.name.includes(OLLAMA_MODEL));

    return NextResponse.json({
      status: "available",
      ollamaUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      modelsInstalled: models.map((m) => m.name),
      modelAvailable: hasModel,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        message: "Cannot connect to Ollama",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
