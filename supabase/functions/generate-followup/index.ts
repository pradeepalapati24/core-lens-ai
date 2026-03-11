import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !data?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { problem, explanation, code, evaluation, domain, topic, conversationHistory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const weakAreas = [];
    if (evaluation?.scores) {
      const scores = evaluation.scores;
      const sorted = Object.entries(scores).sort((a: any, b: any) => a[1] - b[1]);
      weakAreas.push(...sorted.slice(0, 2).map(([k]) => k));
    }

    const historyContext = conversationHistory?.length > 0
      ? `\n\nPrevious follow-up conversation:\n${conversationHistory.map((h: any) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n")}`
      : "";

    const systemPrompt = `You are a senior technical interviewer conducting a follow-up discussion with a candidate.

The candidate just solved a problem and provided an explanation. Your job is to ask deeper follow-up questions that test their real understanding.

CONTEXT:
- Domain: ${domain || "General"}
- Topic: ${topic || "General"}
- Problem: ${problem || "Not provided"}
- Candidate's explanation: ${explanation || "Not provided"}
- Code submitted: ${code ? "Yes" : "No"}
- Weak areas detected: ${weakAreas.join(", ") || "None identified"}
- Evaluation score: ${evaluation?.finalScore ? (evaluation.finalScore * 10).toFixed(0) + "/100" : "N/A"}
${historyContext}

QUESTION STYLE RULES:
1. Be genuinely curious - frame questions as an interested interviewer, not an interrogator
2. Ask questions that reveal depth of understanding, not surface knowledge
3. Each question should target a DIFFERENT reasoning style
4. Questions must be specific to the problem and explanation, not generic
5. If there was previous conversation, build on the candidate's prior answers - go deeper
6. Never repeat a question that was already asked

REASONING STYLES TO USE:
- Real-world scenario: "How would this change if the system had millions of users?"
- Edge-case reasoning: "What happens if the input data is extremely large or malformed?"
- Optimization thinking: "Can this be optimized further for memory or speed?"
- Trade-off reasoning: "What trade-offs exist between this approach and alternatives?"
- System design thinking: "If used in production, what engineering challenges might appear?"
- Design implications: "How would this interact with other system components?"`;

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
          { role: "user", content: "Generate 2-3 follow-up interview questions. Return ONLY valid JSON." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_followup_questions",
              description: "Submit follow-up interview questions for the candidate",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        reasoningType: { type: "string", enum: ["real-world", "edge-case", "optimization", "trade-off", "system-design", "design-implications"] },
                        intent: { type: "string", description: "What this question is designed to test" },
                      },
                      required: ["question", "reasoningType", "intent"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_followup_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate follow-up questions" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse follow-up questions" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Follow-up generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
