import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';

export interface ParsedResume {
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
  }>;
}

export async function parseFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

export async function extractStructured(text: string): Promise<ParsedResume> {
  const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = `Extract structured information from this resume text. Return ONLY valid JSON matching this schema, no markdown fences:
{
  "skills": ["string"],
  "experience": [{ "company": "string", "role": "string", "duration": "string", "bullets": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "year": "string" }],
  "projects": [{ "name": "string", "description": "string", "tech": ["string"] }]
}

Resume text:
${text}`;

  const response = await llm.invoke([new HumanMessage(prompt)]);
  const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  // Strip markdown code fences if model wraps them
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as ParsedResume;
}
