import { NextResponse } from "next/server";
import { getRelevantContext } from "@/lib/rag/knowledgeBase";
import { createServerClient } from "@/lib/supabase";

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
 * Get page information for non-product pages
 */
function getPageInfo(path: string): { name: string; description: string } | null {
  // Handle sub-paths (e.g., /sectors/commercial, /sectors/residential)
  if (path.startsWith('/sectors/')) {
    const sector = path.split('/sectors/')[1];
    const sectorNames: Record<string, string> = {
      'commercial': 'Commercial Energy Solutions',
      'residential': 'Residential Energy Solutions',
      'industrial': 'Industrial Energy Solutions',
      'government': 'Government & Public Sector Solutions',
      'smart-cities': 'Smart Cities Solutions',
    };
    
    const sectorName = sectorNames[sector] || `Sector: ${sector}`;
    return {
      name: sectorName,
      description: `the ${sectorName.toLowerCase()} page showing energy solutions and products specifically designed for ${sector} sector applications`
    };
  }
  
  // Handle product sub-paths (e.g., /products/ev-charging)
  if (path.startsWith('/products/') && !path.match(/^\/products\/[^/]+$/)) {
    // This is a category page, not a specific product
    const category = path.split('/products/')[1];
    return {
      name: `Products - ${category}`,
      description: `the products page filtered by category: ${category}`
    };
  }
  
  const pageMap: Record<string, { name: string; description: string }> = {
    '/': { 
      name: 'Home', 
      description: 'the homepage with company overview, featured products, and main navigation' 
    },
    '/products': { 
      name: 'Products', 
      description: 'the products listing page showing all available products by category' 
    },
    '/sectors': { 
      name: 'Sectors', 
      description: 'the sectors page showing energy solutions organized by industry sectors (residential, commercial, industrial, etc.)' 
    },
    '/services': { 
      name: 'Services', 
      description: 'the services page with information about installation, maintenance, and support services' 
    },
    '/about': { 
      name: 'About', 
      description: 'the about page with company information, mission, and team details' 
    },
    '/contact': { 
      name: 'Contact', 
      description: 'the contact page where users can reach out for inquiries, support, or quotes' 
    },
  };

  // Check exact match first
  if (pageMap[path]) {
    return pageMap[path];
  }

  // Check if it's a product page (already handled separately)
  if (path.match(/^\/products\/[^/]+$/)) {
    return null; // Product pages are handled via productId
  }

  return null;
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(
  context?: string,
  currentProduct?: { id: string; name: string },
  currentPagePath?: string | null
): string {
  let systemPrompt = `You are a helpful AI customer support assistant for VoltHub Electric Power Generation Services Corporation. 
You help customers with questions about products, services, pricing, specifications, installation, and warranty information.
Be friendly, professional, and concise. If you don't know something, suggest contacting the support team.

CRITICAL: You MUST ONLY use the information provided in the context below. DO NOT make up, guess, or use any contact information, phone numbers, email addresses, or other details that are not explicitly provided in the context. If contact information is requested and not in the context, say you don't have that information and suggest they visit the contact page.`;

  // Add current page context
  if (currentProduct) {
    systemPrompt += `\n\nIMPORTANT: The user is currently viewing the product page for "${currentProduct.name}" (ID: ${currentProduct.id}). 
When they ask questions like "this product", "what page am I on", "tell me about this", or "I'd like to know more about this product", 
they are referring to "${currentProduct.name}". Always assume questions about "this product" refer to "${currentProduct.name}" unless they explicitly mention a different product.`;
  } else if (currentPagePath) {
    // Handle non-product pages
    const pageInfo = getPageInfo(currentPagePath);
    if (pageInfo) {
      systemPrompt += `\n\nIMPORTANT: The user is currently on the "${pageInfo.name}" page (${currentPagePath}). 
When they ask "what page am I on", "where am I", or questions about the current page, they are referring to the "${pageInfo.name}" page. 
You can provide information about: ${pageInfo.description}`;
    }
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
  currentProduct?: { id: string; name: string },
  currentPagePath?: string | null
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context, currentProduct, currentPagePath);
  
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
  currentProduct?: { id: string; name: string },
  currentPagePath?: string | null
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(context, currentProduct, currentPagePath);

    // Prepare messages for Ollama
    const ollamaMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages.filter(m => m.role !== "system"),
    ];

    // Handle both localhost and cloud Ollama URLs
    // If base URL already includes /api (cloud), use it directly; otherwise append /api
    const apiUrl = OLLAMA_BASE_URL.includes('ollama.com') || OLLAMA_BASE_URL.endsWith('/api')
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
    const { message, conversationHistory = [], productId, currentPagePath, sessionId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Generate session ID if not provided (fallback)
    const chatSessionId = sessionId || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Ensure session exists in database
    // First check if session exists
    const { data: existingSession, error: sessionCheckError } = await supabase
      .from("chat_sessions")
      .select("id, session_id")
      .eq("session_id", chatSessionId)
      .maybeSingle();

    if (sessionCheckError && sessionCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected, other errors are real issues
      console.error("Error checking for existing session:", sessionCheckError);
    }

    if (!existingSession) {
      // Create new session - this MUST succeed before we can insert messages
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          session_id: chatSessionId,
          page_path: currentPagePath || null,
          product_id: productId || null,
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .select("id, session_id")
        .single();

      if (sessionError) {
        console.error("Error creating chat session:", sessionError);
        console.error("Session creation failed - messages cannot be saved without a session");
        console.error("Error details:", JSON.stringify(sessionError, null, 2));
        // Continue anyway - the message insert will fail and we'll log that error too
      } else {
        console.log("Created new chat session:", newSession?.session_id);
      }
    } else {
      // Update existing session
      const { error: updateError } = await supabase
        .from("chat_sessions")
        .update({
          page_path: currentPagePath || null,
          product_id: productId || null,
          last_message_at: new Date().toISOString(),
        })
        .eq("session_id", chatSessionId);

      if (updateError) {
        console.error("Error updating chat session:", updateError);
        console.error("Error details:", JSON.stringify(updateError, null, 2));
      }
    }

    // Save user message to database
    // First get session data to check if it has names
    const { data: sessionData, error: verifyError } = await supabase
      .from("chat_sessions")
      .select("session_id, first_name, last_name")
      .eq("session_id", chatSessionId)
      .maybeSingle();

    if (verifyError) {
      console.error("Error verifying session before message insert:", verifyError);
    }

    if (!sessionData) {
      console.error("Session does not exist - cannot insert message. Session ID:", chatSessionId);
      console.error("This usually means the session creation failed above.");
    }

    // Include names if session already has them (from contact form submission)
    const userMessageInsert: {
      session_id: string;
      sender: string;
      message: string;
      product_id: string | null;
      page_path: string | null;
      first_name?: string | null;
      last_name?: string | null;
    } = {
      session_id: chatSessionId,
      sender: "user",
      message: message,
      product_id: productId || null,
      page_path: currentPagePath || null,
    };

    // Add names if they exist in the session
    if (sessionData?.first_name) {
      userMessageInsert.first_name = sessionData.first_name;
    }
    if (sessionData?.last_name) {
      userMessageInsert.last_name = sessionData.last_name;
    }

    // If session has names but some messages don't, update them
    if (sessionData?.first_name || sessionData?.last_name) {
      const { error: updateExistingError } = await supabase
        .from("chat_messages")
        .update({
          first_name: sessionData.first_name || null,
          last_name: sessionData.last_name || null,
        })
        .eq("session_id", chatSessionId)
        .is("first_name", null);

      if (updateExistingError) {
        console.error("Error updating existing messages with names:", updateExistingError);
      } else {
        console.log("Updated existing messages in session with names");
      }
    }

    const { data: userMessageData, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert(userMessageInsert)
      .select();

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      console.error("Session ID:", chatSessionId);
      console.error("Error code:", userMessageError.code);
      console.error("Error message:", userMessageError.message);
      console.error("Error details:", JSON.stringify(userMessageError, null, 2));
      
      // Common error: foreign key constraint violation
      if (userMessageError.code === '23503' || userMessageError.message?.includes('foreign key')) {
        console.error("FOREIGN KEY ERROR: The chat session does not exist in the database.");
        console.error("This means the session creation failed. Check:");
        console.error("1. Does the chat_sessions table exist?");
        console.error("2. Are the RLS policies allowing inserts?");
        console.error("3. Is the Supabase connection working?");
      }
    } else {
      console.log("User message saved successfully:", userMessageData?.[0]?.id);
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

    // Get relevant context from knowledge base (with current page info)
    const context = await getRelevantContext(message, productId || null, currentPagePath || null, 5);

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

    // Call LLM (Ollama or Cloud service) with current product and page context
    const response = USE_CLOUD_LLM 
      ? await callCloudLLM(messages, context, currentProduct, currentPagePath)
      : await callOllama(messages, context, currentProduct, currentPagePath);

    // Save support response to database
    // Include names if session already has them (from contact form submission)
    const supportMessageInsert: {
      session_id: string;
      sender: string;
      message: string;
      product_id: string | null;
      page_path: string | null;
      first_name?: string | null;
      last_name?: string | null;
    } = {
      session_id: chatSessionId,
      sender: "support",
      message: response,
      product_id: productId || null,
      page_path: currentPagePath || null,
    };

    // Add names if they exist in the session (re-fetch to get latest)
    if (sessionData?.first_name) {
      supportMessageInsert.first_name = sessionData.first_name;
    }
    if (sessionData?.last_name) {
      supportMessageInsert.last_name = sessionData.last_name;
    }

    const { data: supportMessageData, error: supportMessageError } = await supabase
      .from("chat_messages")
      .insert(supportMessageInsert)
      .select();

    if (supportMessageError) {
      console.error("Error saving support message:", supportMessageError);
      console.error("Session ID:", chatSessionId);
      console.error("Error code:", supportMessageError.code);
      console.error("Error message:", supportMessageError.message);
      console.error("Error details:", JSON.stringify(supportMessageError, null, 2));
      
      // Common error: foreign key constraint violation
      if (supportMessageError.code === '23503' || supportMessageError.message?.includes('foreign key')) {
        console.error("FOREIGN KEY ERROR: The chat session does not exist in the database.");
        console.error("This means the session creation failed. Check:");
        console.error("1. Does the chat_sessions table exist?");
        console.error("2. Are the RLS policies allowing inserts?");
        console.error("3. Is the Supabase connection working?");
      }
    } else {
      console.log("Support message saved successfully:", supportMessageData?.[0]?.id);
    }

    return NextResponse.json({
      response,
      contextUsed: context.length > 0,
      sessionId: chatSessionId, // Always return session ID so client can store it
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
    const tagsUrl = OLLAMA_BASE_URL.includes('ollama.com') || OLLAMA_BASE_URL.endsWith('/api')
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
