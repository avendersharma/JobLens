import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import MatchScoreCard from '../components/MatchScoreCard';
import SkillGapChart from '../components/SkillGapChart';
import SuggestionsReport from '../components/SuggestionsReport';
import CoverLetterModal from '../components/CoverLetterModal';

interface Suggestion {
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

export default function Dashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();
  type SuggestionEntry = { data: Suggestion; version: number };
  const [suggestionHistory, setSuggestionHistory] = useState<SuggestionEntry[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [coverLetter, setCoverLetter] = useState<{ content: string; companyName: string; version: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isGeneratingInterviewPrep, setIsGeneratingInterviewPrep] = useState(false);
  const [error, setError] = useState('');
  const [coverLetterError, setCoverLetterError] = useState('');
  const [interviewError, setInterviewError] = useState('');
  const [suggestionPrompt, setSuggestionPrompt] = useState('');
  const [coverLetterPrompt, setCoverLetterPrompt] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (!state?.match) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-400">No results yet.</p>
        <button
          onClick={() => navigate('/upload')}
          className="text-indigo-400 hover:underline text-sm"
        >
          Go back to upload
        </button>
      </div>
    );
  }

  const { match, parsed, resumeId, jobId, jdText } = state;

  // Save resumeId to localStorage for history page
  if (resumeId) {
    localStorage.setItem('currentResumeId', resumeId);
  }

  async function handleGenerateSuggestions() {
    if (!resumeId || !jdText) {
      setError('Missing resume or job description data');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const res = await apiRequest('/resume/tailor', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          jobId,
          jdText,
          customPrompt: suggestionPrompt.trim() || undefined,
        }),
      });
      const data = await res.json();

      setSuggestionHistory(prev => {
        const updated = [...prev, { data: data.suggestions, version: data.version }];
        setSuggestionIndex(updated.length - 1);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateCoverLetter() {
    if (!resumeId || !jdText) {
      setError('Missing resume or job description data');
      return;
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetterError('');

    try {
      const res = await apiRequest('/jobs/cover-letter', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          jobId,
          jdText,
          companyName: companyName.trim() || undefined,
          customPrompt: coverLetterPrompt.trim() || undefined,
        }),
      });
      const data = await res.json();

      setCoverLetter({
        content: data.content,
        companyName: data.companyName,
        version: data.version,
      });
    } catch (err) {
      console.error(err);
      setCoverLetterError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  }

  async function handleGenerateInterviewPrep() {
    if (!resumeId || !jdText) {
      setError('Missing resume or job description data');
      return;
    }

    setIsGeneratingInterviewPrep(true);
    setInterviewError('');

    try {
      const res = await apiRequest('/jobs/interview-prep', {
        method: 'POST',
        body: JSON.stringify({
          resumeId,
          jobId,
          jdText,
          gaps: match.gaps,
        }),
      });
      const data = await res.json();

      navigate('/interview-prep', {
        state: { questions: data.questions },
      });
    } catch (err) {
      console.error(err);
      setInterviewError('Failed to generate interview prep. Please try again.');
    } finally {
      setIsGeneratingInterviewPrep(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Match Results</h1>
        <button
          onClick={() => navigate('/upload')}
          className="text-sm text-indigo-400 hover:underline"
        >
          Analyze another job
        </button>
      </div>

      <MatchScoreCard
        score={match.score}
        strengths={match.strengths}
        gaps={match.gaps}
        recommendation={match.recommendation}
      />

      <SkillGapChart strengths={match.strengths} gaps={match.gaps} />

      {/* Resume Suggestions Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">AI Resume Coach</h3>
              <p className="text-sm text-gray-400 mt-1">
                Get specific suggestions on how to improve your resume for this role
              </p>
            </div>
            <button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Analyzing...' : 'Get Suggestions'}
            </button>
          </div>
          <textarea
            rows={2}
            value={suggestionPrompt}
            onChange={(e) => setSuggestionPrompt(e.target.value)}
            placeholder="Optional: Add custom instructions (e.g. 'Focus on backend roles', 'I'm targeting FAANG companies')"
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {suggestionHistory.length > 0 && (
          <>
            {suggestionHistory.length > 1 && (
              <div className="flex items-center gap-3 py-2">
                <button
                  onClick={() => setSuggestionIndex(i => Math.max(0, i - 1))}
                  disabled={suggestionIndex === 0}
                  className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                <input
                  type="range"
                  min={0}
                  max={suggestionHistory.length - 1}
                  value={suggestionIndex}
                  onChange={(e) => setSuggestionIndex(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <button
                  onClick={() => setSuggestionIndex(i => Math.min(suggestionHistory.length - 1, i + 1))}
                  disabled={suggestionIndex === suggestionHistory.length - 1}
                  className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  Version {suggestionHistory[suggestionIndex].version} of {suggestionHistory[suggestionHistory.length - 1].version}
                </span>
              </div>
            )}
            <SuggestionsReport
              suggestions={suggestionHistory[suggestionIndex].data}
              version={suggestionHistory[suggestionIndex].version}
            />
          </>
        )}
      </div>

      {/* Cover Letter Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Cover Letter Generator</h3>
            <p className="text-sm text-gray-400 mt-1">
              Generate a personalized cover letter for this role
            </p>
          </div>
          <button
            onClick={handleGenerateCoverLetter}
            disabled={isGeneratingCoverLetter}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name (optional — auto-detected if blank)"
            className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={coverLetterPrompt}
            onChange={(e) => setCoverLetterPrompt(e.target.value)}
            placeholder="Custom instructions (e.g. 'Mention I'm open to relocation')"
            className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {coverLetterError && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-300">
            {coverLetterError}
          </div>
        )}
      </div>

      {/* Interview Prep Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Interview Preparation</h3>
            <p className="text-sm text-gray-400 mt-1">
              Get likely interview questions with talking points from your resume
            </p>
          </div>
          <button
            onClick={handleGenerateInterviewPrep}
            disabled={isGeneratingInterviewPrep}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingInterviewPrep ? 'Generating...' : 'Prepare for Interview'}
          </button>
        </div>
        {interviewError && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-300">
            {interviewError}
          </div>
        )}
      </div>

      {/* Cover Letter Modal */}
      {coverLetter && (
        <CoverLetterModal
          content={coverLetter.content}
          companyName={coverLetter.companyName}
          version={coverLetter.version}
          onClose={() => setCoverLetter(null)}
        />
      )}
    </div>
  );
}
