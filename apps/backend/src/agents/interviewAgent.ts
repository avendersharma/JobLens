import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { queryKBMultiSource } from '../kb/knowledgeBase';

export interface InterviewQuestion {
  question: string;
  talkingPoint: string;
  category: 'technical' | 'behavioral' | 'gap-addressing';
}

export interface InterviewPrep {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  gapAddressing: InterviewQuestion[];
}

export async function runInterviewAgent(
  resumeDocId: string,
  jdText: string,
  gaps?: string[]
): Promise<InterviewPrep> {
  // Retrieve relevant resume sections from KB
  const resumeChunks = await queryKBMultiSource(jdText, ['resume', 'github', 'certificate', 'portfolio'], 5);
  const resumeContext = resumeChunks.map((c) => c.text).join('\n\n');

  const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
  });

  const gapsText = gaps && gaps.length > 0 ? gaps.join(', ') : 'None identified';

  const prompt = `You are an expert interview coach. Generate likely interview questions for this candidate based on their resume and the job description.

**Resume Context:**
${resumeContext}

**Job Description:**
${jdText}

**Identified Skill Gaps:** ${gapsText}

**Your Task:**
Generate 15 interview questions across three categories. For each question, provide a specific talking point from the candidate's resume they can use in their answer.

Return ONLY valid JSON matching this exact schema:
{
  "technical": [
    {
      "question": "The technical question text",
      "talkingPoint": "Specific achievement or experience from resume to mention",
      "category": "technical"
    }
  ],
  "behavioral": [
    {
      "question": "The behavioral question text (STAR format)",
      "talkingPoint": "Specific example from resume they can use",
      "category": "behavioral"
    }
  ],
  "gapAddressing": [
    {
      "question": "Question about a skill gap or missing requirement",
      "talkingPoint": "How to address this gap using related experience",
      "category": "gap-addressing"
    }
  ]
}

**Guidelines:**
1. **Technical Questions (5 questions):**
   - Focus on technologies, tools, and methodologies mentioned in the JD
   - Ask about depth of experience, problem-solving, and best practices
   - Examples: "Explain your approach to X", "How have you handled Y scenario?"

2. **Behavioral Questions (5 questions):**
   - Use STAR format prompts (Situation, Task, Action, Result)
   - Focus on soft skills: leadership, collaboration, conflict resolution
   - Examples: "Tell me about a time when...", "Describe a situation where..."

3. **Gap-Addressing Questions (5 questions):**
   - Based on the identified skill gaps
   - Questions about missing technologies or experiences from JD
   - Talking points should show how related experience transfers

4. **Talking Points:**
   - Must be specific and from the actual resume
   - Include metrics, outcomes, or concrete examples
   - Help the candidate pivot to their strengths

**Important:** Questions should be realistic for this specific role. Talking points must be grounded in actual resume content.`;

  const response = await llm.invoke([new HumanMessage(prompt)]);
  const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  // Strip markdown code fences if model wraps them
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as InterviewPrep;
}
