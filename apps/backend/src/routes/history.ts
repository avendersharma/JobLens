import { Router, Response } from 'express';
import { db } from '../db/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const historyRouter = Router();

// Apply authentication to all history routes
historyRouter.use(authenticateToken);

// Get ALL job analyses across all resumes for the authenticated user
historyRouter.get('/all', async (req: AuthRequest, res: Response) => {
  try {
    // Get all jobs analyzed for this user, with their match results
    const { rows } = await db.query(
      `SELECT
        j.id as job_id,
        j.jd_text,
        j.created_at,
        mr.score,
        mr.strengths,
        mr.gaps,
        mr.recommendation,
        mr.resume_id,
        r.filename as resume_filename,
        (SELECT COUNT(*) FROM resume_suggestions WHERE job_id = j.id AND resume_id = mr.resume_id) as suggestion_count,
        (SELECT COUNT(*) FROM cover_letters WHERE job_id = j.id AND resume_id = mr.resume_id) as cover_letter_count,
        (SELECT COUNT(*) FROM interview_preps WHERE job_id = j.id AND resume_id = mr.resume_id) as interview_prep_count
      FROM jobs j
      JOIN match_results mr ON mr.job_id = j.id
      JOIN resumes r ON r.id = mr.resume_id
      WHERE j.user_id = $1
      ORDER BY j.created_at DESC`,
      [req.userId]
    );

    // Extract job title and company from JD text (first 2 lines usually)
    const history = rows.map((row) => {
      const lines = row.jd_text.split('\n').filter((l: string) => l.trim());
      const jobTitle = lines[0]?.substring(0, 100) || 'Untitled Job';
      const company = lines[1]?.substring(0, 50) || '';

      return {
        jobId: row.job_id,
        resumeId: row.resume_id,
        resumeFilename: row.resume_filename,
        jobTitle,
        company,
        matchScore: row.score,
        strengths: row.strengths,
        gaps: row.gaps,
        recommendation: row.recommendation,
        analyzedAt: row.created_at,
        hasSuggestions: row.suggestion_count > 0,
        hasCoverLetter: row.cover_letter_count > 0,
        hasInterviewPrep: row.interview_prep_count > 0,
      };
    });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get all job analyses for a resume
historyRouter.get('/:resumeId', async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.params;

    // Verify resume belongs to user
    const { rows: resumeRows } = await db.query(
      'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, req.userId]
    );

    if (resumeRows.length === 0) {
      res.status(403).json({ error: 'Resume not found or access denied' });
      return;
    }

    // Get all jobs analyzed with this resume, with their match results
    const { rows } = await db.query(
      `SELECT
        j.id as job_id,
        j.jd_text,
        j.created_at,
        mr.score,
        mr.strengths,
        mr.gaps,
        mr.recommendation,
        (SELECT COUNT(*) FROM resume_suggestions WHERE job_id = j.id AND resume_id = $1) as suggestion_count,
        (SELECT COUNT(*) FROM cover_letters WHERE job_id = j.id AND resume_id = $1) as cover_letter_count,
        (SELECT COUNT(*) FROM interview_preps WHERE job_id = j.id AND resume_id = $1) as interview_prep_count
      FROM jobs j
      JOIN match_results mr ON mr.job_id = j.id
      WHERE mr.resume_id = $1
      ORDER BY j.created_at DESC`,
      [resumeId]
    );

    // Extract job title and company from JD text (first 2 lines usually)
    const history = rows.map((row) => {
      const lines = row.jd_text.split('\n').filter((l: string) => l.trim());
      const jobTitle = lines[0]?.substring(0, 100) || 'Untitled Job';
      const company = lines[1]?.substring(0, 50) || '';

      return {
        jobId: row.job_id,
        jobTitle,
        company,
        matchScore: row.score,
        strengths: row.strengths,
        gaps: row.gaps,
        recommendation: row.recommendation,
        analyzedAt: row.created_at,
        hasSuggestions: row.suggestion_count > 0,
        hasCoverLetter: row.cover_letter_count > 0,
        hasInterviewPrep: row.interview_prep_count > 0,
      };
    });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get detailed data for a specific job analysis
historyRouter.get('/:resumeId/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobId } = req.params;

    // Verify resume belongs to user
    const { rows: resumeRows } = await db.query(
      'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, req.userId]
    );

    if (resumeRows.length === 0) {
      res.status(403).json({ error: 'Resume not found or access denied' });
      return;
    }

    // Verify job belongs to user
    const { rows: jobRows } = await db.query(
      'SELECT jd_text, created_at FROM jobs WHERE id = $1 AND user_id = $2',
      [jobId, req.userId]
    );

    if (jobRows.length === 0) {
      res.status(403).json({ error: 'Job not found or access denied' });
      return;
    }

    // Get match result
    const { rows: matchRows } = await db.query(
      'SELECT score, strengths, gaps, recommendation FROM match_results WHERE resume_id = $1 AND job_id = $2',
      [resumeId, jobId]
    );

    // Get all suggestions
    const { rows: suggestionRows } = await db.query(
      'SELECT id, suggestions_json, version, user_prompt, created_at FROM resume_suggestions WHERE resume_id = $1 AND job_id = $2 ORDER BY version ASC',
      [resumeId, jobId]
    );

    // Get all cover letters
    const { rows: coverLetterRows } = await db.query(
      'SELECT id, content, company_name, version, user_prompt, created_at FROM cover_letters WHERE resume_id = $1 AND job_id = $2 ORDER BY version ASC',
      [resumeId, jobId]
    );

    // Get interview prep
    const { rows: interviewRows } = await db.query(
      'SELECT id, questions_json, created_at FROM interview_preps WHERE resume_id = $1 AND job_id = $2',
      [resumeId, jobId]
    );

    res.json({
      job: {
        id: jobId,
        jdText: jobRows[0].jd_text,
        analyzedAt: jobRows[0].created_at,
      },
      match: matchRows[0] || null,
      suggestions: suggestionRows.map((row) => ({
        id: row.id,
        data: row.suggestions_json,
        version: row.version,
        customPrompt: row.user_prompt,
        createdAt: row.created_at,
      })),
      coverLetters: coverLetterRows.map((row) => ({
        id: row.id,
        content: row.content,
        companyName: row.company_name,
        version: row.version,
        customPrompt: row.user_prompt,
        createdAt: row.created_at,
      })),
      interviewPrep: interviewRows[0]
        ? {
            id: interviewRows[0].id,
            questions: interviewRows[0].questions_json,
            createdAt: interviewRows[0].created_at,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});
