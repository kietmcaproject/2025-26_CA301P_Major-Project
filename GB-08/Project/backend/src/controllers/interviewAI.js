import Interview from "../models/Interview.js";
import asyncHandler from "express-async-handler";
import fetch from "node-fetch";

/**
 * @desc Generate AI-powered interview improvement suggestions
 * @route POST /api/interviews/:id/ai-suggestions
 * @access Private
 */
export const getAISuggestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Fetch interview with populated rounds and questions
  const interview = await Interview.findOne({
    _id: id,
    user: userId,
  }).populate({
    path: "rounds",
    populate: { path: "questions" },
  });

  if (!interview) {
    return res.status(404).json({ message: "Interview not found." });
  }

  // Prepare interview data for AI analysis
  const interviewData = {
    company: interview.company || "",
    role: interview.role || "",
    feedback: interview.feedback || "",
    nextSteps: interview.nextSteps || "",
    rounds: interview.rounds?.map((round) => ({
      roundName: round.roundName || "",
      type: round.type || "",
      status: round.status || "",
      feedback: round.feedback || "",
      questions: round.questions?.map((q) => ({
        questionText: q.questionText || "",
        topics: Array.isArray(q.topics) ? q.topics : (q.topics ? [q.topics] : []),
        difficulty: q.difficulty || "medium",
        userAnswer: q.userAnswer || "",
        feedback: q.feedback || "",
      })) || [],
    })) || [],
  };

  // Use Groq API for AI suggestions (same as cold email)
  const grokApiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
  const grokApiUrl = process.env.GROK_API_URL || process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  
  if (!grokApiKey || !grokApiUrl) {
    return res.status(500).json({
      message: "AI service not configured. Please configure GROK_API_KEY (or GROQ_API_KEY) and GROK_API_URL (or GROQ_API_URL) in environment variables.",
    });
  }

  try {
    // Build AI prompt based on available data
    const prompt = buildAIPrompt(interviewData);

    // Ensure the URL ends with /chat/completions for Groq API
    let apiUrl = grokApiUrl;
    if (apiUrl.includes('api.groq.com') && !apiUrl.includes('/chat/completions')) {
      apiUrl = apiUrl.endsWith('/') 
        ? `${apiUrl}chat/completions` 
        : `${apiUrl}/chat/completions`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach. Analyze interview performance and provide actionable, personalized feedback. Return only valid JSON. Never infer interviewer thoughts when feedback is missing.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON response
    let aiResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      aiResponse = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('AI returned invalid JSON response');
    }

    res.status(200).json({
      message: "AI suggestions generated successfully",
      suggestions: aiResponse,
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return res.status(500).json({
      message: "Failed to generate AI suggestions",
      error: error.message,
    });
  }
});

/**
 * Build AI prompt based on interview data with proper mode selection
 */
function buildAIPrompt(interviewData) {
  let prompt = `Analyze this interview performance and provide personalized improvement suggestions.

INTERVIEW DETAILS:
- Company: ${interviewData.company}
- Role: ${interviewData.role}
- Overall Feedback: ${interviewData.feedback || "Not provided"}
- Next Steps: ${interviewData.nextSteps || "Not provided"}

ROUNDS AND QUESTIONS:
`;

  interviewData.rounds.forEach((round, roundIdx) => {
    prompt += `\n--- ROUND ${roundIdx + 1}: ${round.roundName} (${round.type}) ---\n`;
    prompt += `Status: ${round.status}\n`;
    
    if (round.feedback && round.feedback.trim()) {
      prompt += `Interviewer Feedback: ${round.feedback}\n`;
    } else {
      prompt += `Interviewer Feedback: NOT PROVIDED\n`;
    }

    if (round.questions && round.questions.length > 0) {
      round.questions.forEach((q, qIdx) => {
        prompt += `\nQuestion ${qIdx + 1}: ${q.questionText}\n`;
        prompt += `Topics: ${q.topics.join(', ') || 'General'}\n`;
        prompt += `Difficulty: ${q.difficulty}\n`;
        
        if (q.userAnswer && q.userAnswer.trim()) {
          prompt += `User Answer: ${q.userAnswer}\n`;
        } else {
          prompt += `User Answer: NOT PROVIDED\n`;
        }
        
        if (q.feedback && q.feedback.trim()) {
          prompt += `Question Feedback: ${q.feedback}\n`;
        } else {
          prompt += `Question Feedback: NOT PROVIDED\n`;
        }
      });
    } else {
      prompt += `Questions: None recorded\n`;
    }
  });

  prompt += `\n\nINSTRUCTIONS:
1. For each round, determine the analysis mode:
   - "feedback-aware": If interviewer feedback exists
   - "answer-only": If no feedback but user answers exist
   - "experience-based": If both are missing

2. NEVER infer or guess what the interviewer thought when feedback is missing.

3. When feedback is missing, base analysis only on:
   - The question asked
   - The user's answer (if provided)
   - Role requirements and round type
   - Common interview expectations

4. Frame gaps as "areas to strengthen" rather than failures.

5. Provide actionable, specific improvement tips.

Return ONLY valid JSON in this exact format:
{
  "summary": "Overall analysis summary (2-3 sentences)",
  "patternsObserved": ["pattern 1", "pattern 2", ...],
  "roundInsights": [
    {
      "roundName": "Round name",
      "analysisType": "feedback-aware" | "answer-only" | "experience-based",
      "strengths": ["strength 1", "strength 2", ...],
      "gaps": ["area to improve 1", "area to improve 2", ...],
      "whatCouldBeSaidInstead": ["alternative approach 1", ...],
      "improvementTips": ["tip 1", "tip 2", ...]
    }
  ],
  "improvementPlan": {
    "shortTerm": ["action 1", "action 2", ...],
    "mediumTerm": ["action 1", "action 2", ...]
  }
}

DO NOT include any text outside the JSON. Return only the JSON object.`;

  return prompt;
}

