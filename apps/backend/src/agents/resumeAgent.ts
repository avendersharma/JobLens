import { v4 as uuidv4 } from 'uuid';
import { parseFile, extractStructured, type ParsedResume } from '../lib/parser';
import { upsertChunks } from '../kb/knowledgeBase';

function chunkText(text: string, size = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks;
}

export interface ResumeAgentResult {
  docId: string;
  rawText: string;
  parsed: ParsedResume;
}

export async function runResumeAgent(buffer: Buffer, mimetype: string, filename: string): Promise<ResumeAgentResult> {
  const rawText = await parseFile(buffer, mimetype);
  const parsed = await extractStructured(rawText);

  const docId = uuidv4();
  const chunks = chunkText(rawText);
  await upsertChunks(chunks, { source: 'resume', docId });

  console.log(`Resume agent: indexed ${chunks.length} chunks for docId=${docId} (${filename})`);
  return { docId, rawText, parsed };
}
