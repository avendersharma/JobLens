import { v4 as uuidv4 } from 'uuid';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { upsertChunks, queryKBMultiSource } from '../kb/knowledgeBase';

export interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export async function runMatchAgent(jdText: string, resumeDocId?: string): Promise<MatchResult> {
  // Embed JD into KB
  const jdDocId = uuidv4();
  const jdChunks = jdText.match(/.{1,500}/gs) ?? [jdText];
  await upsertChunks(jdChunks, { source: 'jd', docId: jdDocId });

  // Retrieve relevant resume chunks
  const resumeChunks = await queryKBMultiSource(jdText, ['resume', 'github', 'certificate', 'portfolio'], 5);
  const resumeContext = resumeChunks.map((c) => c.text).join('\n\n');

  const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = `You are a recruiter scoring a candidate's resume against a job description.

Resume context (top relevant sections):
${resumeContext}

Job Description:
${jdText}

Return ONLY valid JSON — no markdown, no explanation:
{
  "score": <integer 0-100>,
  "strengths": ["skill or experience that matches"],
  "gaps": ["required skill or experience that is missing"],
  "recommendation": "<one sentence: overall recommendation for the candidate>"
}`;

  const response = await llm.invoke([new HumanMessage(prompt)]);
  const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as MatchResult;
}
