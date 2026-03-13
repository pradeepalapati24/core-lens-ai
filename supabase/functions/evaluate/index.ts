import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EVALUATION_PROMPT = `You are a senior technical interviewer evaluating a candidate's solution.

Your task is to evaluate the candidate STRICTLY and objectively.

Do NOT be generous.

Your goal is to assess whether the candidate truly understands the problem.

--------------------------------------------------

INPUT

Problem Statement:
{{problem}}

Candidate Code:
{{code}}

Candidate Explanation:
{{explanation}}

Domain:
{{domain}}

Topic:
{{topic}}

--------------------------------------------------

IMPORTANT RULES

1. If the explanation repeats or paraphrases the question instead of explaining the reasoning, give a VERY LOW score.

2. If the explanation does not describe the algorithm, logic, or reasoning process, heavily penalize the communication score.

3. If the explanation lacks step-by-step reasoning, reduce the understanding score.

4. If the code is incomplete or not logically correct, reduce algorithmic thinking and code quality scores.

5. If no edge cases are discussed, edge case score must be low.

6. If the explanation is vague, generic, or copied from the problem statement, treat it as poor reasoning.

7. If the candidate only pastes code without explanation, communication score must be very low.

8. If explanation quality is poor, the final score must be significantly reduced.

9. Never inflate scores.

--------------------------------------------------

RUBRIC

Score each category from 0 to 10.

Problem Understanding
Algorithmic Thinking
Code Quality
Edge Case Awareness
Communication Clarity
Domain Knowledge

--------------------------------------------------

SCORING GUIDELINES

0-2: Very poor understanding or explanation.
3-4: Weak explanation with missing reasoning.
5-6: Moderate understanding but incomplete reasoning.
7-8: Strong understanding with clear reasoning.
9-10: Excellent reasoning, clear explanation, and strong solution.

--------------------------------------------------

SPECIAL PENALTY RULE

If the explanation simply repeats the problem statement without reasoning:
- Communication Clarity must be ≤ 2.
- Problem Understanding must be ≤ 3.

--------------------------------------------------

FINAL SCORE CALCULATION

Understanding = 20%
AlgorithmicThinking = 20%
CodeQuality = 15%
EdgeCases = 15%
Communication = 15%
DomainKnowledge = 15%

FinalScore = (Understanding * 0.20) + (AlgorithmicThinking * 0.20) + (CodeQuality * 0.15) + (EdgeCases * 0.15) + (Communication * 0.15) + (DomainKnowledge * 0.15)

--------------------------------------------------

FEEDBACK RULES

1. Feedback must be honest, strict, and constructive. Use professional language.
2. Do not praise weak solutions.
3. If reasoning is unclear, explain specifically what is missing and what the candidate should have demonstrated.

Do NOT use harsh or dismissive phrases like "automatic failure" or "would be rejected immediately."
Instead, use clear professional feedback such as:
- "The response repeated the problem statement instead of explaining the reasoning."
- "The explanation lacks depth. A strong answer would include step-by-step logic, trade-off analysis, and concrete examples."

--------------------------------------------------

STRUCTURED FEEDBACK RULES

You MUST provide feedback in structured categories:

"whatInterviewersExpect" — List 2-4 specific things an interviewer would look for in a strong answer to THIS specific question. Be concrete.

Example for a Phase Modulation question:
- "Clear definition of Phase Modulation and how it differs from FM"
- "The mathematical expression: s(t) = Ac cos(2πfct + kp m(t))"
- "Explanation of how the phase sensitivity constant kp affects phase deviation"
- "A real-world application example"

--------------------------------------------------

STRENGTHS RULE

The "strengths" array must NEVER be empty. Even for weak answers, find at least one positive observation:
- "Attempted to address the question"
- "Identified the correct topic area"
- "Submitted code that compiles"
- "Showed awareness of the general concept"

--------------------------------------------------

COPY-PASTE / ORIGINALITY CHECK

Behavioral paste data will be provided. Analyze whether the explanation appears copy-pasted rather than authentically written by the candidate.

Signs of copy-paste:
- High paste ratio (>0.7 means most text was pasted)
- Explanation reads like documentation, textbook, or AI-generated content
- Writing style is inconsistent
- Contains formatting artifacts
- Generic explanations that don't specifically address the given problem

If you detect the explanation is likely copy-pasted:
- Set copyPasteDetected to true
- Set copyPasteConfidence to a number 0-100
- Provide a learning-oriented copyPasteReason (NOT audit-style). Example:
  "Your response appears to be copied from the prompt. In technical interviews, interviewers evaluate how clearly you can explain concepts in your own words. Try explaining step-by-step instead."
- Penalize Communication Clarity (≤ 2) and Problem Understanding (≤ 3)

If the explanation appears authentic:
- Set copyPasteDetected to false
- Set copyPasteConfidence to 0

--------------------------------------------------

REASONING DEPTH CHECK

Check for low-reasoning indicators:
- Explanation simply repeats or paraphrases the problem statement
- Very short explanations (less than 50 words of actual reasoning)
- Generic responses that could apply to any problem
- Lack of step-by-step thinking
- No mention of trade-offs, complexity, or alternatives

If you detect low reasoning:
- Set reasoningDepthScore to ≤ 3
- If explanation repeats the problem: set it to ≤ 1

--------------------------------------------------

AI LEARNING INSIGHTS

Generate 2-3 QUESTION-SPECIFIC learning insights. These must reference the actual concept being tested, not generic advice.

BAD (too generic):
- "Identify and provide mathematical derivations."
- "Practice explaining concepts clearly."

GOOD (question-specific):
- "This question required the Phase Modulation equation: s(t) = Ac cos(2πfct + kp m(t)). Your answer did not include the equation or explain how kp affects phase deviation."
- "Your explanation correctly identified the topic but missed the key distinction between PM and FM signals."
- "You demonstrated awareness of modulation concepts but should practice deriving the bandwidth formula for PM signals."

--------------------------------------------------

EXPERT EXPLANATION

The "expertExplanation" field must contain a comprehensive, interview-quality explanation of the correct answer. Include:
- Clear concept definition
- Mathematical expressions (if applicable)
- Key parameter explanations
- How the concept applies in practice
- Common misconceptions

Format using markdown with ## and ### headings, bullet points, and bold text for key terms.

--------------------------------------------------

RECOMMENDED FOCUS AREA

Identify the weakest rubric category and set recommendedFocusArea to its key name (e.g., "edgeCases", "communication", "algorithmicThinking").`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { problem, code, explanation, domain, topic, pasteMetrics } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let filledPrompt = EVALUATION_PROMPT
      .replace("{{problem}}", problem || "Not provided")
      .replace("{{code}}", code || "No code submitted")
      .replace("{{explanation}}", explanation || "No explanation provided")
      .replace("{{domain}}", domain || "General")
      .replace("{{topic}}", topic || "General");

    if (pasteMetrics) {
      filledPrompt += `\n\n--- PASTE BEHAVIORAL DATA ---\nPaste count: ${pasteMetrics.pasteCount}\nPasted characters: ${pasteMetrics.pastedChars}\nTyped characters: ${pasteMetrics.typedChars}\nTotal characters: ${pasteMetrics.totalChars}\nPaste ratio: ${(pasteMetrics.pasteRatio * 100).toFixed(1)}%\n--- END PASTE DATA ---`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: filledPrompt },
          { role: "user", content: "Evaluate the candidate's submission and return ONLY valid JSON in the exact format specified." }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_evaluation",
              description: "Submit the evaluation results for the candidate's solution.",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "object",
                    properties: {
                      understanding: { type: "number", minimum: 0, maximum: 10 },
                      algorithmicThinking: { type: "number", minimum: 0, maximum: 10 },
                      codeQuality: { type: "number", minimum: 0, maximum: 10 },
                      edgeCases: { type: "number", minimum: 0, maximum: 10 },
                      communication: { type: "number", minimum: 0, maximum: 10 },
                      domainKnowledge: { type: "number", minimum: 0, maximum: 10 }
                    },
                    required: ["understanding", "algorithmicThinking", "codeQuality", "edgeCases", "communication", "domainKnowledge"]
                  },
                  finalScore: { type: "number", minimum: 0, maximum: 10 },
                  strengths: { type: "array", items: { type: "string" }, description: "MUST have at least one item. Even weak answers should highlight something positive." },
                  weaknesses: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  whatInterviewersExpect: { type: "array", items: { type: "string" }, description: "2-4 specific things an interviewer would look for in a strong answer to THIS question." },
                  overallFeedback: { type: "string" },
                  expertExplanation: { type: "string", description: "Comprehensive interview-quality explanation with markdown formatting, equations, and parameter explanations." },
                  interviewReadinessScore: { type: "number", minimum: 0, maximum: 10 },
                  hiringProbability: { type: "number", minimum: 0, maximum: 100 },
                  copyPasteDetected: { type: "boolean" },
                  copyPasteConfidence: { type: "number", minimum: 0, maximum: 100 },
                  copyPasteReason: { type: "string", description: "Learning-oriented message, NOT audit-style. Guide the user on how to improve." },
                  reasoningDepthScore: { type: "number", minimum: 0, maximum: 10 },
                  aiLearningInsights: { type: "array", items: { type: "string" }, description: "2-3 QUESTION-SPECIFIC learning insights referencing actual concepts, equations, or techniques from this question." },
                  recommendedFocusArea: { type: "string" }
                },
                required: ["scores", "finalScore", "strengths", "weaknesses", "improvements", "whatInterviewersExpect", "overallFeedback", "expertExplanation", "interviewReadinessScore", "hiringProbability", "copyPasteDetected", "copyPasteConfidence", "reasoningDepthScore", "aiLearningInsights", "recommendedFocusArea"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_evaluation" } }
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
      return new Response(JSON.stringify({ error: "AI evaluation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const evaluation = JSON.parse(toolCall.function.arguments);
      // Ensure strengths is never empty
      if (!evaluation.strengths || evaluation.strengths.length === 0) {
        evaluation.strengths = ["You attempted the question and submitted a response."];
      }
      return new Response(JSON.stringify(evaluation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (!parsed.strengths || parsed.strengths.length === 0) {
          parsed.strengths = ["You attempted the question and submitted a response."];
        }
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse AI response:", content);
      }
    }

    return new Response(JSON.stringify({ error: "Failed to parse evaluation" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Evaluation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
