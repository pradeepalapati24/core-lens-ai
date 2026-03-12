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
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { question, answer, originalProblem, domain, topic, reasoningType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior technical interviewer evaluating a candidate's follow-up answer.

Original Problem: ${originalProblem || "Not provided"}
Domain: ${domain || "General"}
Topic: ${topic || "General"}
Follow-up Question: ${question}
Reasoning Type Being Tested: ${reasoningType}
Candidate's Answer: ${answer}

Evaluate the candidate's follow-up answer STRICTLY. Score each category 0-10.

SCORING GUIDELINES:
0-2: Very poor, no real understanding
3-4: Weak, surface-level answer
5-6: Moderate, some understanding but gaps
7-8: Strong, clear reasoning with depth
9-10: Excellent, demonstrates mastery`;

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
          { role: "user", content: "Evaluate the follow-up answer and return structured scores." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_followup_evaluation",
              description: "Submit evaluation of a follow-up answer",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "object",
                    properties: {
                      thinkingClarity: { type: "number", minimum: 0, maximum: 10 },
                      domainKnowledge: { type: "number", minimum: 0, maximum: 10 },
                      interviewReadiness: { type: "number", minimum: 0, maximum: 10 },
                      understanding: { type: "number", minimum: 0, maximum: 10 },
                      communication: { type: "number", minimum: 0, maximum: 10 },
                      edgeCases: { type: "number", minimum: 0, maximum: 10 },
                    },
                    required: ["thinkingClarity", "domainKnowledge", "interviewReadiness", "understanding", "communication", "edgeCases"],
                  },
                  feedback: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                },
                required: ["scores", "feedback", "strengths", "improvements"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_followup_evaluation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Follow-up evaluation failed" }), {
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

    return new Response(JSON.stringify({ error: "Failed to parse evaluation" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Follow-up evaluation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
