import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { queryKBMultiSource } from '../kb/knowledgeBase';

export interface CoverLetter {
  content: string;
  companyName: string;
}

export async function runCoverLetterAgent(
  resumeDocId: string,
  jdText: string,
  companyName?: string,
  customPrompt?: string
): Promise<CoverLetter> {
  // Retrieve relevant resume achievements from KB
  const resumeChunks = await queryKBMultiSource(jdText, ['resume', 'github', 'certificate', 'portfolio'], 5);
  const resumeContext = resumeChunks.map((c) => c.text).join('\n\n');

  // Extract company name from JD if not provided
  let detectedCompany = companyName || 'the company';
  if (!companyName) {
    // Try to extract company name from JD
    const companyMatch = jdText.match(/(?:at|for|with|join)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+is|\s+are|\.|\,|\n)/);
    if (companyMatch) {
      detectedCompany = companyMatch[1].trim();
    }
  }

  const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
  });

  let prompt = `You are an expert cover letter writer. Write a personalized, compelling cover letter for this candidate.

**Resume Context (key achievements):**
${resumeContext}

**Job Description:**
${jdText}

**Company:** ${detectedCompany}

**Instructions:**
1. Start with a strong opening that shows genuine interest in the specific role
2. Highlight 2-3 key achievements from the resume that directly address JD requirements
3. Show you understand the company/role and explain why you're a great fit
4. Be genuine and confident (not generic or desperate)
5. Keep it concise: 3-4 short paragraphs maximum (250-300 words)
6. Use "I" statements and active voice
7. End with enthusiasm and a call to action

**Format:**
- No subject line or address block (just the letter body)
- Start directly with the opening paragraph
- Use professional but warm tone
- Avoid clichés like "I am writing to apply" or "I would be a great fit"

**Important:** Make it specific to this role and company. No generic statements.`;

  if (customPrompt) {
    prompt += `\n\n**User's Additional Instruction:**
${customPrompt}`;
  }

  const response = await llm.invoke([new HumanMessage(prompt)]);
  const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  return {
    content: content.trim(),
    companyName: detectedCompany,
  };
}
