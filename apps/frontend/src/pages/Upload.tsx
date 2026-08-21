import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, apiUpload } from '../lib/api';

export default function Upload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [portfolioText, setPortfolioText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeFile || !jdText.trim()) {
      setError('Please upload your resume and provide a job description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const resumeResponse = await apiUpload('/resume/upload', formData);

      if (!resumeResponse.ok) {
        const errorData = await resumeResponse.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const resumeData = await resumeResponse.json();
      console.log('Resume upload response:', resumeData);

      if (!resumeData.docId) {
        throw new Error('Resume uploaded but no docId received');
      }

      // Run all KB ingestion in parallel after resume is uploaded
      const kbTasks: Promise<unknown>[] = [];

      if (githubUrl.trim()) {
        kbTasks.push(
          apiRequest('/kb/github', {
            method: 'POST',
            body: JSON.stringify({
              repoUrl: githubUrl.trim(),
              resumeId: resumeData.docId,
            }),
          })
        );
      }

      if (certificateFile) {
        const certForm = new FormData();
        certForm.append('certificate', certificateFile);
        certForm.append('resumeId', resumeData.docId);
        kbTasks.push(apiUpload('/kb/certificate', certForm));
      }

      if (portfolioText.trim()) {
        kbTasks.push(
          apiRequest('/kb/portfolio', {
            method: 'POST',
            body: JSON.stringify({
              resumeId: resumeData.docId,
              text: portfolioText.trim(),
            }),
          })
        );
      }

      if (kbTasks.length > 0) await Promise.all(kbTasks);

      const matchResponse = await apiRequest('/jobs/analyze', {
        method: 'POST',
        body: JSON.stringify({
          jdText,
          resumeId: resumeData.docId
        }),
      });

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.error || 'Failed to analyze job');
      }

      const matchData = await matchResponse.json();

      navigate('/dashboard', {
        state: {
          parsed: resumeData.parsed,
          resumeId: resumeData.docId,
          match: matchData,
          jobId: matchData.jobId,
          jdText: jdText,
        },
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Something went wrong. Check the console for details.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h1 className="text-2xl font-semibold">Analyze a Job</h1>

      {/* Resume upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Resume (PDF or DOCX)</label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-400 file:mr-4 file:rounded file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
        />
        {resumeFile && <p className="text-xs text-gray-400">{resumeFile.name}</p>}
      </div>

      {/* Optional context section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-300">Boost Your Match Score</p>
          <p className="text-xs text-gray-500 mt-1">Add optional context to give the AI a richer picture of your skills</p>
        </div>

        {/* GitHub repo URL */}
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-400">
            GitHub Repository <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Certificate upload */}
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-400">
            Certificate <span className="text-gray-600">(optional — PDF or image)</span>
          </label>
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:rounded file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-600"
          />
          {certificateFile && <p className="text-xs text-gray-400">{certificateFile.name}</p>}
        </div>

        {/* Portfolio / case study */}
        <div className="space-y-1.5">
          <label className="block text-sm text-gray-400">
            Portfolio / Case Study <span className="text-gray-600">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={portfolioText}
            onChange={(e) => setPortfolioText(e.target.value)}
            placeholder="Describe a project or case study — what you built, the tech stack, your role, and the impact..."
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* JD input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Job Description</label>
        <textarea
          rows={10}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Match'}
      </button>
    </form>
  );
}
