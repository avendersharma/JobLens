import multer from 'multer';
import { Router } from 'express';
import { upsertChunks } from '../kb/knowledgeBase';
import { parseFile } from '../lib/parser';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';

export const kbRouter = Router();

// Separate multer for certificates — allows PDF + images
const certUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  },
});

function chunkText(text: string, size = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks;
}

function extractRepoPath(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : null;
}

// ─── GitHub README ingestion ───────────────────────────────────────────────
kbRouter.post('/github', async (req, res) => {
  try {
    const { repoUrl, resumeId } = req.body;
    if (!repoUrl || !resumeId) {
      res.status(400).json({ error: 'repoUrl and resumeId are required' });
      return;
    }

    const repoPath = extractRepoPath(repoUrl);
    if (!repoPath) {
      res.status(400).json({ error: 'Invalid GitHub URL' });
      return;
    }

    const candidates = ['README.md', 'readme.md', 'README.rst', 'README.txt'];
    let readmeText: string | null = null;
    for (const filename of candidates) {
      const rawUrl = `https://raw.githubusercontent.com/${repoPath}/HEAD/${filename}`;
      const response = await fetch(rawUrl);
      if (response.ok) { readmeText = await response.text(); break; }
    }

    if (!readmeText) {
      res.status(404).json({ error: 'README not found in this repository' });
      return;
    }

    const cleanText = readmeText
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~]/g, '')
      .trim();

    const chunks = chunkText(cleanText);
    await upsertChunks(chunks, { source: 'github', docId: resumeId });
    console.log(`GitHub KB: indexed ${chunks.length} chunks from ${repoPath}`);

    res.json({ repoPath, chunksIndexed: chunks.length, message: `Successfully indexed README from ${repoPath}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to ingest GitHub README' });
  }
});

// ─── Certificate upload ────────────────────────────────────────────────────
kbRouter.post('/certificate', certUpload.single('certificate'), async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId || !req.file) {
      res.status(400).json({ error: 'resumeId and certificate file are required' });
      return;
    }

    const { buffer, mimetype } = req.file;
    let extractedText = '';

    if (mimetype === 'application/pdf') {
      // Reuse existing PDF parser
      extractedText = await parseFile(buffer, mimetype);
    } else {
      // Image — use Groq vision model to extract certificate details
      const llm = new ChatGroq({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        apiKey: process.env.GROQ_API_KEY,
      });

      const base64 = buffer.toString('base64');
      const response = await llm.invoke([
        new HumanMessage({
          content: [
            {
              type: 'text',
              text: 'Extract all text and information from this certificate image. Include: certificate name, issuing organization, skills/topics covered, date, and any other relevant details. Return as plain text.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimetype};base64,${base64}` },
            },
          ],
        }),
      ]);
      extractedText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    }

    if (!extractedText.trim()) {
      res.status(422).json({ error: 'Could not extract text from certificate' });
      return;
    }

    const chunks = chunkText(extractedText);
    await upsertChunks(chunks, { source: 'certificate', docId: resumeId });
    console.log(`Certificate KB: indexed ${chunks.length} chunks for resumeId=${resumeId}`);

    res.json({ chunksIndexed: chunks.length, message: 'Certificate indexed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process certificate' });
  }
});

// ─── Portfolio / case study input ─────────────────────────────────────────
kbRouter.post('/portfolio', async (req, res) => {
  try {
    const { resumeId, text } = req.body;
    if (!resumeId || !text?.trim()) {
      res.status(400).json({ error: 'resumeId and text are required' });
      return;
    }

    const chunks = chunkText(text.trim());
    await upsertChunks(chunks, { source: 'portfolio', docId: resumeId });
    console.log(`Portfolio KB: indexed ${chunks.length} chunks for resumeId=${resumeId}`);

    res.json({ chunksIndexed: chunks.length, message: 'Portfolio indexed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to index portfolio' });
  }
});
