import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOMAIN_KNOWLEDGE_MAP: Record<string, string[]> = {
  // IT / Software Engineering
  "data-structures": ["Arrays", "Trees", "Graphs", "Linked Lists", "Hash Maps", "Stacks", "Queues", "Heaps"],
  "algorithms": ["Dynamic Programming", "Greedy Algorithms", "Divide & Conquer", "Sorting", "Searching", "Recursion"],
  "system-design": ["Scalability", "Load Balancing", "Caching", "Database Design", "Microservices", "API Design"],
  "operating-systems": ["Process Management", "Memory Management", "CPU Scheduling", "Deadlock", "Paging", "Threading"],
  "computer-networks": ["TCP/IP", "HTTP/HTTPS", "DNS", "Routing", "OSI Model", "Network Security"],
  
  // Core Electronics
  "digital-electronics": ["Logic Gates", "Flip Flops", "Counters", "Registers", "Boolean Algebra", "Combinational Circuits"],
  "analog-electronics": ["Op-Amps", "Transistors", "Amplifiers", "Filters", "Oscillators", "Power Supplies"],
  "embedded-systems": ["Microcontrollers", "RTOS", "GPIO", "Interrupts", "SPI", "I2C", "UART"],
  "control-systems": ["Transfer Functions", "Stability Analysis", "PID Controllers", "Root Locus", "Bode Plots"],
  "signals-systems": ["Fourier Transform", "Laplace Transform", "Z-Transform", "Convolution", "LTI Systems", "Filtering"],
  
  // VLSI
  "vlsi": ["CMOS Design", "RTL Design", "FPGA", "Timing Analysis", "Physical Design", "DRC & LVS", "Floorplanning"],
  
  // IoT
  "iot": ["Sensors", "IoT Protocols", "MQTT", "CoAP", "Edge Computing", "LoRaWAN", "Device Communication"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, topic, subtopic, difficulty } = await req.json();
    
    if (!domain || !topic || !subtopic || !difficulty) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: domain, topic, subtopic, difficulty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const domainTopics = DOMAIN_KNOWLEDGE_MAP[domain] || [];
    const domainContext = domainTopics.length > 0 
      ? `Valid topics for this domain include: ${domainTopics.join(", ")}`
      : "";

    const systemPrompt = `You are a technical question generator for the CoreLens platform.

Your task is to generate a technical interview question STRICTLY based on the selected domain, topic, and subtopic.

You MUST NOT generate questions outside the selected domain.

CRITICAL RULES:
1. The generated question MUST belong strictly to the given domain.
2. NEVER generate questions from other domains.
3. Questions should be appropriate for the specified difficulty level.

${domainContext}

STRICT VALIDATION:
Before generating the question, verify:
- Does this question belong to the selected domain?
- Is it appropriate for the ${difficulty} difficulty level?
- Does it cover the specified topic and subtopic?

If the question would belong to a different domain, you MUST regenerate.`;

    const userPrompt = `Generate a technical question with the following parameters:

Domain: ${domain}
Topic: ${topic}
Subtopic: ${subtopic}
Difficulty: ${difficulty}

Return the output in this exact JSON format:
{
  "domain": "${domain}",
  "topic": "${topic}",
  "subtopic": "${subtopic}",
  "difficulty": "${difficulty}",
  "questionText": "The full question text with clear problem statement, constraints, and examples if applicable",
  "learningContext": "Explain why this concept exists, where it is used in real systems, and why engineers should learn it",
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "expectedConcepts": ["Concept 1", "Concept 2", "Concept 3"]
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate question" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let questionData;
    try {
      // Remove any potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      questionData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid JSON response from AI");
    }

    // Add metadata
    questionData.id = crypto.randomUUID();
    questionData.createdAt = new Date().toISOString();

    return new Response(
      JSON.stringify(questionData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate question error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
