import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOMAIN_KNOWLEDGE_MAP: Record<string, string[]> = {
  "data-structures": ["Arrays", "Trees", "Graphs", "Linked Lists", "Hash Maps", "Stacks", "Queues", "Heaps"],
  "algorithms": ["Dynamic Programming", "Greedy Algorithms", "Divide & Conquer", "Sorting", "Searching", "Recursion"],
  "system-design": ["Scalability", "Load Balancing", "Caching", "Database Design", "Microservices", "API Design"],
  "operating-systems": ["Process Management", "Memory Management", "CPU Scheduling", "Deadlock", "Paging", "Threading"],
  "computer-networks": ["TCP/IP", "HTTP/HTTPS", "DNS", "Routing", "OSI Model", "Network Security"],
  "digital-electronics": ["Logic Gates", "Flip Flops", "Counters", "Registers", "Boolean Algebra", "Combinational Circuits"],
  "analog-electronics": ["Op-Amps", "Transistors", "Amplifiers", "Filters", "Oscillators", "Power Supplies"],
  "embedded-systems": ["Microcontrollers", "RTOS", "GPIO", "Interrupts", "SPI", "I2C", "UART"],
  "control-systems": ["Transfer Functions", "Stability Analysis", "PID Controllers", "Root Locus", "Bode Plots"],
  "signals-systems": ["Fourier Transform", "Laplace Transform", "Z-Transform", "Convolution", "LTI Systems", "Filtering"],
  "vlsi": ["CMOS Design", "RTL Design", "FPGA", "Timing Analysis", "Physical Design", "DRC & LVS", "Floorplanning"],
  "iot": ["Sensors", "IoT Protocols", "MQTT", "CoAP", "Edge Computing", "LoRaWAN", "Device Communication"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, topic, subtopic, difficulty, domainId, topicId, subtopicId, userId } = await req.json();
    
    if (!domain || !topic || !subtopic || !difficulty) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: domain, topic, subtopic, difficulty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to serve a stored question first
    if (domainId && topicId && subtopicId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Get IDs of questions the user has already solved
        let solvedIds: string[] = [];
        if (userId) {
          const { data: solved } = await supabaseAdmin
            .from("user_solved_questions")
            .select("question_id")
            .eq("user_id", userId);
          solvedIds = (solved || []).map((s: any) => s.question_id);
        }

        // Query for an existing question matching criteria that user hasn't solved
        let query = supabaseAdmin
          .from("questions")
          .select("*")
          .eq("domain_id", domainId)
          .eq("topic_id", topicId)
          .eq("subtopic_id", subtopicId)
          .eq("difficulty", difficulty);

        if (solvedIds.length > 0) {
          query = query.not("id", "in", `(${solvedIds.join(",")})`);
        }

        const { data: existingQuestions } = await query.limit(10);

        if (existingQuestions && existingQuestions.length > 0) {
          // Pick a random one from available questions
          const picked = existingQuestions[Math.floor(Math.random() * existingQuestions.length)];
          const questionData = {
            id: picked.id,
            domain,
            topic,
            subtopic,
            difficulty: picked.difficulty,
            questionText: picked.question_text,
            learningContext: picked.learning_context || "",
            hints: picked.hints || [],
            expectedConcepts: picked.expected_concepts || [],
            createdAt: picked.created_at,
            fromStore: true,
          };
          console.log("Served stored question:", picked.id);
          return new Response(
            JSON.stringify(questionData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log("No unsolved stored questions found, generating new one");
      } catch (dbErr) {
        console.error("DB lookup failed, falling back to AI generation:", dbErr);
      }
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

    let questionData;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      questionData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid JSON response from AI");
    }

    // Generate ID and timestamp
    const questionId = crypto.randomUUID();
    questionData.id = questionId;
    questionData.createdAt = new Date().toISOString();

    // Store question in database if we have the IDs
    if (domainId && topicId && subtopicId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        await supabaseAdmin.from("questions").insert({
          id: questionId,
          domain_id: domainId,
          topic_id: topicId,
          subtopic_id: subtopicId,
          difficulty: difficulty,
          question_text: questionData.questionText,
          learning_context: questionData.learningContext || null,
          hints: questionData.hints || [],
          expected_concepts: questionData.expectedConcepts || [],
        });

        console.log("Question stored in database:", questionId);
      } catch (dbError) {
        // Log but don't fail the request if DB save fails
        console.error("Failed to store question in DB:", dbError);
      }
    }

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
