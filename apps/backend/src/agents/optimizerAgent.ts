import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { queryKBMultiSource } from '../kb/knowledgeBase';

export interface ResumeSuggestions {
  missingKeywords: string[];
  sectionsToReorder: Array<{
    section: string;
    currentPosition: string;
    suggestedPosition: string;
    reason: string;
  }>;
  bulletsToStrengthen: Array<{
    currentBullet: string;
    issue: string;
    suggestion: string;
  }>;
  skillsToEmphasize: string[];
  contentToExpand: Array<{
    section: string;
    reason: string;
  }>;
  contentToCondense: Array<{
    section: string;
    reason: string;
  }>;
  overallRecommendation: string;
}

export async function runOptimizerAgent(
  resumeDocId: string,
  jdText: string,
  customPrompt?: string
): Promise<ResumeSuggestions> {
  // Retrieve relevant resume sections from KB
  const resumeChunks = await queryKBMultiSource(jdText, ['resume', 'github', 'certificate', 'portfolio'], 5);
  const resumeContext = resumeChunks.map((c) => c.text).join('\n\n');

  const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
  });

  let prompt = `You are an expert resume coach. Analyze this resume against the job description and provide SPECIFIC, ACTIONABLE suggestions for improvement.

**Resume Content:**
${resumeContext}

**Job Description:**
${jdText}

**Your Task:**
Provide detailed suggestions on how to improve this resume for this specific job. DO NOT rewrite the resume - instead, tell them exactly what to change and why.

Return ONLY valid JSON matching this exact schema:
{
  "missingKeywords": ["keyword1", "keyword2"],
  "sectionsToReorder": [
    {
      "section": "Name of section or project",
      "currentPosition": "Where it currently appears",
      "suggestedPosition": "Where it should appear",
      "reason": "Why this change matters"
    }
  ],
  "bulletsToStrengthen": [
    {
      "currentBullet": "The existing bullet point text",
      "issue": "What's wrong with it (no metrics, too vague, etc)",
      "suggestion": "How to improve it (add metrics, be specific, etc)"
    }
  ],
  "skillsToEmphasize": ["skill1", "skill2"],
  "contentToExpand": [
    {
      "section": "Section name",
      "reason": "Why it needs more detail"
    }
  ],
  "contentToCondense": [
    {
      "section": "Section name",
      "reason": "Why it's too verbose"
    }
  ],
  "overallRecommendation": "2-3 sentence summary of the most important changes to make"
}

**Guidelines:**
- Be specific: Don't say "add metrics", say "add number of users impacted or % improvement"
- Prioritize: Focus on changes that directly address JD requirements
- Be constructive: Frame suggestions positively
- Limit to top 5-7 suggestions per category (most impactful only)`;

  if (customPrompt) {
    prompt += `\n\n**User's Additional Context:**
${customPrompt}`;
  }

  const response = await llm.invoke([new HumanMessage(prompt)]);
  const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  // Strip markdown code fences if model wraps them
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as ResumeSuggestions;
}
